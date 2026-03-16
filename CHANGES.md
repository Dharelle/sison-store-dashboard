# Changes Summary - 2026-03-16

## All Issues Fixed ✅

## Issues Fixed

### 1. Dark Mode Notification Text Not Readable ✅
**Problem:** Notifications in dark mode had white background with light text, making them unreadable.

**Solution:** Updated `css/main.css` line 278:
- Changed `background-color: white;` to `background-color: var(--bg-secondary);`
- Added `color: var(--text-primary);`
- Now notifications respect dark mode colors

---

### 2. Gcash Profit Calculation - Manual Input ✅
**Problem:** Gcash has a non-linear fee structure (₱100 transaction = ₱5 profit, ₱250 = ₱5 profit), not a simple percentage. The 2.2% calculation was incorrect.

**Solution:**
- **forms.js**: Made Gcash Profit a manual input field instead of auto-calculated
  - Removed `gcashTotal` from auto-calculation inputs
  - Added `gcashProfit` as manual input that triggers total recalculation
  - Updated `calculateStoreSalesProfits()` to use manual gcashProfit value
  - Added `updateProfitMarginLabels()` to dynamically show correct percentages

- **data-manager.js**: Updated `addStoreSale()` to use manual gcashProfit from form instead of calculating it

- **input.html**: Updated the Gcash Profit field:
  - Changed from `readonly` to `required` input
  - Added help text: "Enter actual Gcash profit (non-linear fee structure: ₱100 transaction = ₱5 profit)"
  - Label now shows "Gcash Profit (Manual)"

---

### 3. Dynamic Profit Percentage Labels ✅
**Problem:** Form labels showed hardcoded percentages (e.g., "10%") that didn't match the actual profit margins from setup.

**Solution:**
- **forms.js**: Added `updateProfitMarginLabels()` method that:
  - Reads current margins from CONFIG.profitMargins
  - Updates form labels dynamically on page load
  - Gcash: Shows "Manual" instead of percentage
  - Sari Sari Store: Shows actual percentage (e.g., "15.0%")
  - Orders: Shows actual percentage (e.g., "20.0%")

---

### 4. Combined Sales & Profit Tiles ✅
**Problem:** Dashboard had 6 separate tiles (Sales + Profit for each: Gcash, Sari Sari, Orders), making it cluttered.

**Solution:**
- **index.html**: Reduced from 6 tiles to 3 combined tiles
  - Each tile now shows Sales as main value
  - Profit shown as secondary info below with green color
  - Format: "Sales: ₱XXX | Profit: ₱XXX (XX%)"

- **css/dashboard.css**: Added new styles:
  - `.kpi-secondary`: Container for profit info
  - `.kpi-secondary-label`: "Profit:" label
  - `.kpi-secondary-value`: Profit amount in green
  - `.kpi-secondary-percent`: Percentage in gray

---

### 5. Data Not Saving After Refresh ✅
**Problem:** When adding data, notification showed success and table updated, but after page refresh the data disappeared. This happened when GitHub sync failed (SHA conflict or network error).

