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
    schema: str = Form(None)
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
    """List all user-created tables in the database"""
    try:
        engine = create_engine(DB_URL)
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name
            """))
            tables = [row[0] for row in result]
        return {"success": True, "tables": tables}
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
