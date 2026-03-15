# Quick Start Guide - Sison Store Dashboard

## 🚀 For Your Personal Laptop

Follow these steps to set up the dashboard on your personal laptop after transferring from work machine.

### Prerequisites Checklist

- [ ] Git installed ([Download](https://git-scm.com/downloads))
- [ ] Python 3.7+ installed ([Download](https://www.python.org/downloads))
- [ ] Text editor installed (VS Code recommended)
- [ ] GitHub account created
- [ ] Excel file `Store Sales_5Year_Restructured.xlsx` copied to project folder

### 5-Minute Setup

#### 1. Install Python Packages
```bash
pip install pandas openpyxl
```

#### 2. Create GitHub Repository
1. Go to https://github.com → New repository
2. Name: `sison-store-dashboard`
3. Private or Public
4. Create repository

#### 3. Upload Project
```bash
# Navigate to project folder
cd path/to/sison-store-dashboard

# Initialize git (if not already done)
git init

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/sison-store-dashboard.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: Sison Store Dashboard"

# Push
git push -u origin main
```

#### 4. Migrate Excel Data
```bash
# Make sure Excel file is in project root
python scripts/migrate-excel-to-json.py
```

This will create JSON files in the `data/` folder with all your Excel data.

#### 5. Push Data to GitHub
```bash
git add data/
git commit -m "Add migrated data from Excel"
git push
```

#### 6. Enable GitHub Pages
1. Go to repository on GitHub
2. Settings → Pages
3. Source: Branch `main`, Folder `/` (root)
4. Save
5. Wait 2-3 minutes
6. Visit: `https://YOUR_USERNAME.github.io/sison-store-dashboard`

#### 7. Create Personal Access Token
1. GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Name: `Sison Store Dashboard`
4. Expiration: No expiration
5. Scope: ✅ **repo** only
6. Generate and copy token
7. **Save token in password manager!**

#### 8. Configure Dashboard
1. Visit your deployed site
2. Click "Setup" in navigation
3. Enter:
   - Username: YOUR_USERNAME
   - Repository: sison-store-dashboard
   - Token: [paste token]
4. Click "Save Configuration"
5. Click "Test Connection"
6. Should redirect to dashboard

### ✅ You're Done!

You can now:
- View dashboard at: `https://YOUR_USERNAME.github.io/sison-store-dashboard`
- Add new data via "Add Data" page
- Data automatically saves to GitHub
- View commit history for all changes

---

## 📝 Daily Usage

### View Dashboard
Just visit: `https://YOUR_USERNAME.github.io/sison-store-dashboard`

### Add New Transaction
1. Click "Add Data"
2. Fill in form (Store Sales, Piso WiFi, or Printer)
3. Click submit
4. Done! Automatically saved to GitHub

### Backup Data
1. Dashboard → Click "Export Data"
2. Saves JSON file to Downloads
3. Store in cloud/external drive

---

## 🔧 Troubleshooting

### Dashboard shows "GitHub not configured"
→ Go to Setup page, enter credentials

### "Failed to save data"
→ Check token is valid, regenerate if needed

### Python not found
→ Install Python, add to PATH

### Charts not showing
→ Check internet connection (Chart.js loads from CDN)

### Can't push to GitHub
→ Use Personal Access Token as password (not your GitHub password)

---

## 📱 Bookmark These URLs

- **Dashboard**: `https://YOUR_USERNAME.github.io/sison-store-dashboard`
- **GitHub Repo**: `https://github.com/YOUR_USERNAME/sison-store-dashboard`
- **GitHub Token Settings**: https://github.com/settings/tokens

---

## 🆘 Need Help?

Read the full [README.md](README.md) for detailed documentation.

---

**Made with ❤️ for Sison Store**
