# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sison Store Business Dashboard** - A static web application for managing and visualizing business data across three revenue streams (Store Sales, Piso WiFi, Printer). Built with vanilla JavaScript and uses GitHub as both hosting platform and database.

## Development Commands

### Local Testing
```bash
# Start local HTTP server
python -m http.server 8000
# Then visit: http://localhost:8000
```

### Data Management Scripts
```bash
# Migrate Excel data to JSON (one-time setup)
python scripts/migrate-excel-to-json.py

# Verify data integrity
python scripts/verify-migration.py

# Recalculate all profits after margin changes
python scripts/recalculate-profits.py

# Check JSON data structure
python scripts/check-json-data.py

# Clean future-dated data
python scripts/clean-future-data.py

# Quick data checks
python check_data.py      # Check store_sales data
python check_recent.py    # Check recent entries
python check_printer.py   # Check printer data
```

### Git Workflow
No special build process. Changes to HTML/CSS/JS are immediately usable. For data entry through the web interface, commits are automated via GitHub API.

## Architecture

### Data Flow
```
User Input (Forms)
  → Validation (forms.js)
  → Business Logic (data-manager.js)
  → Storage Manager (storage.js)
  → GitHub API (github-api.js)
  → GitHub Commit (automatic)
```

### Module Structure

**JavaScript Modules** (`js/` directory):
- `config.js` - Configuration constants including profit margins (configurable via localStorage)
- `utils.js` - Utility functions for currency, dates, validation
- `github-api.js` - GitHub REST API wrapper with authentication
- `storage.js` - Hybrid localStorage caching + GitHub sync layer
- `data-manager.js` - Business logic, CRUD operations, KPI calculations
- `dashboard.js` - Dashboard UI controller and event handlers
- `charts.js` - Chart.js visualization rendering (4 chart types)
- `forms.js` - Form validation, submission, duplicate detection
- `input-tables.js` - Table-based data entry interface

**Pages**:
- `index.html` - Main dashboard with KPIs and charts
- `input.html` - Data entry forms for all revenue streams
- `input-store-sales.html` - Table-based store sales entry
- `setup.html` - GitHub authentication and configuration

**Data Files** (`data/` directory):
- `store_sales.json` - Daily transactions with profit calculations
- `piso_wifi.json` - Monthly Piso WiFi revenue
- `printer.json` - Monthly printer income
- `metadata.json` - Counters and configuration

### Storage Architecture

**Hybrid Storage System**:
- **localStorage**: Browser-side cache for fast reads, stores GitHub credentials
- **GitHub Files**: Source of truth, all writes trigger git commits
- **Sync Strategy**: Read from cache first, fall back to GitHub; all writes go to GitHub

### Business Logic

**Profit Calculations** (Store Sales):
- Profit margins are stored in `data/metadata.json` and sync across all devices via GitHub
- Default margins: Gcash (2.2%), Sari Sari Store (10%), Orders (10%)
- To change margins: Use Setup page → Profit Margin Settings section
- Margins are saved to GitHub and automatically sync to all devices
- After changing margins, run `python scripts/recalculate-profits.py` to update all existing records
- Old localStorage-based margins are deprecated and automatically cleaned up

**ID Generation**:
- Store Sales: `ss_YYYYMMDD_NNN` (e.g., `ss_20250120_001`)
- Piso WiFi: `pw_YYYYMM_NNN` (e.g., `pw_202501_001`)
- Printer: `pr_YYYYMM_NNN` (e.g., `pr_202501_001`)

**Revenue Dashboard Display**:
- Dashboard shows five separate revenue streams: Gcash, Sari Sari Store, Orders, Piso WiFi, and Printer
- Gcash/Sari Sari/Orders percentages are calculated relative to total store sales revenue
- Piso WiFi and Printer percentages are calculated relative to grand total (all revenue streams)

## Important Patterns

### Modifying Profit Margins

1. **Via Setup Page** (Recommended):
   - Navigate to setup.html
   - Scroll to "Profit Margin Settings" section
   - Enter new margin percentages
   - Click "Save Profit Margins" - this saves to GitHub (metadata.json)
   - Changes automatically sync to all devices

2. **After Changes**:
   - Run `python scripts/recalculate-profits.py` to update all existing records
   - This reads margins from metadata.json and recalculates profits for all store_sales.json entries
   - Push changes to GitHub to sync across devices

### Adding New Revenue Streams

1. Create new JSON file in `data/` directory
2. Add data file reference in `js/config.js`
3. Create form in `input.html` or new HTML page
4. Add CRUD functions in `data-manager.js`
5. Update charts in `charts.js` to include new data
6. Add validation logic in `forms.js`

### Working with GitHub API

The `github-api.js` module handles all GitHub interactions:
- Reads/writes use GitHub REST API (not git CLI)
- Each write creates a new commit
- Requires Personal Access Token with `repo` scope
- Configuration stored in localStorage (see `setup.html`)

### Data Validation

All forms enforce validation:
- Required fields
- Numeric validation for currency amounts
- Date validation (no future dates beyond current month)
- Duplicate detection (same date/month checks)
- See `forms.js` for validation logic

## Common Tasks

### Testing Locally After Changes
```bash
# Start server
python -m http.server 8000

# Visit in browser
# http://localhost:8000

# Note: GitHub integration requires valid token even locally
```

### Adding Test Data
Use the web interface (input.html) rather than manually editing JSON files. The forms handle validation, ID generation, and profit calculations automatically.

### Debugging Data Issues
```bash
# Check recent entries
python check_recent.py

# Verify all data structure
python scripts/check-json-data.py

# Check specific revenue stream
python check_printer.py
```

### Recovering from Data Corruption
```bash
# View commit history
git log --oneline data/

# Restore specific file from commit
git checkout COMMIT_HASH -- data/store_sales.json

# Commit restoration
git commit -m "Restore data from COMMIT_HASH"
git push
```

## Key Constraints

1. **No Build Process**: Pure vanilla JS/HTML/CSS - no webpack, babel, or transpilation
2. **Single User Design**: Not built for concurrent editing (race conditions possible)
3. **GitHub Rate Limits**: 5,000 API requests/hour (each form submission = 2-3 calls)
4. **Browser Storage**: GitHub credentials stored in localStorage (warn users on shared computers)
5. **Online Requirement**: Must be online to save data (can read from cache offline)

## Python Dependencies

When working with scripts:
```bash
pip install pandas openpyxl
```

## Security Notes

- Personal Access Token has `repo` scope only
- Token stored in browser localStorage (not in code)
- Avoid committing tokens or credentials to repository
- Use private GitHub repository if data is sensitive
- Setup page includes warnings about shared computers

## File Modification Guidelines

When editing code:
- **DO NOT** add frameworks or dependencies (keep vanilla JS)
- **DO NOT** modify JSON data files directly (use web interface or scripts)
- **DO** maintain the modular structure (one module per file)
- **DO** update profit margins via localStorage (not hardcoded values)
- **DO** run recalculate-profits.py after changing margins
- **DO** test with local server before committing

## Chart.js Integration

Charts load from CDN (no local copy):
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

Four chart types in use:
1. Revenue Trends (line chart)
2. Monthly Performance (stacked bar)
3. Revenue Breakdown (doughnut)
4. Yearly Summary (bar chart)

See `js/charts.js` for chart rendering logic.
