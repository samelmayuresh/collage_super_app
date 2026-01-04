"""
🔥 ULTIMATE DATA TRANSFORMATION ENGINE 🔥
Makes messy data beautiful - visible, dramatic changes guaranteed!
"""

import pandas as pd
import re
import numpy as np
from datetime import datetime
from sqlalchemy import create_engine

def sanitize_column_name(col):
    """snake_case column names"""
    if not col or pd.isna(col):
        return "column"
    clean = str(col).strip().lower()
    clean = re.sub(r'[^a-z0-9]+', '_', clean)
    clean = re.sub(r'_+', '_', clean).strip('_')
    return clean or "column"

def magic_transform(df, logs):
    """Apply dramatic, visible transformations"""
    
    # Track changes
    changes = {
        "rows_before": len(df),
        "duplicates": 0,
        "empty_removed": 0,
        "dates_fixed": 0,
        "emails_fixed": 0,
        "phones_fixed": 0,
        "names_fixed": 0,
        "numbers_fixed": 0,
        "text_cleaned": 0
    }
    
    # === 1. COLUMN HEADERS TO SNAKE_CASE ===
    old_cols = df.columns.tolist()
    df.columns = [sanitize_column_name(c) for c in df.columns]
    logs.append(f"🏷️ Renamed {len(df.columns)} columns to snake_case")
    
    # === 2. REMOVE EMPTY ROWS ===
    before = len(df)
    df = df.dropna(how='all')
    changes["empty_removed"] = before - len(df)
    if changes["empty_removed"] > 0:
        logs.append(f"🗑️ Removed {changes['empty_removed']} completely empty rows")
    
    # === 3. REMOVE DUPLICATES ===
    before = len(df)
    df = df.drop_duplicates()
    changes["duplicates"] = before - len(df)
    if changes["duplicates"] > 0:
        logs.append(f"♻️ Removed {changes['duplicates']} duplicate rows")
    
    # === 4. PROCESS EACH COLUMN BASED ON NAME/CONTENT ===
    for col in df.columns:
        col_lower = col.lower()
        
        # --- NAMES (Title Case) ---
        if any(x in col_lower for x in ['name', 'first', 'last', 'student', 'teacher', 'employee']):
            def fix_name(val):
                if pd.isna(val) or str(val).strip() == '':
                    return ''
                # Remove extra spaces, title case
                name = ' '.join(str(val).strip().split())
                return name.title()
            
            original = df[col].copy()
            df[col] = df[col].apply(fix_name)
            changed = (original != df[col]).sum()
            if changed > 0:
                changes["names_fixed"] += int(changed)
                logs.append(f"👤 Fixed {changed} names in '{col}' → Title Case")
        
        # --- EMAILS (lowercase, validate) ---
        elif any(x in col_lower for x in ['email', 'mail']):
            def fix_email(val):
                if pd.isna(val) or str(val).strip() == '':
                    return ''
                email = str(val).strip().lower()
                # Basic validation
                if '@' in email and '.' in email:
                    return email
                return f"[INVALID] {email}"
            
            original = df[col].copy()
            df[col] = df[col].apply(fix_email)
            changed = (original.astype(str).str.lower().str.strip() != df[col]).sum()
            if changed > 0:
                changes["emails_fixed"] += int(changed)
                logs.append(f"📧 Normalized {changed} emails in '{col}'")
        
        # --- PHONE NUMBERS ---
        elif any(x in col_lower for x in ['phone', 'mobile', 'cell', 'contact', 'tel']):
            def fix_phone(val):
                if pd.isna(val) or str(val).strip() == '':
                    return ''
                # Extract only digits
                digits = re.sub(r'\D', '', str(val))
                if len(digits) == 10:
                    return f"+91-{digits[:5]}-{digits[5:]}"
                elif len(digits) == 12 and digits.startswith('91'):
                    return f"+{digits[:2]}-{digits[2:7]}-{digits[7:]}"
                elif len(digits) > 0:
                    return digits
                return str(val)
            
            original = df[col].copy()
            df[col] = df[col].apply(fix_phone)
            changed = (original.astype(str) != df[col].astype(str)).sum()
            if changed > 0:
                changes["phones_fixed"] += int(changed)
                logs.append(f"📱 Formatted {changed} phone numbers in '{col}'")
        
        # --- DATES ---
        elif any(x in col_lower for x in ['date', 'dob', 'birth', 'created', 'joined', 'updated']):
            def fix_date(val):
                if pd.isna(val) or str(val).strip() == '':
                    return ''
                val_str = str(val).strip()
                
                # Try multiple date formats
                formats = [
                    '%Y-%m-%d', '%d-%m-%Y', '%m-%d-%Y', '%d/%m/%Y', '%m/%d/%Y',
                    '%Y/%m/%d', '%d %b %Y', '%d %B %Y', '%b %d, %Y', '%B %d, %Y',
                    '%d.%m.%Y', '%Y.%m.%d'
                ]
                for fmt in formats:
                    try:
                        dt = datetime.strptime(val_str, fmt)
                        return dt.strftime('%Y-%m-%d')  # ISO format
                    except:
                        continue
                
                # Try pandas parsing
                try:
                    dt = pd.to_datetime(val_str, dayfirst=True)
                    return dt.strftime('%Y-%m-%d')
                except:
                    return val_str
            
            original = df[col].copy()
            df[col] = df[col].apply(fix_date)
            changed = (original.astype(str) != df[col].astype(str)).sum()
            if changed > 0:
                changes["dates_fixed"] += int(changed)
                logs.append(f"📅 Standardized {changed} dates in '{col}' → YYYY-MM-DD")
        
        # --- GENDER ---
        elif any(x in col_lower for x in ['gender', 'sex']):
            gender_map = {
                'm': 'Male', 'male': 'Male', 'man': 'Male', 'boy': 'Male', 'M': 'Male',
                'f': 'Female', 'female': 'Female', 'woman': 'Female', 'girl': 'Female', 'F': 'Female',
                'o': 'Other', 'other': 'Other', 'O': 'Other'
            }
            original = df[col].copy()
            df[col] = df[col].astype(str).str.strip().map(lambda x: gender_map.get(x.lower(), x) if pd.notna(x) else x)
            changed = (original.astype(str) != df[col].astype(str)).sum()
            if changed > 0:
                logs.append(f"⚧️ Standardized {changed} gender values in '{col}'")
        
        # --- AMOUNTS/CURRENCY ---
        elif any(x in col_lower for x in ['amount', 'price', 'fee', 'salary', 'cost', 'total', 'balance', 'payment']):
            def fix_amount(val):
                if pd.isna(val) or str(val).strip() == '':
                    return 0.0
                val_str = str(val)
                # Remove currency symbols and commas
                val_str = re.sub(r'[₹$€£¥,\s]', '', val_str)
                # Handle negative in parentheses
                if val_str.startswith('(') and val_str.endswith(')'):
                    val_str = '-' + val_str[1:-1]
                try:
                    return float(val_str)
                except:
                    return 0.0
            
            original = df[col].copy()
            df[col] = df[col].apply(fix_amount)
            changes["numbers_fixed"] += 1
            logs.append(f"💰 Cleaned currency values in '{col}'")
        
        # --- GENERAL TEXT CLEANUP ---
        elif df[col].dtype == 'object':
            def clean_text(val):
                if pd.isna(val):
                    return ''
                text = str(val).strip()
                # Remove multiple spaces
                text = re.sub(r'\s+', ' ', text)
                # Remove leading/trailing special chars
                text = text.strip('.,;:!?')
                return text
            
            original = df[col].copy()
            df[col] = df[col].apply(clean_text)
            changed = (original.astype(str) != df[col].astype(str)).sum()
            if changed > 0:
                changes["text_cleaned"] += int(changed)
    
    if changes["text_cleaned"] > 0:
        logs.append(f"✨ Cleaned whitespace in {changes['text_cleaned']} text cells")
    
    # === 5. FILL REMAINING NaN ===
    df = df.fillna('')
    
    changes["rows_after"] = len(df)
    return df, changes

