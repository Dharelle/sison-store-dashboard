# Quick Test Guide - All Fixes

## 🚀 Quick Test (5 minutes)

### Test 1: Auto-Sum Gcash Total ✅
1. Open `input.html`
2. Enter **Cash In: 500**
3. Enter **Cash Out: 300**
4. **✓ Gcash Total should automatically show: 800** (readonly field)

---

### Test 2: Manual Gcash Profit + Dynamic Labels ✅
1. Check the profit labels:
   - **Gcash Profit (Manual)** ← Should say "Manual", not a percentage
   - **Sari Sari Store Profit (15.0%)** ← Should say 15.0%, not 10%!
   - **Orders Profit (20.0%)** ← Should say 20.0%, not 10%!

2. If still showing 10%, your setup needs to be configured:
   - Go to `setup.html`
   - Set: Sari Sari = 15%, Orders = 20%
   - Save and return to input.html

---

### Test 3: First-Click Save (No "Refresh" Error) ✅
1. Fill in the form:
   - Cash In: 500
   - Cash Out: 300
   - Gcash Total: 800 (auto)
   - **Gcash Profit: 15** (manual entry)
   - Sari Sari Store: 1000
   - Orders: 500

2. Click **"Add Transaction"** ONCE
3. **✓ Should show "Transaction saved successfully!" immediately**
4. **✗ Should NOT show "refresh" or "conflict" error**

---

### Test 4: Duplicate Detection ✅
1. Try clicking **"Add Transaction"** again with same date
2. **✓ Should show "A transaction for [date] already exists"**

---

### Test 5: Data Persistence (No Cache Issue) ✅
1. After successful save, **data should appear in table immediately**
2. Press **Ctrl+Shift+R** (hard refresh)
3. **✓ Data should still be there** (not disappear)

---

### Test 6: Combined Tiles on Dashboard ✅
1. Go to `index.html`
2. Look at Gcash, Sari Sari, Orders tiles
3. Each tile should show:
   - **Top**: Sales amount (main value)
   - **Middle**: % of store revenue
   - **Bottom**: "Profit: ₱XXX (XX%)" in green color

**Before:** 6 separate tiles (Sales + Profit for each)
**After:** 3 combined tiles

---

### Test 7: Dark Mode Notifications ✅
1. Toggle dark mode (moon icon)
2. Add a transaction
3. **✓ Notification text should be readable** (not white text on white background)

---

## 🔍 What Changed Under the Hood

### SHA Conflict Auto-Retry Flow:
```
User clicks "Add Transaction"
    ↓
Save to GitHub
    ↓
Error 409: SHA conflict? ← OLD: Show error to user
    ↓
Clear cached SHA
    ↓
Retry automatically ← NEW: Auto-retry!
    ↓
Success: Show "Saved successfully!"
```

### Profit Label Update Flow:
```
Page loads
    ↓
Forms initialize (labels show default 10%)
    ↓
DataManager loads from GitHub ← Reads metadata.json with real margins
    ↓
CONFIG updates (now has 15%, 20%)
    ↓
refreshProfitMarginLabels() called ← NEW!
    ↓
Labels update to show 15%, 20%
```

---

## ❌ Common Issues

### Issue: Labels still show 10% instead of 15%/20%
**Cause:** Profit margins not saved in setup
**Fix:**
1. Go to `setup.html`
2. Scroll to "Profit Margin Settings"
3. Enter: Sari Sari = 15, Orders = 20
4. Click "Save Profit Margins"
5. Go back to input.html
6. Labels should now show correct percentages

---

### Issue: "Refresh" error on first save
**Cause:** Browser cache has stale data
**Fix:**
1. Press Ctrl+Shift+R (hard refresh)
2. Try again
3. Should work now (auto-retry is enabled)

---

### Issue: Data disappears after refresh
**Cause:** GitHub token expired or repository access issue
**Fix:**
1. Check browser console for errors (F12)
2. Go to `setup.html`
3. Click "Test Connection"
4. If fails, regenerate GitHub token

---

## 📊 Visual Changes

### OLD Form Layout:
```
Cash In: [input]
Cash Out: [input]
Gcash Total: [manual input] ← User had to calculate
Gcash Profit: [auto 2.2%] ← Wrong! Non-linear fee
```

### NEW Form Layout:
```
Cash In: [input]
Cash Out: [input]
Gcash Total: [800] (Auto-calculated) ← Automatic!
Gcash Profit: [manual input] ← User enters actual profit
```

---

### OLD Dashboard (6 tiles):
```
[Gcash Sales]  [Gcash Profit]
[Sari Sales]   [Sari Profit]
[Orders Sales] [Orders Profit]
```

### NEW Dashboard (3 combined tiles):
```
[Gcash]
Sales: ₱800
28% of store revenue
Profit: ₱15 (5%)

[Sari Sari Store]
Sales: ₱1000
35% of store revenue
Profit: ₱150 (15%)

[Orders]
Sales: ₱500
17% of store revenue
Profit: ₱100 (20%)
```

---

## ✅ Success Criteria

All tests pass when:
- ✓ Gcash Total auto-calculates on input
- ✓ Labels show 15% and 20% (not 10%)
- ✓ First save succeeds without "refresh" error
- ✓ Duplicate date detection works
- ✓ Data persists after hard refresh
- ✓ Dashboard shows 3 combined tiles (not 6)
- ✓ Dark mode notifications are readable
