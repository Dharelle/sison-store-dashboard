/**
 * Data Manager for Sison Store Dashboard
 * Handles CRUD operations and business logic
 */

class DataManager {
  constructor() {
    this.data = {
      storeSales: [],
      pisoWifi: [],
      printer: [],
      metadata: {}
    };
    this.currentFilter = 'all'; // Default filter: all time
  }

  /**
   * Set time filter
   */
  setFilter(filter) {
    this.currentFilter = filter;
  }

  /**
   * Get date range based on filter
   */
  getDateRange(filter) {
    const now = new Date();
    let startDate = null;

    switch (filter) {
      case 'month':
        // This month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        // Last 3 months
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6months':
        // Last 6 months
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case 'year':
        // Last 12 months
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
        break;
      case 'all':
      default:
        // All time
        return null;
    }

    return startDate;
  }

  /**
   * Filter data by date range
   */
  filterByDateRange(data, dateField = 'date') {
    const startDate = this.getDateRange(this.currentFilter);
    if (!startDate) {
      return data; // Return all data
    }

    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate;
    });
  }

  /**
   * Initialize data from storage
   */
  async initialize(forceRefresh = false) {
    try {
      this.data = await storage.loadAllData(forceRefresh);
      return this.data;
    } catch (error) {
      console.error('Failed to initialize data:', error);
      // Return empty data structure if load fails
      this.data = {
        storeSales: [],
        pisoWifi: [],
        printer: [],
        metadata: { counters: { storeSales: 0, pisoWifi: 0, printer: 0 } }
      };
      return this.data;
    }
  }

  /**
   * Add store sales transaction
   */
  async addStoreSale(formData) {
    // Calculate profits
    const gcashProfit = formData.gcashTotal * CONFIG.profitMargins.gcash;
    const sariSariStoreProfit = formData.sariSariStore * CONFIG.profitMargins.sariSariStore;
    const ordersProfit = formData.orders * CONFIG.profitMargins.orders;
    const totalProfit = gcashProfit + sariSariStoreProfit + ordersProfit;

    // Create record
    const record = {
      id: Utils.generateId('ss', new Date(formData.date)),
      date: formData.date,
      cashIn: parseFloat(formData.cashIn),
      cashOut: parseFloat(formData.cashOut),
      gcashTotal: parseFloat(formData.gcashTotal),
      sariSariStore: parseFloat(formData.sariSariStore),
      orders: parseFloat(formData.orders),
      gcashProfit: gcashProfit,
      sariSariStoreProfit: sariSariStoreProfit,
      ordersProfit: ordersProfit,
      totalProfit: totalProfit,
      createdAt: new Date().toISOString()
    };

    // Check for duplicate date
    const duplicate = this.data.storeSales.find(s => s.date === record.date);
    if (duplicate) {
      throw new Error(`A transaction for ${record.date} already exists`);
    }

    // Add to data
    this.data.storeSales.push(record);

    // Sort by date (newest first)
    this.data.storeSales.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Update counter
    if (!this.data.metadata.counters) {
      this.data.metadata.counters = {};
    }
    this.data.metadata.counters.storeSales = this.data.storeSales.length;

    // Save to storage
    const storeSalesData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      records: this.data.storeSales
    };

    const commitMessage = GitHubAPI.createCommitMessage('store_sales', record);
    await storage.saveData(CONFIG.dataFiles.storeSales, storeSalesData, commitMessage);

    // Update metadata
    await this.updateMetadata();

    return record;
  }

  /**
   * Add Piso WiFi record
   */
  async addPisoWifi(formData) {
    const record = {
      id: Utils.generateId('pw'),
      month: formData.month,
      year: parseInt(formData.year),
      revenue: parseFloat(formData.revenue),
      createdAt: new Date().toISOString()
    };

    // Check for duplicate month/year
    const duplicate = this.data.pisoWifi.find(
      p => p.month === record.month && p.year === record.year
    );
    if (duplicate) {
      throw new Error(`${record.month} ${record.year} already exists`);
    }

    // Add to data
    this.data.pisoWifi.push(record);

    // Sort by year and month
    this.data.pisoWifi.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return Utils.getMonthNumber(b.month) - Utils.getMonthNumber(a.month);
    });

    // Update counter
    if (!this.data.metadata.counters) {
      this.data.metadata.counters = {};
    }
    this.data.metadata.counters.pisoWifi = this.data.pisoWifi.length;

    // Save to storage
    const pisoWifiData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      records: this.data.pisoWifi
    };

    const commitMessage = GitHubAPI.createCommitMessage('piso_wifi', record);
    await storage.saveData(CONFIG.dataFiles.pisoWifi, pisoWifiData, commitMessage);

    // Update metadata
    await this.updateMetadata();

    return record;
  }

  /**
   * Add Printer record
   */
  async addPrinter(formData) {
    const record = {
      id: Utils.generateId('pr'),
      month: formData.month,
      year: parseInt(formData.year),
      income: parseFloat(formData.income),
      createdAt: new Date().toISOString()
    };

    // Check for duplicate month/year
    const duplicate = this.data.printer.find(
      p => p.month === record.month && p.year === record.year
    );
    if (duplicate) {
      throw new Error(`${record.month} ${record.year} already exists`);
    }

    // Add to data
    this.data.printer.push(record);

    // Sort by year and month
    this.data.printer.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return Utils.getMonthNumber(b.month) - Utils.getMonthNumber(a.month);
    });

    // Update counter
    if (!this.data.metadata.counters) {
      this.data.metadata.counters = {};
    }
    this.data.metadata.counters.printer = this.data.printer.length;

    // Save to storage
    const printerData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      records: this.data.printer
    };

    const commitMessage = GitHubAPI.createCommitMessage('printer', record);
    await storage.saveData(CONFIG.dataFiles.printer, printerData, commitMessage);

    // Update metadata
    await this.updateMetadata();

    return record;
  }

  /**
   * Update metadata file
   */
  async updateMetadata() {
    const metadataData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      counters: this.data.metadata.counters || {},
      config: {
        profitMargins: CONFIG.profitMargins
      }
    };

    await storage.saveData(
      CONFIG.dataFiles.metadata,
      metadataData,
      'chore: Update metadata counters'
    );
  }

  /**
   * Calculate KPIs from store sales data
   */
  calculateKPIs() {
    // Apply time filter
    const sales = this.filterByDateRange(this.data.storeSales, 'date');

    if (sales.length === 0) {
      return {
        totalRevenue: 0,
        totalProfit: 0,
        avgMonthly: 0,
        bestMonth: { month: 'N/A', revenue: 0 },
        worstMonth: { month: 'N/A', revenue: 0 },
        thisMonth: 0,
        storeSalesPercentage: 0,
        pisoWifiPercentage: 0,
        printerPercentage: 0
      };
    }

    // Calculate totals
    const totalProfit = sales.reduce((sum, s) => sum + s.totalProfit, 0);
    const totalRevenue = sales.reduce((sum, s) =>
      sum + s.gcashTotal + s.sariSariStore + s.orders, 0
    );

    // Group by month
    const byMonth = Utils.groupBy(sales, (s) => {
      const date = new Date(s.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });

    const monthlyTotals = Object.entries(byMonth).map(([month, records]) => ({
      month,
      revenue: records.reduce((sum, r) => sum + r.totalProfit, 0)
    }));

    // Find best and worst months
    let bestMonth = { month: 'N/A', revenue: 0 };
    let worstMonth = { month: 'N/A', revenue: Infinity };

    monthlyTotals.forEach(m => {
      if (m.revenue > bestMonth.revenue) {
        bestMonth = m;
      }
      if (m.revenue < worstMonth.revenue) {
        worstMonth = m;
      }
    });

    // This month's revenue
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonth = byMonth[thisMonthKey]?.reduce((sum, r) => sum + r.totalProfit, 0) || 0;

    // Calculate revenue percentages
    const pisoWifiTotal = this.data.pisoWifi.reduce((sum, p) => sum + p.revenue, 0);
    const printerTotal = this.data.printer.reduce((sum, p) => sum + p.income, 0);
    const grandTotal = totalProfit + pisoWifiTotal + printerTotal;

    return {
      totalRevenue: grandTotal,
      totalProfit: totalProfit,
      avgMonthly: monthlyTotals.length > 0 ? totalProfit / monthlyTotals.length : 0,
      bestMonth: {
        month: bestMonth.month !== 'N/A' ? Utils.formatDate(bestMonth.month + '-01') : 'N/A',
        revenue: bestMonth.revenue
      },
      worstMonth: {
        month: worstMonth.month !== 'N/A' ? Utils.formatDate(worstMonth.month + '-01') : 'N/A',
        revenue: worstMonth.revenue === Infinity ? 0 : worstMonth.revenue
      },
      thisMonth: thisMonth,
      storeSalesAmount: totalProfit,
      storeSalesPercentage: Utils.calculatePercentage(totalProfit, grandTotal),
      pisoWifiAmount: pisoWifiTotal,
      pisoWifiPercentage: Utils.calculatePercentage(pisoWifiTotal, grandTotal),
      printerAmount: printerTotal,
      printerPercentage: Utils.calculatePercentage(printerTotal, grandTotal)
    };
  }

  /**
   * Get data for charts
   */
  getChartData() {
    // Apply time filter to determine how many months to show
    let monthsToShow = 12;
    if (this.currentFilter === 'month') monthsToShow = 1;
    else if (this.currentFilter === 'quarter') monthsToShow = 3;
    else if (this.currentFilter === '6months') monthsToShow = 6;
    else if (this.currentFilter === 'year') monthsToShow = 12;
    else monthsToShow = 60; // Show up to 5 years for 'all'

    // Get monthly data
    const monthsData = this.getMonthlyData(monthsToShow);

    // Get yearly summary (filtered)
    const yearlyData = this.getYearlyData();

    // Get revenue breakdown (filtered)
    const breakdown = this.getRevenueBreakdown();

    return {
      monthly: monthsData,
      yearly: yearlyData,
      breakdown: breakdown
    };
  }

  /**
   * Get monthly aggregated data
   */
  getMonthlyData(months = 12) {
    const result = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = Utils.getMonthName(date.getMonth() + 1);

      // Store sales for this month
      const storeSales = this.data.storeSales
        .filter(s => s.date.startsWith(monthKey))
        .reduce((sum, s) => sum + s.totalProfit, 0);

      // Piso WiFi for this month
      const pisoWifi = this.data.pisoWifi
        .find(p => p.month === monthName && p.year === date.getFullYear())?.revenue || 0;

      // Printer for this month
      const printer = this.data.printer
        .find(p => p.month === monthName && p.year === date.getFullYear())?.income || 0;

      result.push({
        month: monthName.substring(0, 3),
        year: date.getFullYear(),
        storeSales,
        pisoWifi,
        printer,
        total: storeSales + pisoWifi + printer
      });
    }

    return result;
  }

  /**
   * Get yearly aggregated data
   */
  getYearlyData() {
    const years = {};

    // Apply filter to all data sources
    const filteredStoreSales = this.filterByDateRange(this.data.storeSales, 'date');
    const filteredPisoWifi = this.data.pisoWifi; // Keep all for now
    const filteredPrinter = this.data.printer; // Keep all for now

    // Aggregate store sales
    filteredStoreSales.forEach(s => {
      const year = new Date(s.date).getFullYear();
      if (!years[year]) {
        years[year] = { storeSales: 0, pisoWifi: 0, printer: 0 };
      }
      years[year].storeSales += s.totalProfit;
    });

    // Aggregate piso wifi
    filteredPisoWifi.forEach(p => {
      if (!years[p.year]) {
        years[p.year] = { storeSales: 0, pisoWifi: 0, printer: 0 };
      }
      years[p.year].pisoWifi += p.revenue;
    });

    // Aggregate printer
    filteredPrinter.forEach(p => {
      if (!years[p.year]) {
        years[p.year] = { storeSales: 0, pisoWifi: 0, printer: 0 };
      }
      years[p.year].printer += p.income;
    });

    return Object.entries(years)
      .map(([year, data]) => ({
        year: parseInt(year),
        ...data,
        total: data.storeSales + data.pisoWifi + data.printer
      }))
      .sort((a, b) => a.year - b.year);
  }

  /**
   * Get revenue breakdown for pie chart
   */
  getRevenueBreakdown() {
    const filteredStoreSales = this.filterByDateRange(this.data.storeSales, 'date');
    const storeSales = filteredStoreSales.reduce((sum, s) => sum + s.totalProfit, 0);
    const pisoWifi = this.data.pisoWifi.reduce((sum, p) => sum + p.revenue, 0);
    const printer = this.data.printer.reduce((sum, p) => sum + p.income, 0);

    return {
      storeSales,
      pisoWifi,
      printer,
      total: storeSales + pisoWifi + printer
    };
  }

  /**
   * Get recent transactions
   */
  getRecentTransactions(limit = 10) {
    // Filter out zero-profit entries (rest days) and sort by date descending (newest first)
    const validTransactions = this.data.storeSales
      .filter(s => s.totalProfit > 0)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return validTransactions.slice(0, limit);
  }
}

// Create global instance
const dataManager = new DataManager();
