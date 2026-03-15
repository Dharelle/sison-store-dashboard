# Claude AI Reference Guide - Sison Store Dashboard

> **Purpose**: Quick reference for Claude AI when answering questions about this project

---

## 🎯 Project Quick Facts

**What is this?**
A web-based business dashboard for tracking three revenue streams: Store Sales, Piso WiFi, and Printer services.

**Tech Stack:**
- Pure JavaScript (no frameworks)
- Chart.js for visualizations
- GitHub as database (JSON files)
- GitHub Pages for hosting

**Owner:** Dharelle Sison (sisondharelle@gmail.com)
**Repository:** https://github.com/Dharelle/sison-store-dashboard
**Live URL:** https://dharelle.github.io/sison-store-dashboard/

---

## 📁 Key Files (Most Important)

### HTML Pages (3)
1. **index.html** - Dashboard with KPIs, charts, tables
2. **input.html** - Tabbed data entry forms with full tables
3. **setup.html** - GitHub configuration

### JavaScript Modules (9)
1. **config.js** - Configuration constants
2. **utils.js** - Helper functions (format, dates, validation)
3. **github-api.js** - GitHub REST API wrapper
4. **storage.js** - localStorage + GitHub sync
5. **data-manager.js** - Business logic, CRUD operations
6. **dashboard.js** - Dashboard UI controller
7. **charts.js** - Chart.js management (7 charts)
8. **forms.js** - Form handling, validation
9. **input-tables.js** - Table management, edit/delete

### CSS Files (3)
1. **main.css** - Global styles, variables, dark mode
2. **dashboard.css** - Dashboard-specific styles
3. **forms.css** - Form styling

### Data Files (4 JSON)
1. **store_sales.json** - 316 daily transactions
2. **piso_wifi.json** - 9 monthly WiFi revenue records
3. **printer.json** - 13 monthly printer income records
4. **metadata.json** - Counters and configuration

---

## 🎨 Dashboard Features

### 8 KPI Cards
1. Total Revenue (all streams, filtered)
2. Average Monthly (excludes zero months)
3. Best Month (highest Store Sales)
4. Worst Month (lowest Store Sales)
5. March 2026 (current month, all streams)
6. Store Sales (amount + %)
7. Piso WiFi (amount + %)
8. Printer (amount + %)

### 6 Time Filters
- This Month (March 2026)
- Last Month (February 2026)
- Quarter (last 3 months)
- 6 Months
- 1 Year
- All Time (default)

### 7 Charts
1. Store Sales Trend (line/bar)
2. Piso WiFi Trend (line/bar)
3. Printer Trend (line/bar)
4. Store Components (Gcash/Sari/Orders stacked bar)
5. Monthly Performance (3 streams stacked)
6. Revenue Breakdown (pie chart)
7. Yearly Summary (stacked bar)

**Chart Logic:**
- 1 month filter → Bar charts
- Multiple months → Line charts
- Dynamic titles with filter label

### 3 Tables (Filtered)
- Recent Store Sales (10 records)
- Recent Piso WiFi (10 records)
- Recent Printer (10 records)

---

## 📝 Input Page Features

### Tab Navigation
- Store Sales | Piso WiFi | Printer
- Click to switch

### Each Tab Has:
1. **Form** at top (add new data)
2. **Complete table** below with:
   - Search box
   - Filter dropdown
   - Sortable columns (click headers)
   - Pagination (20 per page)
   - Edit button (inline editing)
   - Delete button (with confirmation)

### After Submission
- Saves to GitHub (auto-commit)
- Form resets
- Table reloads
- Stays on same page

---

## 🔧 How It Works

### Data Flow
```
User Input (Forms)
    ↓
Validation (forms.js)
    ↓
Business Logic (data-manager.js)
    ↓
Storage Manager (storage.js)
    ↓
GitHub API (github-api.js)
    ↓
GitHub Repository (JSON files)
    ↓
Git Commit (automatic)
```

### Time Filter Flow
```
User clicks filter button
    ↓
dashboard.js sets dataManager.currentFilter
    ↓
Calls dataManager.calculateKPIs()
    ↓
filterByDateRange() filters data
    ↓
Returns filtered KPIs
    ↓
dashboard.js updates UI
    ↓
Destroys and recreates charts
    ↓
Charts use filtered data
```

### Edit Flow
```
User clicks "Edit" button
    ↓
Row converts to input fields
    ↓
User modifies values
    ↓
Clicks "Save"
    ↓
dataManager.updateXXX(id, formData)
    ↓
Saves to GitHub
    ↓
Table reloads
```

---

## 💾 Data Details

### Store Sales
- **316 records** (cleaned from 1,614)
- Date range: Jan 2, 2025 - Feb 28, 2026
- Filters out "restday" entries
- Calculates profits automatically

