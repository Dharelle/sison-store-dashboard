#!/usr/bin/env python3
"""
Recalculate all Store Sales profits with new margin settings
Reads current margins from localStorage or uses provided values
"""

import json
from pathlib import Path
from datetime import datetime
import sys

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"

def recalculate_profits(gcash_margin=0.02, sari_sari_margin=0.15, orders_margin=0.15):
    """Recalculate all store sales profits"""

    print("=" * 70)
    print("RECALCULATING ALL STORE SALES PROFITS")
    print("=" * 70)
    print(f"\nNew Profit Margins:")
    print(f"  Gcash: {gcash_margin * 100}%")
    print(f"  Sari Sari Store: {sari_sari_margin * 100}%")
    print(f"  Orders: {orders_margin * 100}%")
    print()

    # Read current data
    with open(DATA_DIR / 'store_sales.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    records = data['records']
    print(f"Total records to recalculate: {len(records)}")
    print()

    # Track changes
    changes = 0
    old_total = 0
    new_total = 0

    # Recalculate each record
    for record in records:
        old_profit = record['totalProfit']
        old_total += old_profit

        # Recalculate profits
        gcash_profit = record['gcashTotal'] * gcash_margin
        sari_sari_profit = record['sariSariStore'] * sari_sari_margin
        orders_profit = record['orders'] * orders_margin
        new_profit = gcash_profit + sari_sari_profit + orders_profit

        # Update record
        record['gcashProfit'] = round(gcash_profit, 2)
        record['sariSariStoreProfit'] = round(sari_sari_profit, 2)
        record['ordersProfit'] = round(orders_profit, 2)
        record['totalProfit'] = round(new_profit, 2)

        new_total += new_profit

        if abs(old_profit - new_profit) > 0.01:
            changes += 1

    print(f"Records changed: {changes}")
    print()
    print(f"Old Total Profit: P{old_total:,.2f}")
    print(f"New Total Profit: P{new_total:,.2f}")
    print(f"Difference: P{new_total - old_total:,.2f}")
    print()

    # Update metadata
    data['lastUpdated'] = datetime.now().isoformat() + 'Z'

    # Save back to file
    with open(DATA_DIR / 'store_sales.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("=" * 70)
    print(f"RECALCULATION COMPLETE!")
    print("=" * 70)
    print()
    print("Next steps:")
    print("1. Refresh your browser to see updated data")
    print("2. Verify totals on dashboard")
    print("3. Commit changes: git add data/ && git commit -m 'Recalculate profits' && git push")
    print()

    return new_total

def main():
    # Check for command line arguments
    if len(sys.argv) == 4:
        gcash = float(sys.argv[1]) / 100
        sari_sari = float(sys.argv[2]) / 100
        orders = float(sys.argv[3]) / 100
    else:
        # Use defaults or prompt
        print("Recalculate Store Sales Profits")
        print("=" * 70)
        print()
        print("Enter new profit margins (as percentages):")
        print()

        gcash_input = input("Gcash margin (default 2.2%): ").strip() or "2.2"
        sari_sari_input = input("Sari Sari Store margin (default 15%): ").strip() or "15"
        orders_input = input("Orders margin (default 15%): ").strip() or "15"

        gcash = float(gcash_input) / 100
        sari_sari = float(sari_sari_input) / 100
        orders = float(orders_input) / 100
        print()

    # Confirm
    print(f"You are about to recalculate ALL {len(json.load(open(DATA_DIR / 'store_sales.json'))['records'])} records with:")
    print(f"  Gcash: {gcash * 100}%")
    print(f"  Sari Sari: {sari_sari * 100}%")
    print(f"  Orders: {orders * 100}%")
    print()

    confirm = input("Continue? (yes/no): ").strip().lower()
    if confirm != 'yes':
        print("Cancelled.")
        return

    print()
    recalculate_profits(gcash, sari_sari, orders)

if __name__ == "__main__":
    main()
