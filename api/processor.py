"""
Flagship Data Transformation Engine
- Advanced cleaning, normalization, and validation
"""

import pandas as pd
from sqlalchemy import create_engine
import re
import numpy as np
from datetime import datetime

# ============== UTILITY FUNCTIONS ==============

def sanitize_column_name(col_name):
    """Convert column name to snake_case, remove special chars"""
    clean = re.sub(r'[^a-zA-Z0-9_\s]', '', str(col_name).strip())
    clean = re.sub(r'\s+', '_', clean)
    clean = re.sub(r'_+', '_', clean.lower())
    return clean.strip('_') or 'unnamed_column'

def detect_and_convert_dates(series):
    """Try to parse various date formats"""
    date_patterns = [
        '%Y-%m-%d', '%d-%m-%Y', '%m-%d-%Y',
        '%Y/%m/%d', '%d/%m/%Y', '%m/%d/%Y',
        '%d %b %Y', '%d %B %Y', '%b %d, %Y',
        '%Y-%m-%d %H:%M:%S', '%d-%m-%Y %H:%M:%S'
    ]
    
    def try_parse(val):
        if pd.isna(val) or str(val).strip() == '':
            return None
        val_str = str(val).strip()
        for pattern in date_patterns:
            try:
                return datetime.strptime(val_str, pattern).strftime('%Y-%m-%d')
            except:
                continue
        return val_str
    
    return series.apply(try_parse)

def clean_numeric(val):
    """Remove currency symbols, commas, and convert to number"""
    if pd.isna(val):
        return None
    val_str = str(val).strip()
    # Remove common currency symbols and formatting
    val_str = re.sub(r'[₹$€£¥,\s]', '', val_str)
    # Handle parentheses for negative numbers
    if val_str.startswith('(') and val_str.endswith(')'):
        val_str = '-' + val_str[1:-1]
    try:
        return float(val_str) if '.' in val_str else int(val_str)
    except:
        return None

def validate_email(val):
    """Validate and clean email addresses"""
    if pd.isna(val) or str(val).strip() == '':
        return None
    email = str(val).strip().lower()
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return email if re.match(pattern, email) else f"INVALID:{email}"

def validate_phone(val):
    """Clean and standardize phone numbers"""
    if pd.isna(val) or str(val).strip() == '':
        return None
    phone = re.sub(r'[^\d+]', '', str(val))
    # Indian phone number standardization
    if len(phone) == 10 and phone[0] in '6789':
        return f"+91{phone}"
    elif len(phone) == 12 and phone.startswith('91'):
        return f"+{phone}"
    elif len(phone) == 13 and phone.startswith('+91'):
        return phone
    return phone if len(phone) >= 10 else f"INVALID:{val}"

def standardize_text(val):
    """Proper case, remove extra spaces, trim"""
    if pd.isna(val):
        return None
    text = str(val).strip()
    # Remove multiple spaces
    text = re.sub(r'\s+', ' ', text)
    return text

def title_case_name(val):
    """Title case for names"""
    if pd.isna(val) or str(val).strip() == '':
        return None
    return ' '.join(word.capitalize() for word in str(val).strip().split())


# ============== MAIN PROCESSING ==============