### Piso WiFi
- **9 records**
- Months: March 2025 - November 2025
- Monthly revenue tracking
- Case-insensitive month matching

### Printer
- **13 records**
- Months: February 2025 - February 2026
- Monthly income tracking
- Months stored in UPPERCASE

### Profit Margins (Configurable)
```javascript
gcash: 2.2%
sariSariStore: 10%
orders: 10%
```

---

## 🎨 UI/UX Features

### Dark Mode
- Toggle with ☀️/🌙 button
- Saved in localStorage
- Smooth transitions
- All elements adapt

### Responsive Design
- **Desktop** (1400px+): 3-column charts
- **Laptop** (1024-1399px): 2-column charts
- **Tablet** (768-1023px): 1-column charts, 2-column KPIs
- **Mobile** (<768px): All single column, touch-optimized

### Notifications
- Success (green)
- Error (red)
- Warning (yellow)
- Info (blue)
- Auto-dismiss after 3 seconds

### Tooltips
- Help icons (?) on all KPI cards
- Info icons (ℹ️) on all charts
- Hover to see explanations
- Improves user understanding

---

## 🔍 Common Questions & Answers

**Q: How do I add new data?**
A: Click "Add Data" → Select tab → Fill form → Submit

**Q: How do I edit wrong entries?**
A: Go to "Add Data" → Find record in table → Click "Edit" → Modify → "Save"

**Q: Where is my data stored?**
A: In your GitHub repository at `/data/*.json` files

**Q: Can I use this offline?**
A: View only (uses cache). Need internet to add/edit/delete.

**Q: How do I backup my data?**
A: Click "Export Data" button on dashboard, or download from GitHub

**Q: Can multiple people use this?**
A: Designed for single user. Concurrent edits may conflict.

**Q: How do I change profit margins?**
A: Edit `js/config.js` → `profitMargins` object

**Q: How do I add a 4th revenue stream?**
A: Create new JSON file, add form, update data-manager.js, add chart

**Q: Why doesn't my filter work?**
A: Hard refresh (Ctrl+Shift+R) or clear cache

**Q: How do I delete future placeholder data?**
A: Run `python scripts/clean-future-data.py`

---

## 🔑 Important Code Locations

**If user asks "where is...":**

- **Profit calculation**: `js/data-manager.js` line ~158-161
- **Time filter logic**: `js/data-manager.js` line ~25-48
- **Chart creation**: `js/charts.js` (all chart functions)
- **Add record**: `js/data-manager.js` → `addStoreSale()`, `addPisoWifi()`, `addPrinter()`
- **Edit record**: `js/data-manager.js` → `updateXXX()` methods
- **Delete record**: `js/data-manager.js` → `deleteXXX()` methods
- **GitHub save**: `js/github-api.js` → `updateFile()`
- **KPI calculation**: `js/data-manager.js` → `calculateKPIs()`
- **Filter buttons**: `js/dashboard.js` line ~383+
- **Dark mode**: `js/dashboard.js` → `initDarkMode()`
- **Tab switching**: `js/input-tables.js` line ~15-35
- **Sortable columns**: `js/input-tables.js` → `sortXXX()` functions

**Configuration:**
- **Profit margins**: `js/config.js` line ~36-40
- **Chart colors**: `js/config.js` line ~44-52
- **API settings**: `js/config.js` line ~12-17

---

## 🎓 Learning Notes

### For Future Development

**Adding a New Revenue Stream:**
1. Create `data/new_stream.json`
2. Add form in `input.html`
3. Add `addNewStream()` to `data-manager.js`
4. Update `calculateKPIs()` to include new stream
5. Add chart in `charts.js`
6. Update `getMonthlyData()` or `getYearlyData()`

**Modifying Profit Margins:**
1. Edit `js/config.js` → `profitMargins`
2. Refresh browser
3. Recalculates on next data entry
4. Existing records unchanged (use migration script to recalc all)

**Adding New KPI:**
1. Add card HTML in `index.html`
2. Add calculation in `calculateKPIs()`
3. Add display logic in `updateKPIs()`
4. Add CSS styling if needed

**Adding New Chart:**
1. Add canvas in `index.html`
2. Create `createXXXChart()` in `charts.js`
3. Call from `initialize()`
4. Prepare data in `getChartData()`

---

## 📧 Support

**For Questions About:**
- **Usage**: Read README.md
- **Setup**: Read QUICKSTART.md
- **Technical Details**: Read this file (DOCUMENTATION.md)
- **Project Stats**: Read PROJECT_SUMMARY.md

**For Claude AI:**
- Share this file for complete context
- Mention specific feature or file you're asking about
- Claude can help with modifications, bug fixes, and new features

---

**Last Updated**: March 15, 2026
**Documentation Version**: 1.0
**Project Status**: Complete & Production Ready ✅
