# Sison Store Business Dashboard

A web-based dashboard for managing and visualizing business data across three revenue streams: Store Sales, Piso WiFi, and Printer services. Built with vanilla HTML/CSS/JavaScript, using GitHub as both hosting and database.

## Features

- **📊 Real-time Dashboard**: View KPIs, charts, and recent transactions
- **📝 Data Entry Forms**: Easy-to-use forms for adding new data
- **💾 Auto-Save to GitHub**: Every entry automatically commits to your GitHub repository
- **📈 Charts & Visualizations**: Revenue trends, monthly performance, and breakdowns
- **📱 Mobile Responsive**: Works on desktop, tablet, and mobile devices
- **🔄 Automatic Backup**: Git history provides complete version control
- **🌐 Free Hosting**: Hosted on GitHub Pages (no server required)

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Charts**: Chart.js (via CDN)
- **Storage**: JSON files in `/data` directory
- **Auto-commit**: GitHub REST API
- **Hosting**: GitHub Pages

## Project Structure

```
sison-store-dashboard/
├── index.html              # Dashboard page
├── input.html              # Data entry forms
├── setup.html              # GitHub configuration
├── css/
│   ├── main.css           # Global styles
│   ├── dashboard.css      # Dashboard styles
│   └── forms.css          # Form styles
├── js/
│   ├── config.js          # Configuration
│   ├── utils.js           # Utility functions
│   ├── github-api.js      # GitHub API wrapper
│   ├── storage.js         # Storage & caching
│   ├── data-manager.js    # Business logic
│   ├── dashboard.js       # Dashboard controller
│   ├── charts.js          # Chart rendering
│   └── forms.js           # Form handling
├── data/
│   ├── store_sales.json   # Store sales transactions
│   ├── piso_wifi.json     # Piso WiFi monthly revenue
│   ├── printer.json       # Printer monthly income
│   └── metadata.json      # Metadata & counters
└── scripts/
    └── migrate-excel-to-json.py  # Data migration script
```

## Prerequisites

### For Personal Laptop Setup