def process_file_and_load(file_obj, filename, table_name, db_url, dry_run=False, return_file=False):
    logs = []
    errors = []
    stats = {
        "original_rows": 0,
        "final_rows": 0,
        "duplicates_removed": 0,
        "empty_rows_removed": 0,
        "columns_cleaned": 0,
        "dates_standardized": 0,
        "emails_validated": 0,
        "phones_validated": 0,
        "numbers_cleaned": 0
    }
    
    try:
        logs.append("🚀 Flagship Data Engine Initialized")
        
        # ===== 1. INGESTION =====
        if filename.endswith('.csv'):
            df = pd.read_csv(file_obj, encoding='utf-8', na_values=['', 'NA', 'N/A', 'null', 'NULL', 'None', '-'])
        elif filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file_obj, na_values=['', 'NA', 'N/A', 'null', 'NULL', 'None', '-'])
        else:
            raise ValueError("Unsupported format. Use CSV or Excel.")
        
        stats["original_rows"] = len(df)
        logs.append(f"📥 Loaded {len(df)} rows × {len(df.columns)} columns")
        
        # ===== 2. COLUMN NORMALIZATION =====
        original_cols = df.columns.tolist()
        df.columns = [sanitize_column_name(c) for c in df.columns]
        stats["columns_cleaned"] = len(df.columns)
        logs.append(f"🏷️ Normalized {len(df.columns)} column headers to snake_case")
        
        # ===== 3. REMOVE COMPLETELY EMPTY ROWS =====
        initial = len(df)
        df.dropna(how='all', inplace=True)
        stats["empty_rows_removed"] = initial - len(df)
        if stats["empty_rows_removed"] > 0:
            logs.append(f"🗑️ Removed {stats['empty_rows_removed']} empty rows")
        
        # ===== 4. REMOVE DUPLICATES =====
        initial = len(df)
        df.drop_duplicates(inplace=True)
        stats["duplicates_removed"] = initial - len(df)
        if stats["duplicates_removed"] > 0:
            logs.append(f"♻️ Removed {stats['duplicates_removed']} duplicate rows")
        
        # ===== 5. SMART COLUMN PROCESSING =====
        for col in df.columns:
            sample = df[col].dropna().head(100)
            col_lower = col.lower()
            
            # Email Detection
            if 'email' in col_lower or 'mail' in col_lower:
                df[col] = df[col].apply(validate_email)
                stats["emails_validated"] += 1
                logs.append(f"📧 Validated emails in '{col}'")
            
            # Phone Detection
            elif any(x in col_lower for x in ['phone', 'mobile', 'contact', 'cell']):
                df[col] = df[col].apply(validate_phone)
                stats["phones_validated"] += 1
                logs.append(f"📱 Standardized phone numbers in '{col}'")
            
            # Date Detection
            elif any(x in col_lower for x in ['date', 'dob', 'birth', 'created', 'updated', 'joined']):
                df[col] = detect_and_convert_dates(df[col])
                stats["dates_standardized"] += 1
                logs.append(f"📅 Standardized dates in '{col}' to YYYY-MM-DD")
            
            # Name Detection (Title Case)
            elif any(x in col_lower for x in ['name', 'first', 'last', 'middle', 'student', 'teacher']):
                df[col] = df[col].apply(title_case_name)
                logs.append(f"👤 Title-cased names in '{col}'")
            
            # Numeric Detection (Price, Amount, Fee, etc.)
            elif any(x in col_lower for x in ['amount', 'price', 'fee', 'salary', 'cost', 'total', 'balance']):
                df[col] = df[col].apply(clean_numeric)
                stats["numbers_cleaned"] += 1
                logs.append(f"💰 Cleaned currency/numbers in '{col}'")
            
            # Gender Standardization
            elif 'gender' in col_lower or 'sex' in col_lower:
                gender_map = {
                    'm': 'Male', 'male': 'Male', 'man': 'Male', 'boy': 'Male',
                    'f': 'Female', 'female': 'Female', 'woman': 'Female', 'girl': 'Female',
                    'o': 'Other', 'other': 'Other'
                }
                df[col] = df[col].astype(str).str.lower().str.strip().map(gender_map).fillna(df[col])
                logs.append(f"⚧ Standardized gender values in '{col}'")
            
            # General Text Cleaning
            elif df[col].dtype == 'object':
                df[col] = df[col].apply(standardize_text)
        
        # ===== 6. FILL MISSING VALUES INDICATOR =====
        # Mark missing values explicitly for tracking
        df = df.fillna('')
        
        # ===== 7. FINAL VALIDATION =====
        if df.columns.duplicated().any():
            errors.append("⚠️ Duplicate column names after normalization")
            return {"success": False, "logs": logs, "errors": errors, "stats": stats}
        
        if len(df) == 0:
            errors.append("⚠️ Dataset empty after cleaning")
            return {"success": False, "logs": logs, "errors": errors, "stats": stats}
        
        stats["final_rows"] = len(df)
        logs.append(f"✅ Final dataset: {len(df)} rows × {len(df.columns)} columns")
        
        # ===== RETURN FILE (DOWNLOAD) =====
        if return_file:
            return {
                "success": True,
                "csv_content": df.to_csv(index=False),
                "logs": logs,
                "stats": stats
            }
        
        # ===== 8. DATABASE LOADING =====
        if not dry_run:
            logs.append(f"💾 Writing to database table: {table_name}")
            engine = create_engine(db_url)
            with engine.begin() as conn:
                df.to_sql(table_name, con=conn, if_exists='replace', index=False)
            logs.append(f"🎉 Successfully created '{table_name}' with {len(df)} records")
        
        return {
            "success": True,
            "tableName": table_name,
            "rowCount": len(df),
            "columns": df.columns.tolist(),
            "logs": logs,
            "errors": [],
            "stats": stats
        }

    except Exception as e:
        import traceback
        logs.append("❌ Critical failure during processing")
        return {
            "success": False,
            "logs": logs,
            "errors": [str(e)],
            "stats": stats
        }