def process_file_and_load(file_obj, filename, table_name, db_url, dry_run=False, return_file=False):
    """Main processing function"""
    logs = []
    
    try:
        logs.append("🚀 ULTIMATE DATA ENGINE ACTIVATED")
        logs.append(f"📂 Processing: {filename}")
        
        # === LOAD FILE ===
        if filename.lower().endswith('.csv'):
            df = pd.read_csv(file_obj, encoding='utf-8', na_values=['', 'NA', 'N/A', 'null', 'NULL', 'None', '-', 'nan'])
        elif filename.lower().endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file_obj, na_values=['', 'NA', 'N/A', 'null', 'NULL', 'None', '-', 'nan'])
        else:
            return {"success": False, "errors": ["Unsupported file format"], "logs": logs}
        
        logs.append(f"📊 Loaded {len(df)} rows × {len(df.columns)} columns")
        
        # === MAGIC TRANSFORMATION ===
        df, stats = magic_transform(df, logs)
        
        # === SUMMARY ===
        total_changes = (
            stats["duplicates"] + stats["empty_removed"] + 
            stats["dates_fixed"] + stats["emails_fixed"] + 
            stats["phones_fixed"] + stats["names_fixed"] + stats["numbers_fixed"]
        )
        
        logs.append(f"")
        logs.append(f"✅ TRANSFORMATION COMPLETE")
        logs.append(f"📈 Final: {len(df)} rows × {len(df.columns)} columns")
        
        if total_changes > 0:
            logs.append(f"🔥 Total transformations applied: {total_changes}")
        
        # === RETURN FILE (for download) ===
        if return_file:
            csv_content = df.to_csv(index=False)
            return {
                "success": True,
                "csv_content": csv_content,
                "logs": logs,
                "stats": stats
            }
        
        # === SAVE TO DATABASE ===
        if not dry_run and db_url:
            logs.append(f"💾 Saving to database table: {table_name}")
            engine = create_engine(db_url)
            with engine.begin() as conn:
                df.to_sql(table_name, con=conn, if_exists='replace', index=False)
            logs.append(f"🎉 Created table '{table_name}' with {len(df)} records!")
        
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
        logs.append(f"❌ Error: {str(e)}")
        return {
            "success": False,
            "logs": logs,
            "errors": [str(e), traceback.format_exc()[:500]]
        }
