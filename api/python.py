from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import os
import traceback

# Import processor
try:
    from .processor import process_file_and_load, sanitize_column_name
except ImportError:
    from processor import process_file_and_load, sanitize_column_name

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_URL = os.environ.get("DATABASE_URL_DATA_PIPELINE", 
    "postgresql://neondb_owner:npg_oAtEjxT0ONC7@ep-soft-wind-ah63auwy-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require")

if DB_URL.startswith("postgresql://"):
    DB_URL = DB_URL.replace("postgresql://", "postgresql+psycopg2://")

@app.get("/api/python")
def health():
    return {"status": "Flagship Engine Ready"}

@app.post("/api/python/upload")
async def upload_file(
    file: UploadFile = File(...), 
    table_name: str = Form(...),
    schema: str = Form(None),
    user_id: str = Form(None),
    user_name: str = Form(None)
):
    try:
        content = await file.read()
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as f:
            f.write(content)
        
        # Parse schema if provided
        schema_obj = None
        if schema:
            import json
            schema_obj = json.loads(schema)
        
        with open(temp_path, "rb") as f:
            table = sanitize_column_name(table_name) or "imported_data"
            result = process_file_and_load(f, file.filename, table, DB_URL, schema=schema_obj)
        
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        # Record table metadata (creator info)
        if result.get("success") and user_id:
            try:
                from sqlalchemy import create_engine, text
                from datetime import datetime
                engine = create_engine(DB_URL)
                with engine.begin() as conn:
                    # Create metadata table if not exists
                    conn.execute(text("""
                        CREATE TABLE IF NOT EXISTS _table_metadata (
                            id SERIAL PRIMARY KEY,
                            table_name VARCHAR(255) UNIQUE NOT NULL,
                            created_by_id VARCHAR(255),
                            created_by_name VARCHAR(255),
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            row_count INTEGER,
                            file_name VARCHAR(255)
                        )
                    """))
                    # Insert or update metadata
                    conn.execute(text("""
                        INSERT INTO _table_metadata (table_name, created_by_id, created_by_name, row_count, file_name, created_at)
                        VALUES (:table_name, :user_id, :user_name, :row_count, :file_name, :created_at)
                        ON CONFLICT (table_name) DO UPDATE SET
                            created_by_id = :user_id,
                            created_by_name = :user_name,
                            row_count = :row_count,
                            file_name = :file_name,
                            created_at = :created_at
                    """), {
                        "table_name": table,
                        "user_id": user_id,
                        "user_name": user_name or "Unknown",
                        "row_count": result.get("rowCount", 0),
                        "file_name": file.filename,
                        "created_at": datetime.now()
                    })
                result["createdBy"] = user_name or user_id
            except Exception as meta_err:
                result["metaWarning"] = str(meta_err)
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "errors": [str(e)],
            "logs": ["❌ Error occurred", traceback.format_exc()[:800]]
        }

@app.post("/api/python/download")
async def download_file(file: UploadFile = File(...), table_name: str = Form("export")):
    try:
        content = await file.read()
        temp_path = f"temp_{file.filename}"
        
        with open(temp_path, "wb") as f:
            f.write(content)
        
        with open(temp_path, "rb") as f:
            result = process_file_and_load(f, file.filename, table_name, DB_URL, dry_run=True, return_file=True)
        
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        if result["success"]:
            return Response(
                content=result["csv_content"],
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=cleaned_{file.filename}"}
            )
        return result
        
    except Exception as e:
        return {
            "success": False,
            "errors": [str(e)],
            "logs": ["❌ Download Error", traceback.format_exc()[:800]]
        }

# === TABLE BROWSER ENDPOINTS ===
from sqlalchemy import create_engine, text

@app.get("/api/python/tables")
def list_tables():
    """List all user-created tables with creator info"""
    try:
        engine = create_engine(DB_URL)
        with engine.connect() as conn:
            # Get all tables
            result = conn.execute(text("""
                SELECT t.table_name 
                FROM information_schema.tables t
                WHERE t.table_schema = 'public' 
                AND t.table_type = 'BASE TABLE'
                AND t.table_name != '_table_metadata'
                ORDER BY t.table_name
            """))
            table_names = [row[0] for row in result]
            
            # Get metadata for tables
            tables_with_meta = []
            for tbl in table_names:
                meta = {"name": tbl, "createdBy": None, "createdAt": None, "rowCount": None}
                try:
                    meta_result = conn.execute(text("""
                        SELECT created_by_name, created_at, row_count, file_name
                        FROM _table_metadata WHERE table_name = :name
                    """), {"name": tbl})
                    row = meta_result.fetchone()
                    if row:
                        meta["createdBy"] = row[0]
                        meta["createdAt"] = row[1].isoformat() if row[1] else None
                        meta["rowCount"] = row[2]
                        meta["fileName"] = row[3]
                except:
                    pass
                tables_with_meta.append(meta)
                
        return {"success": True, "tables": tables_with_meta}
    except Exception as e:
        return {"success": False, "error": str(e), "tables": []}

@app.get("/api/python/tables/{table_name}")
def get_table_data(table_name: str, limit: int = 100):
    """Get preview data from a specific table"""
    try:
        # Sanitize table name
        safe_name = sanitize_column_name(table_name)
        if not safe_name:
            return {"success": False, "error": "Invalid table name"}
        
        engine = create_engine(DB_URL)
        with engine.connect() as conn:
            # Get column names
            cols_result = conn.execute(text(f"""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = :table_name
                ORDER BY ordinal_position
            """), {"table_name": safe_name})
            columns = [{"name": row[0], "type": row[1]} for row in cols_result]
            
            # Get data
            data_result = conn.execute(text(f'SELECT * FROM "{safe_name}" LIMIT :limit'), {"limit": limit})
            rows = [dict(row._mapping) for row in data_result]
            
            # Get row count
            count_result = conn.execute(text(f'SELECT COUNT(*) FROM "{safe_name}"'))
            total_rows = count_result.scalar()
        
        return {
            "success": True,
            "table_name": safe_name,
            "columns": columns,
            "rows": rows,
            "total_rows": total_rows,
            "showing": min(limit, total_rows)
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.delete("/api/python/tables/{table_name}")
def delete_table(table_name: str):
    """Delete a table"""
    try:
        safe_name = sanitize_column_name(table_name)
        engine = create_engine(DB_URL)
        with engine.begin() as conn:
            conn.execute(text(f'DROP TABLE IF EXISTS "{safe_name}"'))
        return {"success": True, "message": f"Table '{safe_name}' deleted"}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Vercel serverless handler
try:
    from mangum import Mangum
    handler = Mangum(app)
except ImportError:
    handler = None
