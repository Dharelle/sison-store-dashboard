/**
 * Dashboard controller for Sison Store Dashboard
 * Manages dashboard UI and data display
 */

class Dashboard {
  constructor() {
    this.isLoading = false;
    this.kpis = null;
  }

  /**
   * Initialize dashboard
   */
  async initialize() {
    // Check if GitHub is configured
    if (!githubAPI.isConfigured()) {
      this.showSetupPrompt();
      return;
    }

    await this.loadDashboard();
  }

  /**
   * Show setup prompt
   */
  showSetupPrompt() {
    const main = document.querySelector('main');
    main.innerHTML = `
      <div class="setup-prompt">
        <div class="setup-card">
          <h2>Welcome to Sison Store Dashboard</h2>
          <p>To get started, you need to configure your GitHub connection.</p>
          <p>This will allow the dashboard to automatically save your data to GitHub.</p>
          <a href="setup.html" class="btn btn-primary">Complete Setup</a>
        </div>
      </div>
    `;
  }

  /**
   * Load dashboard data
   */
  async loadDashboard(forceRefresh = false) {
    if (this.isLoading) return;

    try {
      this.isLoading = true;
      this.showLoadingState();

      // Initialize data
      await dataManager.initialize(forceRefresh);

      // Calculate KPIs
      this.kpis = dataManager.calculateKPIs();

      // Update UI
      this.updateKPIs();
      this.updateRecentTransactions();
      this.updateRecentPisoWifi();
      this.updateRecentPrinter();

      // Initialize charts if on dashboard page
      if (typeof chartsManager !== 'undefined') {
        chartsManager.initialize();
      }

      // Update sync status
      this.updateSyncStatus();

    } catch (error) {
      console.error('Failed to load dashboard:', error);
      Utils.showNotification('Failed to load data: ' + error.message, 'error');
    } finally {
      this.isLoading = false;
      this.hideLoadingState();
    }
  }

  /**
   * Show loading state
   */
  showLoadingState() {
    const main = document.querySelector('main');
    if (main) {
      main.classList.add('loading');
    }
  }

  /**
   * Hide loading state
   */
  hideLoadingState() {
    const main = document.querySelector('main');
    if (main) {
      main.classList.remove('loading');
    }
  }

  /**
   * Update KPI cards
   */
  updateKPIs() {
    if (!this.kpis) return;

    // Total Revenue
    const totalRevenueEl = document.getElementById('total-revenue');
    if (totalRevenueEl) {
      totalRevenueEl.textContent = Utils.formatCurrency(this.kpis.totalRevenue);
    }

    // Average Monthly
    const avgMonthlyEl = document.getElementById('avg-monthly');
    if (avgMonthlyEl) {
      avgMonthlyEl.textContent = Utils.formatCurrency(this.kpis.avgMonthly);
    }

    // Best Month
    const bestMonthEl = document.getElementById('best-month');
    const bestMonthAmountEl = document.getElementById('best-month-amount');
    if (bestMonthEl && bestMonthAmountEl) {
      bestMonthEl.textContent = this.kpis.bestMonth.month;
      bestMonthAmountEl.textContent = Utils.formatCurrency(this.kpis.bestMonth.revenue);
    }

    // Worst Month
    const worstMonthEl = document.getElementById('worst-month');
    const worstMonthAmountEl = document.getElementById('worst-month-amount');
    if (worstMonthEl && worstMonthAmountEl) {
      worstMonthEl.textContent = this.kpis.worstMonth.month;
      worstMonthAmountEl.textContent = Utils.formatCurrency(this.kpis.worstMonth.revenue);
    }

    // This Month
    const thisMonthEl = document.getElementById('this-month');
    if (thisMonthEl) {
      thisMonthEl.textContent = Utils.formatCurrency(this.kpis.thisMonth);
    }

    // Store Sales Amount & Percentage
    const storeSalesAmountEl = document.getElementById('store-sales-amount');
    if (storeSalesAmountEl) {
      storeSalesAmountEl.textContent = Utils.formatCurrency(this.kpis.storeSalesAmount);
    }
    const storeSalesPercentEl = document.getElementById('store-sales-percent');
    if (storeSalesPercentEl) {
      storeSalesPercentEl.textContent = `${this.kpis.storeSalesPercentage.toFixed(1)}%`;
    }

    // Piso WiFi Amount & Percentage
    const pisoWifiAmountEl = document.getElementById('piso-wifi-amount');
    if (pisoWifiAmountEl) {
      pisoWifiAmountEl.textContent = Utils.formatCurrency(this.kpis.pisoWifiAmount);
    }
    const pisoWifiPercentEl = document.getElementById('piso-wifi-percent');
    if (pisoWifiPercentEl) {
      pisoWifiPercentEl.textContent = `${this.kpis.pisoWifiPercentage.toFixed(1)}%`;
    }

    // Printer Amount & Percentage
    const printerAmountEl = document.getElementById('printer-amount');
    if (printerAmountEl) {
      printerAmountEl.textContent = Utils.formatCurrency(this.kpis.printerAmount);
    }
    const printerPercentEl = document.getElementById('printer-percent');
    if (printerPercentEl) {
      printerPercentEl.textContent = `${this.kpis.printerPercentage.toFixed(1)}%`;
    }
  }

