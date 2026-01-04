from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import sys

# Attempt import from neighbor file
try:
    from .processor import process_file_and_load, sanitize_column_name
except ImportError:
    from processor import process_file_and_load, sanitize_column_name

# Vercel Serverless Function entry point
app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for Vercel deployment flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get DB URL
DB_URL = os.environ.get("DATABASE_URL_DATA_PIPELINE")
if not DB_URL:
    # Fallback to the specific URL provided if env missing
    DB_URL = "postgresql://neondb_owner:npg_oAtEjxT0ONC7@ep-soft-wind-ah63auwy-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

if DB_URL and DB_URL.startswith("postgresql://"):
    DB_URL = DB_URL.replace("postgresql://", "postgresql+psycopg2://")

@app.get("/api/python")
def read_root():
    return {"status": "Vercel Python Service Running"}

@app.post("/api/python/upload")
async def upload_file(
    file: UploadFile = File(...),
    table_name: str = Form(...)
):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # On Serverless, we must use /tmp for temp files
    temp_filename = f"/tmp/{file.filename}" if os.path.exists("/tmp") else file.filename
    
    try:
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        with open(temp_filename, "rb") as f:
            sanitized_table = sanitize_column_name(table_name)
            if not sanitized_table:
                sanitized_table = "imported_data_" + sanitize_column_name(file.filename.split('.')[0])
                
            result = process_file_and_load(f, file.filename, sanitized_table, DB_URL)
            
        return result

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"success": False, "errors": [str(e)], "logs": ["Server Error"]}
    
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

from fastapi.responses import Response

@app.post("/api/python/download")
async def download_file(
    file: UploadFile = File(...),
    table_name: str = Form("export")
):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    temp_filename = f"/tmp/{file.filename}" if os.path.exists("/tmp") else file.filename
    
    try:
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        with open(temp_filename, "rb") as f:
            # We don't need DB URL for download/cleaning only, but passing it is fine or pass None if handled
            result = process_file_and_load(f, file.filename, table_name, DB_URL, dry_run=True, return_file=True)
            
        if result["success"]:
            return Response(
                content=result["csv_content"], 
                media_type="text/csv", 
                headers={"Content-Disposition": f"attachment; filename=cleaned_{file.filename}.csv"}
            )
        else:
            return result

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"success": False, "errors": [str(e)], "logs": ["Server Error"]}
    
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
