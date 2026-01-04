import pandas as pd
from sqlalchemy import create_engine, text
import re
import os

def sanitize_column_name(col_name):
    # Remove special chars, keep alphanumeric and underscore
    clean = re.sub(r'[^a-zA-Z0-9_]', '_', str(col_name).strip())
    # Convert to lowercase and remove multi-underscores
    clean = re.sub(r'_+', '_', clean.lower())
    return clean.strip('_')

def process_file_and_load(file_obj, filename, table_name, db_url, dry_run=False, return_file=False):
    logs = []
    errors = []
    
    try:
        logs.append(f"Starting processing for file: {filename}")
        
        # 1. Ingestion
        if filename.endswith('.csv'):
            df = pd.read_csv(file_obj)
        elif filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file_obj)
        else:
            raise ValueError("Unsupported file format. Please upload CSV or Excel.")
        
        logs.append(f"Successfully loaded file. Found {len(df)} rows and {len(df.columns)} columns.")
        
        # 2. Cleaning & Normalization
        # Clean Headers
        original_cols = df.columns.tolist()
        df.columns = [sanitize_column_name(c) for c in df.columns]
        logs.append("Normalized column headers to snake_case.")
        
        # Clean String Data
        for col in df.select_dtypes(include=['object']):
            df[col] = df[col].astype(str).str.strip()
        logs.append("Stripped whitespace from string values.")
        
        # Drop completely empty rows
        initial_rows = len(df)
        df.dropna(how='all', inplace=True)
        dropped_rows = initial_rows - len(df)
        if dropped_rows > 0:
            logs.append(f"Removed {dropped_rows} completely empty rows.")

        # 3. Validation (Basic)
        if df.columns.duplicated().any():
            errors.append("Duplicate column names detected after normalization.")
            return {"success": False, "logs": logs, "errors": errors}
            
        if len(df) == 0:
            errors.append("Dataset is empty after cleaning.")
            return {"success": False, "logs": logs, "errors": errors}

        # Return file content if requested (for download)
        if return_file:
            return {
                "success": True,
                "csv_content": df.to_csv(index=False),
                "logs": logs
            }

        if not dry_run:
            # 4. Database Loading
            logs.append(f"Connecting to database to create table: {table_name}")
            
            engine = create_engine(db_url)
            
            # Use a transaction
            with engine.begin() as connection:
                # We replace if exists for this tool as per typical 'import' behavior
                df.to_sql(table_name, con=connection, if_exists='replace', index=False)
            
            logs.append(f"Successfully created table '{table_name}' and inserted {len(df)} rows.")
        
        return {
            "success": True,
            "tableName": table_name,
            "rowCount": len(df),
            "columns": df.columns.tolist(),
            "logs": logs,
            "errors": []
        }

    except Exception as e:
        import traceback
        logs.append("Critical failure during processing.")
        return {
            "success": False,
            "logs": logs,
            "errors": [str(e), traceback.format_exc()]
        }