**Root Cause:**
- Data was added to in-memory array first
- If GitHub save failed, data remained in memory
- Table showed the data from memory
- After refresh, loaded from GitHub (which didn't have the new record)

**Solution:**
- **data-manager.js**: Added try-catch with rollback in `addStoreSale()`
  - If save fails, removes the record from in-memory data
  - Ensures memory and GitHub stay in sync

- **storage.js**: Improved error messages:
  - SHA conflict (409): "Data conflict detected. The file was modified elsewhere. Please refresh and try again."
  - Clears cached SHA on 409 error so next attempt fetches fresh SHA
  - Auth errors (401/403): "GitHub authentication failed. Please check your token in Setup."
  - Not found (404): "GitHub repository or file not found. Please check your setup."

---

### 6. Auto-Calculate Gcash Total ✅
**Problem:** Users had to manually enter Gcash Total = Cash In + Cash Out.

**Solution:**
- **forms.js**: Added auto-sum functionality
  - Listens to Cash In and Cash Out input changes
  - Automatically updates Gcash Total field
  - Formula: `Gcash Total = Cash In + Cash Out`

- **input.html**: Made Gcash Total field readonly
  - Label shows "(Auto-calculated)"
  - Help text: "Automatically calculated: Cash In + Cash Out"

---

### 7. Auto-Retry on SHA Conflict ✅
**Problem:** First save showed "refresh" error, second save worked. This was frustrating for users.

**Root Cause:**
- SHA (file version) mismatch between cached value and GitHub
- Required manual retry after clearing cache

**Solution:**
- **storage.js**: Automatic retry on 409 (SHA conflict) error
  - Detects 409 error
  - Clears cached SHA
  - Automatically retries save with fresh SHA
  - Only shows error if retry also fails
  - User sees: "Saved successfully!" on first click (no manual retry needed)

---

### 8. Fix Profit Margin Labels Showing 10% Instead of Setup Values ✅
**Problem:** Form labels showed 10% but setup had 15% (Sari Sari) and 20% (Orders).

**Root Cause:**
- `updateProfitMarginLabels()` was called before dataManager loaded metadata from GitHub
- CONFIG still had default 10% values

**Solution:**
- **forms.js**: Created global `refreshProfitMarginLabels()` function
- **input-tables.js**: Calls `refreshProfitMarginLabels()` after dataManager initializes
- **forms.js**: Also refreshes labels after successful save
- Now labels correctly show: "Sari Sari Store Profit (15.0%)" and "Orders Profit (20.0%)"

---

### 9. Force Cache Refresh After Save ✅
**Problem:** After save, Ctrl+Shift+R was needed to see data.

**Solution:**
- **forms.js**: Added `await dataManager.initialize(true)` after successful save
- Forces reload from GitHub
- Ensures cache is always in sync with GitHub
- No more stale data in memory

---

## Files Modified

1. `css/main.css` - Dark mode notification fix
2. `css/dashboard.css` - Combined tile styling
3. `js/forms.js` - Manual Gcash profit, dynamic labels, auto-sum Gcash Total, refresh labels after load
4. `js/data-manager.js` - Manual Gcash profit, rollback on error
5. `js/storage.js` - Auto-retry on SHA conflict, better error messages
6. `js/input-tables.js` - Refresh profit labels after data loads
7. `input.html` - Gcash profit manual, Gcash Total auto-calculated (readonly)

---

## Testing Checklist

### Dark Mode
- [ ] Toggle dark mode
- [ ] Add a transaction
- [ ] Verify notification text is readable in both light and dark modes

### Gcash Auto-Sum & Manual Profit
- [ ] Go to input.html
- [ ] Enter Cash In = 500
- [ ] Enter Cash Out = 300
- [ ] Verify Gcash Total auto-fills with 800 (readonly field)
- [ ] Manually enter Gcash Profit = 15.00
- [ ] Enter Sari Sari Store = 1000
- [ ] Enter Orders = 500
- [ ] Verify Sari Sari Profit and Orders Profit auto-calculate
- [ ] Verify Total Profit = Manual Gcash Profit + Auto-calculated profits
- [ ] Submit form - should save successfully on FIRST click (no "refresh" error)
- [ ] Try submitting same date again - should show "transaction already exists"
- [ ] Verify data appears in table immediately (no Ctrl+Shift+R needed)

### Dynamic Labels (IMPORTANT TEST)
- [ ] Go to Setup page
- [ ] Verify current profit margins (should show Sari Sari: 15%, Orders: 20%)
- [ ] If not, set them to: Gcash: 2.2%, Sari Sari: 15%, Orders: 20%
- [ ] Save profit margins
- [ ] Go to input.html (force page reload)
- [ ] Wait for page to fully load
- [ ] Verify form labels show:
  - [ ] Gcash Profit label: "Gcash Profit (Manual)"
  - [ ] Sari Sari Store Profit label: "Sari Sari Store Profit (15.0%)" ← NOT 10%!
  - [ ] Orders Profit label: "Orders Profit (20.0%)" ← NOT 10%!
- [ ] If labels still show 10%, refresh page (Ctrl+Shift+R) and check again

### Combined Tiles
- [ ] Go to dashboard (index.html)
- [ ] Verify only 3 tiles for Gcash, Sari Sari, Orders (down from 6)
- [ ] Each tile shows:
  - Main value: Sales amount
  - Percentage: % of store revenue
  - Secondary line: "Profit: ₱XXX (XX%)"
- [ ] Verify profit amount is in green color
- [ ] Verify profit percentage is in parentheses

### Data Sync Error Handling
- [ ] Try adding data with GitHub offline/unavailable
- [ ] Verify clear error message appears
- [ ] Verify table does NOT show the failed transaction
- [ ] After fixing connectivity, add data again
- [ ] Verify data saves successfully
- [ ] Refresh page
- [ ] Verify data persists after refresh

---

## Breaking Changes

**None** - All changes are backward compatible with existing data.

---

## Migration Notes

**Existing Data:** No migration needed. Existing records already have `gcashProfit` values stored. The change only affects new data entry - users now manually enter Gcash profit instead of it being auto-calculated.

---

## Future Improvements

1. Add bulk edit for updating Gcash profits on old records if fee structure changed
2. Add a calculator helper for Gcash profit (user enters transactions, it suggests profit)
3. Consider adding validation rules for Gcash profit (e.g., warn if profit seems too high/low)
