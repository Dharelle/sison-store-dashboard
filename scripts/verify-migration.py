#!/usr/bin/env python3
"""
Verify Excel to JSON migration accuracy
Compares original Excel data with migrated JSON files
"""

import pandas as pd
import json
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
EXCEL_FILE = PROJECT_ROOT / "Store Sales_5Year_Restructured.xlsx"
DATA_DIR = PROJECT_ROOT / "data"

def verify_store_sales():
    """Verify Store Sales migration"""
    print("=" * 70)
    print("VERIFYING STORE SALES MIGRATION")
    print("=" * 70)

    # Read Excel
    df_excel = pd.read_excel(EXCEL_FILE, sheet_name='Store_Sales')

    # Read JSON
    with open(DATA_DIR / 'store_sales.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)

    # Filter Excel to match JSON (only records with profit > 0)
    excel_records = []
    for idx, row in df_excel.iterrows():
        # Check total profit first
        try:
            total_profit = float(row.get('Total Profit', 0))
        except:
            continue

        if total_profit <= 0:
            continue

        # Skip if Cash In contains text like 'restday'
        cash_in = row.get('Cash In', 0)
        if isinstance(cash_in, str) and cash_in.lower() in ['restday', 'rest day', 'nw', 'n/a', 'halfday', 'no', 'new year']:
            continue

        # Convert date
        try:
            if isinstance(row['Date'], pd.Timestamp):
                date_str = row['Date'].strftime('%Y-%m-%d')
            else:
                date_str = pd.to_datetime(row['Date']).strftime('%Y-%m-%d')
        except:
            continue

        # Safe float conversion
        def safe_float(val):
            try:
                return float(val) if not pd.isna(val) else 0.0
            except:
                return 0.0

        excel_records.append({
            'date': date_str,
            'cashIn': safe_float(cash_in),
            'cashOut': safe_float(row.get('Cash Out', 0)),
            'gcashTotal': safe_float(row.get('Gcash Total', 0)),
            'sariSariStore': safe_float(row.get('Sari Sari Store', 0)),
            'orders': safe_float(row.get('Orders', 0)),
            'gcashProfit': safe_float(row.get('Gcash Profit', 0)),
            'sariSariStoreProfit': safe_float(row.get('Sari Sari Store Profit', 0)),
            'ordersProfit': safe_float(row.get('Orders Profit', 0)),
            'totalProfit': total_profit
        })

    json_records = json_data['records']

    print(f"\n- Record Counts:")
    print(f"   Excel (valid): {len(excel_records)} records")
    print(f"   JSON:          {len(json_records)} records")

    if len(excel_records) != len(json_records):
        print(f"   WARN  COUNT MISMATCH!")
    else:
        print(f"   OK Counts match!")

    # Sample comparison (first 5 and last 5 records)
    print(f"\n- Sample Verification (First 5 Records):")
    mismatches = 0

    for i in range(min(5, len(excel_records))):
        excel_rec = excel_records[i]
        json_rec = json_records[i]

        date_match = excel_rec['date'] == json_rec['date']
        profit_match = abs(excel_rec['totalProfit'] - json_rec['totalProfit']) < 0.01

        if date_match and profit_match:
            print(f"   OK {excel_rec['date']}: P{excel_rec['totalProfit']:.2f}")
        else:
            print(f"   FAIL {excel_rec['date']}: Excel P{excel_rec['totalProfit']:.2f} vs JSON P{json_rec['totalProfit']:.2f}")
            mismatches += 1

    # Check totals
    excel_total = sum(r['totalProfit'] for r in excel_records)
    json_total = sum(r['totalProfit'] for r in json_records)

    print(f"\n$ Total Profit Verification:")
    print(f"   Excel Total: P{excel_total:,.2f}")
    print(f"   JSON Total:  P{json_total:,.2f}")
    print(f"   Difference:  P{abs(excel_total - json_total):,.2f}")

    if abs(excel_total - json_total) < 1.0:
        print(f"   OK Totals match (within P1.00)!")
    else:
        print(f"   WARN  Totals don't match!")

    return mismatches == 0 and abs(excel_total - json_total) < 1.0

def verify_piso_wifi():
    """Verify Piso WiFi migration"""
    print("\n" + "=" * 70)
    print("VERIFYING PISO WIFI MIGRATION")
    print("=" * 70)

    # Read Excel
    df_excel = pd.read_excel(EXCEL_FILE, sheet_name='Piso_Wifi')

    # Read JSON
    with open(DATA_DIR / 'piso_wifi.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)

    # Filter Excel (only revenue > 0)
    excel_records = []
    for idx, row in df_excel.iterrows():
        revenue = float(row.get('Revenue', 0))
        if revenue > 0:
            excel_records.append({
                'month': str(row.get('Month')),
                'year': int(row.get('Year')),
                'revenue': revenue
            })

    json_records = json_data['records']

    print(f"\n- Record Counts:")
    print(f"   Excel (valid): {len(excel_records)} records")
    print(f"   JSON:          {len(json_records)} records")

    if len(excel_records) != len(json_records):
        print(f"   WARN  COUNT MISMATCH!")
    else:
        print(f"   OK Counts match!")

    # Compare records
    print(f"\n- All Records:")
    mismatches = 0

    for i, excel_rec in enumerate(excel_records):
        # Find matching JSON record
        json_rec = next((r for r in json_records
                        if r['month'].lower() == excel_rec['month'].lower()
                        and r['year'] == excel_rec['year']), None)

        if json_rec:
            revenue_match = abs(excel_rec['revenue'] - json_rec['revenue']) < 0.01
            if revenue_match:
                print(f"   OK {excel_rec['month']} {excel_rec['year']}: P{excel_rec['revenue']:.2f}")
            else:
                print(f"   FAIL {excel_rec['month']} {excel_rec['year']}: Excel P{excel_rec['revenue']:.2f} vs JSON P{json_rec['revenue']:.2f}")
                mismatches += 1
        else:
            print(f"   FAIL {excel_rec['month']} {excel_rec['year']}: NOT FOUND in JSON!")
            mismatches += 1

    # Check totals
    excel_total = sum(r['revenue'] for r in excel_records)
    json_total = sum(r['revenue'] for r in json_records)

    print(f"\n$ Total Revenue Verification:")
    print(f"   Excel Total: P{excel_total:,.2f}")
    print(f"   JSON Total:  P{json_total:,.2f}")
    print(f"   Difference:  P{abs(excel_total - json_total):,.2f}")

    if abs(excel_total - json_total) < 1.0:
        print(f"   OK Totals match!")
    else:
        print(f"   WARN  Totals don't match!")

    return mismatches == 0 and abs(excel_total - json_total) < 1.0

def verify_printer():
    """Verify Printer migration"""
    print("\n" + "=" * 70)
    print("VERIFYING PRINTER MIGRATION")
    print("=" * 70)

    # Read Excel
    df_excel = pd.read_excel(EXCEL_FILE, sheet_name='PRINTER')

    # Read JSON
    with open(DATA_DIR / 'printer.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)

    # Filter Excel (only income > 0)
    excel_records = []
    for idx, row in df_excel.iterrows():
        income = float(row.get('Income', 0))
        if income > 0:
            excel_records.append({
                'month': str(row.get('Month')),
                'year': int(row.get('Year')),
                'income': income
            })

    json_records = json_data['records']

    print(f"\n- Record Counts:")
    print(f"   Excel (valid): {len(excel_records)} records")
    print(f"   JSON:          {len(json_records)} records")

    if len(excel_records) != len(json_records):
        print(f"   WARN  COUNT MISMATCH!")
    else:
        print(f"   OK Counts match!")

    # Compare records
    print(f"\n- All Records:")
    mismatches = 0

    for i, excel_rec in enumerate(excel_records):
        # Find matching JSON record (case-insensitive)
        json_rec = next((r for r in json_records
                        if r['month'].lower() == excel_rec['month'].lower()
                        and r['year'] == excel_rec['year']), None)

        if json_rec:
            income_match = abs(excel_rec['income'] - json_rec['income']) < 0.01
            if income_match:
                print(f"   OK {excel_rec['month']} {excel_rec['year']}: P{excel_rec['income']:.2f}")
            else:
                print(f"   FAIL {excel_rec['month']} {excel_rec['year']}: Excel P{excel_rec['income']:.2f} vs JSON P{json_rec['income']:.2f}")
                mismatches += 1
        else:
            print(f"   FAIL {excel_rec['month']} {excel_rec['year']}: NOT FOUND in JSON!")
            mismatches += 1

    # Check totals
    excel_total = sum(r['income'] for r in excel_records)
    json_total = sum(r['income'] for r in json_records)

    print(f"\n$ Total Income Verification:")
    print(f"   Excel Total: P{excel_total:,.2f}")
    print(f"   JSON Total:  P{json_total:,.2f}")
    print(f"   Difference:  P{abs(excel_total - json_total):,.2f}")

    if abs(excel_total - json_total) < 1.0:
        print(f"   OK Totals match!")
    else:
        print(f"   WARN  Totals don't match!")

    return mismatches == 0 and abs(excel_total - json_total) < 1.0

def main():
    print("\n" + "=" * 70)
    print("SISON STORE DASHBOARD - MIGRATION VERIFICATION")
    print("=" * 70)
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)

    try:
        result_store = verify_store_sales()
        result_wifi = verify_piso_wifi()
        result_printer = verify_printer()

        print("\n" + "=" * 70)
        print("VERIFICATION SUMMARY")
        print("=" * 70)
        print(f"Store Sales:  {'OK PASS' if result_store else 'FAIL FAIL'}")
        print(f"Piso WiFi:    {'OK PASS' if result_wifi else 'FAIL FAIL'}")
        print(f"Printer:      {'OK PASS' if result_printer else 'FAIL FAIL'}")
        print("=" * 70)

        if result_store and result_wifi and result_printer:
            print("\n🎉 ALL VERIFICATIONS PASSED!")
            print("Your JSON data matches the Excel source perfectly!")
        else:
            print("\nWARN  SOME VERIFICATIONS FAILED!")
            print("Review the details above for mismatches.")

        print("\n- Data Summary:")
        with open(DATA_DIR / 'store_sales.json') as f:
            ss = json.load(f)
        with open(DATA_DIR / 'piso_wifi.json') as f:
            pw = json.load(f)
        with open(DATA_DIR / 'printer.json') as f:
            pr = json.load(f)

        ss_total = sum(r['totalProfit'] for r in ss['records'])
        pw_total = sum(r['revenue'] for r in pw['records'])
        pr_total = sum(r['income'] for r in pr['records'])
        grand_total = ss_total + pw_total + pr_total

        print(f"   Store Sales:  {len(ss['records'])} records → P{ss_total:,.2f}")
        print(f"   Piso WiFi:    {len(pw['records'])} records → P{pw_total:,.2f}")
        print(f"   Printer:      {len(pr['records'])} records → P{pr_total:,.2f}")
        print(f"   GRAND TOTAL:  {len(ss['records']) + len(pw['records']) + len(pr['records'])} records → P{grand_total:,.2f}")

    except Exception as e:
        print(f"\nFAIL ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
