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
async def upload_file(file: UploadFile = File(...), table_name: str = Form(...)):
    try:
        # Read file content
        content = await file.read()
        
        # Save to temp file
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as f:
            f.write(content)
        
        # Process
        with open(temp_path, "rb") as f:
            table = sanitize_column_name(table_name) or "imported_data"
            result = process_file_and_load(f, file.filename, table, DB_URL)
        
        # Cleanup
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