1. **Git**: [Download Git](https://git-scm.com/downloads)
2. **Python 3.7+**: [Download Python](https://www.python.org/downloads/) (for data migration)
3. **Text Editor**: VS Code recommended ([Download](https://code.visualstudio.com/))
4. **Web Browser**: Chrome or Firefox

### Python Packages (for migration)

```bash
pip install pandas openpyxl
```

## Setup Instructions

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click "New repository"
3. Name: `sison-store-dashboard`
4. Description: "Business dashboard for Sison Store"
5. Privacy: Choose Public or Private
6. Click "Create repository"

### Step 2: Clone or Download Project

**Option A: Via Git Clone** (if already pushed)
```bash
git clone https://github.com/YOUR_USERNAME/sison-store-dashboard.git
cd sison-store-dashboard
```

**Option B: Manual Copy**
1. Copy entire project folder to your personal laptop
2. Open terminal in project directory
3. Initialize git:
```bash
cd sison-store-dashboard
git init
git remote add origin https://github.com/YOUR_USERNAME/sison-store-dashboard.git
```

### Step 3: Migrate Excel Data (First Time Only)

**IMPORTANT**: Before running the migration, copy your `Store Sales_5Year_Restructured.xlsx` file to the project root directory.

```bash
# Ensure you're in the project directory
cd sison-store-dashboard

# Run migration script
python scripts/migrate-excel-to-json.py

# Verify output files were created
ls -l data/
# Should show: store_sales.json, piso_wifi.json, printer.json, metadata.json
```

The migration script will:
- Read all sheets from your Excel file
- Convert data to JSON format
- Generate unique IDs for each record
- Create properly formatted JSON files

### Step 4: Push to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: Dashboard setup with data"

# Push to GitHub
git push -u origin main
```

**Note**: If prompted for credentials, enter:
- Username: Your GitHub username
- Password: Personal Access Token (see Step 5)

### Step 5: Create GitHub Personal Access Token

1. Go to [GitHub Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Settings:
   - **Name**: `Sison Store Dashboard`
   - **Expiration**: No expiration (or 1 year)
   - **Scopes**: Check ✅ **`repo`** (Full control of private repositories)
4. Click "Generate token"
5. **COPY THE TOKEN** - you won't see it again!
6. Save it in a password manager (LastPass, 1Password, etc.)

### Step 6: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under "Source":
   - Branch: `main`
   - Folder: `/` (root)
4. Click **Save**
5. Wait 2-3 minutes for deployment
6. Your site will be live at: `https://YOUR_USERNAME.github.io/sison-store-dashboard`

### Step 7: Configure the Dashboard

1. Visit your deployed site: `https://YOUR_USERNAME.github.io/sison-store-dashboard`
2. Click "Setup" in the navigation
3. Enter:
   - **GitHub Username**: Your username
   - **Repository Name**: `sison-store-dashboard`
   - **Personal Access Token**: Paste the token from Step 5
4. Click "Save Configuration"
5. Click "Test Connection" to verify
6. If successful, you'll be redirected to the dashboard

## Usage

### Viewing the Dashboard

1. Visit `https://YOUR_USERNAME.github.io/sison-store-dashboard`
2. View KPIs, charts, and recent transactions
3. Click "Refresh" to reload data from GitHub

### Adding New Data

1. Click "Add Data" in navigation
2. Choose form:
   - **Store Sales**: Daily transactions with profit calculations
   - **Piso WiFi**: Monthly revenue
   - **Printer**: Monthly income
3. Fill in the form
4. Click submit button
5. Data automatically commits to GitHub
6. View confirmation message
7. Check GitHub repository for new commit

### Profit Calculations (Store Sales)

The dashboard automatically calculates profits based on these margins:
- **Gcash**: 2.2% profit margin
- **Sari Sari Store**: 10% profit margin
- **Orders**: 10% profit margin

Formula:
```
Total Profit = (Gcash Total × 0.022) + (Sari Sari Store × 0.10) + (Orders × 0.10)
```

### Exporting Data

1. Go to Dashboard
2. Click "Export Data" button
3. Downloads JSON backup file
4. Save for safekeeping

## Local Development & Testing

### Test Locally (Without GitHub Pages)

```bash
# Start local server
python -m http.server 8000

# Or use a different port
python -m http.server 3000
```

Then open: `http://localhost:8000`

**Note**: For local testing, you'll need to complete the GitHub setup to save data.

### VS Code Live Server (Alternative)

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## Daily Workflow

### Morning: Pull Latest Changes
```bash
cd sison-store-dashboard
git pull
```

### After Making Changes
```bash
git add .
git commit -m "Description of changes"
git push
```

### Or Just Use the Dashboard
- Data entry through the web interface automatically commits to GitHub
- No manual git commands needed for normal use

## Troubleshooting

### Problem: Dashboard shows "GitHub not configured"

**Solution**: Visit the Setup page and enter your GitHub credentials.

### Problem: "Failed to save data" error

**Possible causes**:
1. **Invalid token**: Generate a new token with `repo` scope
2. **Network error**: Check internet connection
3. **Rate limit**: Wait a few minutes and try again (5,000 requests/hour limit)

### Problem: Python not found

**Windows**:
```bash
# Add Python to PATH
# Control Panel → System → Advanced → Environment Variables
# Add: C:\Python3x\ and C:\Python3x\Scripts\
```

**Or install from**: https://www.python.org/downloads/

### Problem: pip install fails

```bash
# Run as Administrator, or use:
python -m pip install --user pandas openpyxl
```

### Problem: Charts not displaying

**Solution**: Check browser console (F12) for errors. Ensure Chart.js CDN is loading.

### Problem: Data not syncing

**Solution**:
1. Click "Refresh" button on dashboard
2. Check browser localStorage (F12 → Application → Local Storage)
3. Clear cache and reload page
4. Check GitHub repository for recent commits

### Problem: localhost port already in use

```bash
# Try different port:
python -m http.server 8080
# Or:
python -m http.server 3000
```

### Problem: GitHub Pages not updating

**Solution**:
1. Wait 2-3 minutes after push
2. Force refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Check Settings → Pages → "Your site is live at..."
4. Clear browser cache

## Security Best Practices

1. **Use Repository-Specific Token**: Create a token just for this dashboard
2. **Limited Scope**: Only grant `repo` scope (nothing more)
3. **Shared Computers**: Clear configuration when done (Setup page → Clear Configuration)
4. **Private Repository**: Consider making the repository private if data is sensitive
5. **Regular Token Rotation**: Regenerate token every 6-12 months
6. **Backup Original Data**: Keep Excel file backed up in OneDrive/Google Drive

## Backup Strategy

### Automatic (Every Data Entry)
- Every form submission commits to GitHub
- Full version history preserved
- Can restore any previous version

### Manual Backup (Recommended Weekly)
```bash
# Export JSON files
cd sison-store-dashboard/data
cp *.json ~/Backups/dashboard-backup-$(date +%Y%m%d)/
```

Or use the dashboard's "Export Data" button.

### Restore from Backup

To restore from a previous commit:
```bash
# View commit history
git log --oneline

# Restore specific file from commit
git checkout COMMIT_HASH -- data/store_sales.json

# Or restore entire data folder
git checkout COMMIT_HASH -- data/

# Commit the restoration
git commit -m "Restore data from COMMIT_HASH"
git push
```

## Customization

### Change Profit Margins

Edit `js/config.js`:
```javascript
profitMargins: {
  gcash: 0.022,        // 2.2%
  sariSariStore: 0.10, // 10%
  orders: 0.10         // 10%
}
```

### Change Chart Colors

Edit `js/config.js`:
```javascript
chartColors: [
  '#4F46E5', // Indigo
  '#06B6D4', // Cyan
  '#10B981', // Green
  // ... add more colors
]
```

### Add More Revenue Streams

1. Create new JSON file in `data/` directory
2. Add form in `input.html`
3. Update `data-manager.js` with CRUD functions
4. Update charts in `charts.js`

## Data Schema

### Store Sales Record
```json
{
  "id": "ss_20250120_001",
  "date": "2025-01-20",
  "cashIn": 3085,
  "cashOut": 4000,
  "gcashTotal": 7085,
  "sariSariStore": 1967,
  "orders": 0,
  "gcashProfit": 155.87,
  "sariSariStoreProfit": 196.7,
  "ordersProfit": 0,
  "totalProfit": 352.57,
  "createdAt": "2026-03-15T00:00:00Z"
}
```

### Piso WiFi Record
```json
{
  "id": "pw_202501_001",
  "month": "January",
  "year": 2025,
  "revenue": 1500,
  "createdAt": "2026-03-15T00:00:00Z"
}
```

### Printer Record
```json
{
  "id": "pr_202501_001",
  "month": "January",
  "year": 2025,
  "income": 800,
  "createdAt": "2026-03-15T00:00:00Z"
}
```

## Architecture Notes

### Why GitHub as Database?
- **Free**: No hosting costs
- **Automatic Backup**: Full version history
- **Simple**: No backend server needed
- **Reliable**: GitHub's 99.9% uptime
- **Portable**: Can export to any git hosting

### Limitations
- **Rate Limits**: 5,000 API requests/hour (sufficient for personal use)
- **Single User**: Not designed for concurrent editing
- **Network Required**: Must be online to save data (local cache available)
- **Public Repository**: Data visible if repo is public (use private repo for sensitive data)

## Support

For issues or questions:
1. Check this README
2. Review browser console (F12) for errors
3. Check GitHub repository commits
4. Verify GitHub token is valid
5. Create issue on GitHub repository (if using)

## License

This project is for personal use. Modify as needed.

## Credits

Built with:
- [Chart.js](https://www.chartjs.org/) - Beautiful charts
- [GitHub REST API](https://docs.github.com/en/rest) - Data storage
- [GitHub Pages](https://pages.github.com/) - Free hosting

## Version History

- **v1.0.0** (2026-03-15) - Initial release
  - Dashboard with KPIs and charts
  - Data entry forms for all revenue streams
  - GitHub integration with auto-commit
  - Excel data migration script
  - Mobile responsive design

---

**Happy tracking! 📊**
