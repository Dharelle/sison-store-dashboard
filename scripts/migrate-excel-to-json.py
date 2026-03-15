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
        # Check if it's already a datetime object
        if isinstance(excel_date, pd.Timestamp) or isinstance(excel_date, datetime):
            return excel_date.strftime('%Y-%m-%d')
        elif isinstance(excel_date, str):
            # Already a string, try to parse it
            dt = pd.to_datetime(excel_date)
            return dt.strftime('%Y-%m-%d')
        else:
            # Try to convert as Excel serial date (numeric)
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
    numeric_columns = ['Cash In', 'Cash Out', 'Gcash Total', 'Sari Sari Store', 'Orders',
                      'Gcash Profit', 'Sari Sari Store Profit', 'Orders Profit', 'Total Profit']
    for col in numeric_columns:
        if col in df.columns:
            df[col] = df[col].fillna(0)

    records = []
    for idx, row in df.iterrows():
        date_str = excel_date_to_iso(row.get('Date'))
        if not date_str:
            continue

        # Don't check Total Profit yet - it might be NaN even if there's data
        # We'll calculate it ourselves

        # Helper function to safely convert to float
        def safe_float(value):
            if pd.isna(value):
                return 0.0
            if isinstance(value, str):
                # Check for text values (rest days, etc.)
                text_val = value.lower().strip()
                if text_val in ['restday', 'rest day', 'holiday', 'closed', 'nw', 'n/a', 'halfday', 'no', 'new year']:
                    return None  # Marker for invalid row
                try:
                    return float(value)
                except ValueError:
                    return 0.0
            try:
                return float(value)
            except (ValueError, TypeError):
                return 0.0

        # Check if Cash In contains text indicating rest day
        cash_in_val = row.get('Cash In', 0)
        if isinstance(cash_in_val, str):
            text_check = cash_in_val.lower().strip()
            if text_check in ['restday', 'rest day', 'holiday', 'closed', 'nw', 'n/a', 'halfday', 'no', 'new year']:
                continue

        # Convert all fields (NOW allows blank/0 Cash In if there's profit)
        cash_in = safe_float(cash_in_val)

        # Get all values
        cash_out = safe_float(row.get('Cash Out', 0))
        gcash_total = safe_float(row.get('Gcash Total', 0))
        sari_sari = safe_float(row.get('Sari Sari Store', 0))
        orders = safe_float(row.get('Orders', 0))

        # Get profit values from Excel columns (they might have manual values)
        gcash_profit = safe_float(row.get('Gcash Profit', 0))
        sari_profit = safe_float(row.get('Sari Sari Store Profit', 0))
        orders_profit = safe_float(row.get('Orders Profit', 0))

        # Try to get Total Profit from Excel
        total_profit_excel = safe_float(row.get('Total Profit', 0))

        # If Total Profit is 0 or NaN, calculate from individual profits or revenue
        if total_profit_excel == 0:
            # If individual profits exist, use MAX to avoid double-counting
            # (Excel sometimes duplicates values across columns)
            if gcash_profit > 0 or sari_profit > 0 or orders_profit > 0:
                # Use the maximum value to avoid counting duplicates
                total_profit = max(gcash_profit, sari_profit, orders_profit)

                # But if they're all different, sum them
                unique_values = set([gcash_profit, sari_profit, orders_profit]) - {0}
                if len(unique_values) > 1:
                    # Different values, sum them
                    total_profit = gcash_profit + sari_profit + orders_profit
                # Otherwise use the single unique value (max)
            else:
                # Calculate from revenue using standard margins
                gcash_profit = gcash_total * 0.022
                sari_profit = sari_sari * 0.10
                orders_profit = orders * 0.10
                total_profit = gcash_profit + sari_profit + orders_profit
        else:
            # Use Excel Total Profit
            total_profit = total_profit_excel

            # If individual profits are 0, calculate them
            if gcash_profit == 0 and gcash_total > 0:
                gcash_profit = gcash_total * 0.022
            if sari_profit == 0 and sari_sari > 0:
                sari_profit = sari_sari * 0.10
            if orders_profit == 0 and orders > 0:
                orders_profit = orders * 0.10

        # Skip if still no profit
        if total_profit <= 0:
            continue

        record = {
            "id": generate_id("ss", date_str, idx + 1),
            "date": date_str,
            "cashIn": cash_in,
            "cashOut": cash_out,
            "gcashTotal": gcash_total,
            "sariSariStore": sari_sari,
            "orders": orders,
            "gcashProfit": gcash_profit,
            "sariSariStoreProfit": sari_profit,
            "ordersProfit": orders_profit,
            "totalProfit": total_profit,
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

    print(f"OK Migrated {len(records)} Store Sales records to {output_file}")
    return len(records)

def migrate_piso_wifi():
    """Migrate Piso_Wifi sheet to JSON"""
    print("Migrating Piso_Wifi sheet...")

    # Read the Excel sheet
    df = pd.read_excel(EXCEL_FILE, sheet_name='Piso_Wifi')

    # Replace NaN with 0
    df['Revenue'] = df['Revenue'].fillna(0)

    records = []
    for idx, row in df.iterrows():
        month = row.get('Month')
        year = row.get('Year')
        revenue = row.get('Revenue', 0)

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

    print(f"OK Migrated {len(records)} Piso WiFi records to {output_file}")
    return len(records)

def migrate_printer():
    """Migrate Printer sheet to JSON"""
    print("Migrating Printer sheet...")

    # Read the Excel sheet
    df = pd.read_excel(EXCEL_FILE, sheet_name='PRINTER')

    # Replace NaN with 0
    df['Income'] = df['Income'].fillna(0)

    records = []
    for idx, row in df.iterrows():
        month = row.get('Month')
        year = row.get('Year')
        income = row.get('Income', 0)

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

    print(f"OK Migrated {len(records)} Printer records to {output_file}")
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

    print(f"OK Created metadata.json")

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
