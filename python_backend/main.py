from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from processor import process_file_and_load, sanitize_column_name
import shutil
import os
from dotenv import load_dotenv

# Load env from parent directory
load_dotenv(dotenv_path="../.env")

app = FastAPI()

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get DB URL from env or use default (fallback provided by user)
DB_URL = os.getenv("DATABASE_URL_DATA_PIPELINE")
if not DB_URL:
    # Fallback to the specific URL provided in prompt if env reading fails
    DB_URL = "postgresql://neondb_owner:npg_oAtEjxT0ONC7@ep-soft-wind-ah63auwy-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Ensure clean string for SQLAlchemy
if DB_URL.startswith("postgresql://"):
    DB_URL = DB_URL.replace("postgresql://", "postgresql+psycopg2://")

@app.get("/")
def read_root():
    return {"status": "Python Data Pipeline Service Running"}

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    table_name: str = Form(...)
):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Create a temporary file to read
    temp_filename = f"temp_{file.filename}"
    try:
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Process
        with open(temp_filename, "rb") as f:
            sanitized_table = sanitize_column_name(table_name)
            if not sanitized_table:
                sanitized_table = "imported_data_" + sanitize_column_name(file.filename.split('.')[0])
                
            result = process_file_and_load(f, file.filename, sanitized_table, DB_URL)
            
        return result

    except Exception as e:
        return {"success": False, "errors": [str(e)], "logs": ["Server Error"]}
    
    finally:
        # Cleanup
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