  /**
   * Update recent transactions table (with filtering)
   */
  updateRecentTransactions() {
    const tbody = document.getElementById('recent-transactions');
    if (!tbody) return;

    // Get filtered transactions
    const filteredSales = dataManager.filterByDateRange(dataManager.data.storeSales, 'date');
    const transactions = filteredSales
      .filter(s => s.totalProfit > 0)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    if (transactions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">No transactions in this period</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = transactions.map(t => `
      <tr>
        <td>${Utils.formatDate(t.date)}</td>
        <td>${Utils.formatCurrency(t.gcashTotal)}</td>
        <td>${Utils.formatCurrency(t.sariSariStore)}</td>
        <td>${Utils.formatCurrency(t.orders)}</td>
        <td class="font-semibold">${Utils.formatCurrency(t.totalProfit)}</td>
      </tr>
    `).join('');
  }

  /**
   * Update recent Piso WiFi table (with filtering)
   */
  updateRecentPisoWifi() {
    const tbody = document.getElementById('recent-piso-wifi');
    if (!tbody) return;

    // Get filtered records
    const filteredWifi = dataManager.filterMonthlyData(dataManager.data.pisoWifi);
    const records = filteredWifi
      .filter(p => p.revenue > 0)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return Utils.getMonthNumber(b.month) - Utils.getMonthNumber(a.month);
      })
      .slice(0, 10);

    if (records.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center">No records in this period</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = records.map(r => `
      <tr>
        <td>${r.month}</td>
        <td>${r.year}</td>
        <td class="font-semibold">${Utils.formatCurrency(r.revenue)}</td>
      </tr>
    `).join('');
  }

  /**
   * Update recent Printer table (with filtering)
   */
  updateRecentPrinter() {
    const tbody = document.getElementById('recent-printer');
    if (!tbody) return;

    // Get filtered records
    const filteredPrinter = dataManager.filterMonthlyData(dataManager.data.printer);
    const records = filteredPrinter
      .filter(p => p.income > 0)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return Utils.getMonthNumber(b.month) - Utils.getMonthNumber(a.month);
      })
      .slice(0, 10);

    if (records.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center">No records in this period</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = records.map(r => `
      <tr>
        <td>${r.month}</td>
        <td>${r.year}</td>
        <td class="font-semibold">${Utils.formatCurrency(r.income)}</td>
      </tr>
    `).join('');
  }

  /**
   * Update sync status
   */
  updateSyncStatus() {
    const syncStatusEl = document.getElementById('sync-status');
    if (!syncStatusEl) return;

    const lastSync = storage.getLastSyncTime();
    if (lastSync) {
      const timeAgo = this.getTimeAgo(lastSync);
      syncStatusEl.innerHTML = `
        <span class="sync-indicator"></span>
        Last synced: ${timeAgo}
      `;
    } else {
      syncStatusEl.innerHTML = `
        <span class="sync-indicator"></span>
        Not synced yet
      `;
    }
  }

  /**
   * Get time ago string
   */
  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';

    return 'just now';
  }

  /**
   * Refresh data
   */
  async refresh() {
    await this.loadDashboard(true);
    Utils.showNotification('Dashboard refreshed', 'success');
  }

  /**
   * Export data
   */
  async exportData() {
    try {
      await storage.exportData();
      Utils.showNotification('Data exported successfully', 'success');
    } catch (error) {
      Utils.showNotification('Failed to export data: ' + error.message, 'error');
    }
  }
}

// Dark Mode Toggle
function initDarkMode() {
  // Check saved preference
  const darkMode = localStorage.getItem('darkMode') === 'true';
  if (darkMode) {
    document.body.classList.add('dark-mode');
  }

  // Set up toggle button
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('darkMode', isDark);
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize dark mode first
  initDarkMode();

  const dashboard = new Dashboard();
  await dashboard.initialize();

  // Set up refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => dashboard.refresh());
  }

  // Set up export button
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => dashboard.exportData());
  }

  // Set up time filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      // Remove active class from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));

      // Add active class to clicked button
      btn.classList.add('active');

      // Get filter value
      const filter = btn.getAttribute('data-filter');

      console.log('Filter button clicked:', filter);

      // Apply filter FIRST before any calculations
      dataManager.setFilter(filter);

      console.log('DataManager filter set to:', dataManager.currentFilter);

      // Recalculate and update dashboard
      dashboard.kpis = dataManager.calculateKPIs();
      dashboard.updateKPIs();
      dashboard.updateRecentTransactions();
      dashboard.updateRecentPisoWifi();
      dashboard.updateRecentPrinter();

      // Update charts - IMPORTANT: Destroy and recreate with new data
      if (typeof chartsManager !== 'undefined') {
        chartsManager.destroy();
        chartsManager.initialize();
      }

      // Update subtitle text
      const subtitle = document.querySelector('.kpi-card.highlight .kpi-subtitle');
      if (subtitle) {
        const filterText = {
          'month': 'This month',
          'lastmonth': 'Last month',
          'quarter': 'Last 3 months',
          '6months': 'Last 6 months',
          'year': 'Last 12 months',
          'all': 'All time'
        };
        subtitle.textContent = filterText[filter] || 'All time';
      }
    });
  });
});
