#!/usr/bin/env python3
"""
Simple verification of JSON data integrity
Doesn't require Excel file to be closed
"""

import json
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"

def check_store_sales():
    """Check Store Sales data"""
    print("=" * 60)
    print("STORE SALES DATA CHECK")
    print("=" * 60)

    with open(DATA_DIR / 'store_sales.json', 'r') as f:
        data = json.load(f)

    records = data['records']

    print(f"\nTotal Records: {len(records)}")

    # Check for valid dates
    valid_dates = [r for r in records if r['date'] and r['totalProfit'] > 0]
    print(f"Records with profit > 0: {len(valid_dates)}")

    # Date range
    if valid_dates:
        dates = sorted([r['date'] for r in valid_dates])
        print(f"Date Range: {dates[0]} to {dates[-1]}")

    # Total profit
    total_profit = sum(r['totalProfit'] for r in records)
    print(f"Total Profit: P{total_profit:,.2f}")

    # Check for data quality issues
    issues = []

    # Check for negative values
    negatives = [r for r in records if any([
        r['cashIn'] < 0, r['cashOut'] < 0, r['gcashTotal'] < 0,
        r['sariSariStore'] < 0, r['orders'] < 0
    ])]
    if negatives:
        issues.append(f"{len(negatives)} records with negative values")

    # Check for missing dates
    missing_dates = [r for r in records if not r['date']]
    if missing_dates:
        issues.append(f"{len(missing_dates)} records with missing dates")

    # Check for duplicate dates
    dates_with_profit = [r['date'] for r in valid_dates]
    duplicates = len(dates_with_profit) - len(set(dates_with_profit))
    if duplicates > 0:
        issues.append(f"{duplicates} duplicate dates found")

    print(f"\nData Quality:")
    if issues:
        for issue in issues:
            print(f"  WARNING: {issue}")
    else:
        print(f"  PASS - No issues found!")

    # Sample records
    print(f"\nFirst 3 Records:")
    for r in valid_dates[:3]:
        print(f"  {r['date']}: P{r['totalProfit']:.2f}")

    print(f"\nLast 3 Records:")
    for r in valid_dates[-3:]:
        print(f"  {r['date']}: P{r['totalProfit']:.2f}")

    return len(issues) == 0

def check_piso_wifi():
    """Check Piso WiFi data"""
    print("\n" + "=" * 60)
    print("PISO WIFI DATA CHECK")
    print("=" * 60)

    with open(DATA_DIR / 'piso_wifi.json', 'r') as f:
        data = json.load(f)

    records = data['records']

    print(f"\nTotal Records: {len(records)}")

    # Total revenue
    total_revenue = sum(r['revenue'] for r in records)
    print(f"Total Revenue: P{total_revenue:,.2f}")

    # Check for issues
    issues = []

    # Negative values
    negatives = [r for r in records if r['revenue'] < 0]
    if negatives:
        issues.append(f"{len(negatives)} records with negative revenue")

    # Missing month/year
    missing = [r for r in records if not r['month'] or not r['year']]
    if missing:
        issues.append(f"{len(missing)} records with missing month/year")

    # Duplicates
    keys = [(r['month'].lower(), r['year']) for r in records]
    duplicates = len(keys) - len(set(keys))
    if duplicates > 0:
        issues.append(f"{duplicates} duplicate month/year found")

    print(f"\nData Quality:")
    if issues:
        for issue in issues:
            print(f"  WARNING: {issue}")
    else:
        print(f"  PASS - No issues found!")

    # List all records
    print(f"\nAll Records:")
    for r in sorted(records, key=lambda x: (x['year'], x['month'])):
        print(f"  {r['month']} {r['year']}: P{r['revenue']:,.2f}")

    return len(issues) == 0

def check_printer():
    """Check Printer data"""
    print("\n" + "=" * 60)
    print("PRINTER DATA CHECK")
    print("=" * 60)

    with open(DATA_DIR / 'printer.json', 'r') as f:
        data = json.load(f)

    records = data['records']

    print(f"\nTotal Records: {len(records)}")

    # Total income
    total_income = sum(r['income'] for r in records)
    print(f"Total Income: P{total_income:,.2f}")

    # Check for issues
    issues = []

    # Negative values
    negatives = [r for r in records if r['income'] < 0]
    if negatives:
        issues.append(f"{len(negatives)} records with negative income")

    # Missing month/year
    missing = [r for r in records if not r['month'] or not r['year']]
    if missing:
        issues.append(f"{len(missing)} records with missing month/year")

    # Duplicates
    keys = [(r['month'].lower(), r['year']) for r in records]
    duplicates = len(keys) - len(set(keys))
    if duplicates > 0:
        issues.append(f"{duplicates} duplicate month/year found")

    print(f"\nData Quality:")
    if issues:
        for issue in issues:
            print(f"  WARNING: {issue}")
    else:
        print(f"  PASS - No issues found!")

    # List all records
    print(f"\nAll Records:")
    for r in sorted(records, key=lambda x: (x['year'], x['month'])):
        print(f"  {r['month']} {r['year']}: P{r['income']:,.2f}")

    return len(issues) == 0

def main():
    print("\n" + "=" * 60)
    print("SISON STORE DASHBOARD - DATA INTEGRITY CHECK")
    print("=" * 60)
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    try:
        result_store = check_store_sales()
        result_wifi = check_piso_wifi()
        result_printer = check_printer()

        print("\n" + "=" * 60)
        print("FINAL SUMMARY")
        print("=" * 60)
        print(f"Store Sales:  {'PASS' if result_store else 'FAIL'}")
        print(f"Piso WiFi:    {'PASS' if result_wifi else 'FAIL'}")
        print(f"Printer:      {'PASS' if result_printer else 'FAIL'}")
        print("=" * 60)

        if result_store and result_wifi and result_printer:
            print("\nALL CHECKS PASSED!")
            print("Your JSON data is valid and ready to use!")
        else:
            print("\nSOME CHECKS FAILED!")
            print("Review the warnings above.")

    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
