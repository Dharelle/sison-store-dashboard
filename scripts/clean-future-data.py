#!/usr/bin/env python3
"""
Clean future placeholder data from JSON files
Removes records with zero values that are future dates
"""

import json
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"

def clean_store_sales():
    """Remove zero-profit future transactions"""
    file_path = DATA_DIR / "store_sales.json"

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    original_count = len(data['records'])

    # Keep only records with profit > 0
    data['records'] = [r for r in data['records'] if r['totalProfit'] > 0]

    # Sort by date descending
    data['records'].sort(key=lambda x: x['date'], reverse=True)

    data['lastUpdated'] = datetime.now().isoformat() + 'Z'

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    removed = original_count - len(data['records'])
    print(f"Store Sales: Kept {len(data['records'])} records, removed {removed} zero-profit entries")

def clean_piso_wifi():
    """Remove zero-revenue future entries"""
    file_path = DATA_DIR / "piso_wifi.json"

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    original_count = len(data['records'])

    # Keep only records with revenue > 0
    data['records'] = [r for r in data['records'] if r['revenue'] > 0]

    # Sort by year and month descending
    data['records'].sort(key=lambda x: (x['year'], x['month']), reverse=True)

    data['lastUpdated'] = datetime.now().isoformat() + 'Z'

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    removed = original_count - len(data['records'])
    print(f"Piso WiFi: Kept {len(data['records'])} records, removed {removed} zero-revenue entries")

def clean_printer():
    """Remove zero-income future entries"""
    file_path = DATA_DIR / "printer.json"

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    original_count = len(data['records'])

    # Keep only records with income > 0
    data['records'] = [r for r in data['records'] if r['income'] > 0]

    # Sort by year and month descending
    data['records'].sort(key=lambda x: (x['year'], x['month']), reverse=True)

    data['lastUpdated'] = datetime.now().isoformat() + 'Z'

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    removed = original_count - len(data['records'])
    print(f"Printer: Kept {len(data['records'])} records, removed {removed} zero-income entries")

def main():
    print("=" * 60)
    print("Cleaning Future Placeholder Data")
    print("=" * 60)
    print()

    clean_store_sales()
    clean_piso_wifi()
    clean_printer()

    print()
    print("=" * 60)
    print("Cleanup Complete!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Refresh your browser to see clean data")
    print("2. Commit changes to git")
    print("3. Push to GitHub")

if __name__ == "__main__":
    main()
