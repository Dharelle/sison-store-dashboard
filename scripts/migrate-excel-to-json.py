#!/usr/bin/env python3
"""
Migrate Excel data to JSON format for the Sison Store Dashboard
Reads Store Sales_5Year_Restructured.xlsx and exports to JSON files
"""

import pandas as pd
import json
from datetime import datetime
from pathlib import Path
import os

# Get the project root directory
PROJECT_ROOT = Path(__file__).parent.parent
EXCEL_FILE = PROJECT_ROOT / "Store Sales_5Year_Restructured.xlsx"
DATA_DIR = PROJECT_ROOT / "data"

# Ensure data directory exists
DATA_DIR.mkdir(exist_ok=True)

def excel_date_to_iso(excel_date):
    """Convert Excel date to ISO 8601 format"""
    if pd.isna(excel_date):
        return None
    try:
        if isinstance(excel_date, str):
            # Already a string, try to parse it
            dt = pd.to_datetime(excel_date)
        else:
            # Excel serial date
            dt = pd.to_datetime(excel_date, unit='D', origin='1899-12-30')
        return dt.strftime('%Y-%m-%d')
    except Exception as e:
        print(f"Warning: Could not convert date {excel_date}: {e}")
        return None

def generate_id(prefix, date_str, counter):
    """Generate unique ID for records"""
    if date_str:
        date_part = date_str.replace('-', '')
        return f"{prefix}_{date_part}_{counter:03d}"
    else:
        return f"{prefix}_unknown_{counter:03d}"

def migrate_store_sales():
    """Migrate Store_Sales sheet to JSON"""
    print("Migrating Store_Sales sheet...")

    # Read the Excel sheet
    df = pd.read_excel(EXCEL_FILE, sheet_name='Store_Sales')

    # Replace NaN with 0 for numeric columns
    numeric_columns = ['Cash in', 'Cash out', 'Gcash total', 'Sari sari store', 'Orders',
                      'Gcash profit', 'Sari sari store profit', 'Orders profit', 'Total profit']
    for col in numeric_columns:
        if col in df.columns:
            df[col] = df[col].fillna(0)

    records = []
    for idx, row in df.iterrows():
        date_str = excel_date_to_iso(row.get('Date'))
        if not date_str:
            continue

        record = {
            "id": generate_id("ss", date_str, idx + 1),
            "date": date_str,
            "cashIn": float(row.get('Cash in', 0)),
            "cashOut": float(row.get('Cash out', 0)),
            "gcashTotal": float(row.get('Gcash total', 0)),
            "sariSariStore": float(row.get('Sari sari store', 0)),
            "orders": float(row.get('Orders', 0)),
            "gcashProfit": float(row.get('Gcash profit', 0)),
            "sariSariStoreProfit": float(row.get('Sari sari store profit', 0)),
            "ordersProfit": float(row.get('Orders profit', 0)),
            "totalProfit": float(row.get('Total profit', 0)),
            "createdAt": datetime.now().isoformat() + 'Z'
        }
        records.append(record)

    output = {
        "version": "1.0",
        "lastUpdated": datetime.now().isoformat() + 'Z',
        "records": records
    }

    output_file = DATA_DIR / "store_sales.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"✓ Migrated {len(records)} Store Sales records to {output_file}")
    return len(records)

def migrate_piso_wifi():
    """Migrate Piso_Wifi sheet to JSON"""
    print("Migrating Piso_Wifi sheet...")

    # Read the Excel sheet
    df = pd.read_excel(EXCEL_FILE, sheet_name='Piso_Wifi')

    # Replace NaN with 0
    df['Piso_Wifi'] = df['Piso_Wifi'].fillna(0)

    records = []
    for idx, row in df.iterrows():
        month = row.get('Month')
        year = row.get('Year')
        revenue = row.get('Piso_Wifi', 0)

        if pd.isna(month) or pd.isna(year):
            continue

        record = {
            "id": generate_id("pw", f"{int(year)}{int(idx+1):02d}", idx + 1),
            "month": str(month),
            "year": int(year),
            "revenue": float(revenue),
            "createdAt": datetime.now().isoformat() + 'Z'
        }
        records.append(record)

    output = {
        "version": "1.0",
        "lastUpdated": datetime.now().isoformat() + 'Z',
        "records": records
    }

    output_file = DATA_DIR / "piso_wifi.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"✓ Migrated {len(records)} Piso WiFi records to {output_file}")
    return len(records)

def migrate_printer():
    """Migrate Printer sheet to JSON"""
    print("Migrating Printer sheet...")

    # Read the Excel sheet
    df = pd.read_excel(EXCEL_FILE, sheet_name='Printer')

    # Replace NaN with 0
    df['Printer'] = df['Printer'].fillna(0)

    records = []
    for idx, row in df.iterrows():
        month = row.get('Month')
        year = row.get('Year')
        income = row.get('Printer', 0)

        if pd.isna(month) or pd.isna(year):
            continue

        record = {
            "id": generate_id("pr", f"{int(year)}{int(idx+1):02d}", idx + 1),
            "month": str(month),
            "year": int(year),
            "income": float(income),
            "createdAt": datetime.now().isoformat() + 'Z'
        }
        records.append(record)

    output = {
        "version": "1.0",
        "lastUpdated": datetime.now().isoformat() + 'Z',
        "records": records
    }

    output_file = DATA_DIR / "printer.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"✓ Migrated {len(records)} Printer records to {output_file}")
    return len(records)

def create_metadata(store_sales_count, piso_wifi_count, printer_count):
    """Create metadata.json with record counters"""
    metadata = {
        "version": "1.0",
        "lastUpdated": datetime.now().isoformat() + 'Z',
        "counters": {
            "storeSales": store_sales_count,
            "pisoWifi": piso_wifi_count,
            "printer": printer_count
        },
        "config": {
            "profitMargins": {
                "gcash": 0.022,
                "sariSariStore": 0.10,
                "orders": 0.10
            }
        }
    }

    output_file = DATA_DIR / "metadata.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"✓ Created metadata.json")

def main():
    """Main migration function"""
    print("=" * 60)
    print("Sison Store Dashboard - Data Migration")
    print("=" * 60)
    print()

    if not EXCEL_FILE.exists():
        print(f"Error: Excel file not found at {EXCEL_FILE}")
        return

    print(f"Reading from: {EXCEL_FILE}")
    print(f"Output directory: {DATA_DIR}")
    print()

    try:
        store_sales_count = migrate_store_sales()
        piso_wifi_count = migrate_piso_wifi()
        printer_count = migrate_printer()
        create_metadata(store_sales_count, piso_wifi_count, printer_count)

        print()
        print("=" * 60)
        print("Migration Complete!")
        print("=" * 60)
        print(f"Total records migrated: {store_sales_count + piso_wifi_count + printer_count}")
        print(f"  - Store Sales: {store_sales_count}")
        print(f"  - Piso WiFi: {piso_wifi_count}")
        print(f"  - Printer: {printer_count}")
        print()
        print("Next steps:")
        print("1. Review the JSON files in the data/ directory")
        print("2. Initialize git repository")
        print("3. Commit and push to GitHub")
        print("4. Set up GitHub Pages")

    except Exception as e:
        print(f"Error during migration: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
