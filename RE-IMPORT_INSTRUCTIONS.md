# Re-Import Data from Excel - Instructions

## What Changed

I've updated the migration script to:

1. **Gcash Profit**: Use ONLY the value from your Excel "Gcash Profit" column
   - ✅ Never calculates (non-linear fee structure)
   - ✅ If Excel shows 0, keeps it as 0 (you can edit manually later)

2. **Sari Sari Store Profit**: Use Excel value OR calculate with **15%**
   - ✅ If Excel has a value, uses it
   - ✅ If Excel is blank/0, calculates: `Sari Sari Store × 0.15`

3. **Orders Profit**: Use Excel value OR calculate with **20%**
   - ✅ If Excel has a value, uses it
   - ✅ If Excel is blank/0, calculates: `Orders × 0.20`

---

## How to Run the Migration

### Step 1: Install Python (if not installed)

1. Download Python from: https://www.python.org/downloads/
2. Install Python (make sure to check "Add Python to PATH")
3. Open Command Prompt and verify: `python --version`

### Step 2: Install Required Packages

```bash
cd "C:\Users\A73331\OneDrive - Microchip Technology Inc\1. Dharelle Personal\sison store"
pip install pandas openpyxl
```

### Step 3: Backup Current Data

**IMPORTANT:** Backup your current JSON files first!

```bash
cd "C:\Users\A73331\OneDrive - Microchip Technology Inc\1. Dharelle Personal\sison store"

# Create backup
mkdir backup
copy data\store_sales.json backup\store_sales_backup.json
copy data\piso_wifi.json backup\piso_wifi_backup.json
copy data\printer.json backup\printer_backup.json
copy data\metadata.json backup\metadata_backup.json
```

### Step 4: Run Migration

```bash
python scripts/migrate-excel-to-json.py
```

You should see:
```
============================================================
Sison Store Dashboard - Data Migration
============================================================

Reading from: ...\Store Sales_5Year_Restructured.xlsx
Output directory: ...\data

Migrating Store_Sales sheet...
OK Migrated 322 Store Sales records to ...\data\store_sales.json
...
```

### Step 5: Verify Results

1. Open `data/store_sales.json`
2. Check a few records to verify:
   - `gcashProfit` matches your Excel "Gcash Profit" column
   - `sariSariStoreProfit` is correct (15% if calculated)
   - `ordersProfit` is correct (20% if calculated)

---

## What If You Don't Want to Re-Import?

### Option 1: Keep Current Data

If your current data is "good enough", you can:
- Skip the re-import
- Only manually edit records where Gcash Profit is wrong
- New entries will use manual Gcash Profit input

### Option 2: Manually Edit Individual Records

1. Go to http://localhost:8000/input.html
2. Find the record in the table
3. Click **Edit**
4. Change **Gcash Profit** to correct value
5. Click **Save**

---

## Quick Test After Re-Import

1. Open http://localhost:8000/input.html
2. Check the table - "Gcash Profit" column should show values from your Excel
3. Add a new transaction
4. Verify:
   - ✅ Gcash Total = Cash In + Cash Out (auto)
   - ✅ Gcash Profit = manual entry
   - ✅ Sari Sari Profit label shows "(15.0%)"
   - ✅ Orders Profit label shows "(20.0%)"

---

## Summary of Changes

### Migration Script (scripts/migrate-excel-to-json.py)

**BEFORE:**
```python
# BAD: Override Excel values
if gcash_profit == 0 and gcash_total > 0:
    gcash_profit = gcash_total * 0.022  # Auto-calculate
```

**AFTER:**
```python
# GOOD: Use Excel values only
gcash_profit = safe_float(row.get('Gcash Profit', 0))
# Never calculates gcash_profit - only uses Excel value
```

**Profit Margins:**
- Sari Sari: 10% → **15%**
- Orders: 10% → **20%**
- Gcash: ~~0.022 (never used)~~ → Manual only

---

## Files Modified

1. `scripts/migrate-excel-to-json.py` - Fixed import logic
2. `data/metadata.json` - Already has correct margins (15%, 20%)

---

## Need Help?

If you encounter issues:
1. Check that `Store Sales_5Year_Restructured.xlsx` exists in the root folder
2. Verify Python and pandas/openpyxl are installed
3. Check console output for error messages
4. Your backup is in the `backup/` folder if you need to restore

---

## Alternative: Don't Re-Import

If you don't want to run Python:

**Your current data already works!** The only issue is some old Gcash Profits might be calculated with 2% instead of manual values. You can:

1. Leave old data as-is (historical records)
2. Only manually edit records where Gcash Profit is significantly wrong
3. All NEW entries going forward will use manual Gcash Profit input

This is a perfectly valid approach - you decide! 😊
