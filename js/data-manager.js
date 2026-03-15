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
      case 'lastmonth':
        // Last month (previous month only)
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
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
   * Get end date for "lastmonth" filter (to exclude current month)
   */
  getEndDate(filter) {
    if (filter === 'lastmonth') {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
    }
    return null;
  }

  /**
   * Filter data by date range
   */
  filterByDateRange(data, dateField = 'date') {
    const startDate = this.getDateRange(this.currentFilter);
    if (!startDate) {
      return data; // Return all data
    }

    const endDate = this.getEndDate(this.currentFilter);

    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      if (endDate) {
        return itemDate >= startDate && itemDate < endDate;
      }
      return itemDate >= startDate;
    });
  }

  /**
   * Filter monthly data (pisoWifi, printer) by month/year
   */
  filterMonthlyData(data) {
    const startDate = this.getDateRange(this.currentFilter);
    if (!startDate) {
      return data; // Return all data
    }

    const endDate = this.getEndDate(this.currentFilter);

    // Get the start month and year from startDate
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth() + 1; // 1-12

    let endYear = null;
    let endMonth = null;
    if (endDate) {
      endYear = endDate.getFullYear();
      endMonth = endDate.getMonth() + 1; // 1-12
    }

    return data.filter(item => {
      // Convert month name to month number (case-insensitive)
      const monthNum = Utils.getMonthNumber(item.month);
      const itemYear = item.year;

      // Check start range
      if (itemYear < startYear) return false;
      if (itemYear === startYear && monthNum < startMonth) return false;

      // Check end range (if exists)
      if (endYear) {
        if (itemYear > endYear) return false;
        if (itemYear === endYear && monthNum >= endMonth) return false;
      }

      return true;
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
    const existingIndex = this.data.pisoWifi.findIndex(
      p => p.month.toLowerCase() === record.month.toLowerCase() && p.year === record.year
    );

    if (existingIndex !== -1) {
      // If existing record has zero revenue, update it; otherwise throw error
      if (this.data.pisoWifi[existingIndex].revenue === 0) {
        // Update the existing record
        this.data.pisoWifi[existingIndex] = record;
        console.log(`Updated ${record.month} ${record.year} (was ₱0)`);
      } else {
        throw new Error(`${record.month} ${record.year} already exists with ₱${this.data.pisoWifi[existingIndex].revenue}`);
      }
    } else {
      // Add new record
      this.data.pisoWifi.push(record);
    }

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
    const existingIndex = this.data.printer.findIndex(
      p => p.month.toLowerCase() === record.month.toLowerCase() && p.year === record.year
    );

    if (existingIndex !== -1) {
      // If existing record has zero income, update it; otherwise throw error
      if (this.data.printer[existingIndex].income === 0) {
        // Update the existing record
        this.data.printer[existingIndex] = record;
        console.log(`Updated ${record.month} ${record.year} (was ₱0)`);
      } else {
        throw new Error(`${record.month} ${record.year} already exists with ₱${this.data.printer[existingIndex].income}`);
      }
    } else {
      // Add new record
      this.data.printer.push(record);
    }

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
    })).filter(m => m.revenue > 0); // Only count months with actual revenue

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

    // This month's revenue (ALL revenue streams)
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthName = Utils.getMonthName(now.getMonth() + 1);
    const currentYear = now.getFullYear();

    // Store Sales for this month
    const thisMonthStoreSales = byMonth[thisMonthKey]?.reduce((sum, r) => sum + r.totalProfit, 0) || 0;

    // Piso WiFi for this month
    const thisMonthPisoWifi = this.data.pisoWifi.find(
      p => p.month.toLowerCase() === currentMonthName.toLowerCase() && p.year === currentYear
    )?.revenue || 0;

    // Printer for this month
    const thisMonthPrinter = this.data.printer.find(
      p => p.month.toLowerCase() === currentMonthName.toLowerCase() && p.year === currentYear
    )?.income || 0;

    // Total for this month (all streams)
    const thisMonth = thisMonthStoreSales + thisMonthPisoWifi + thisMonthPrinter;

    // Calculate revenue percentages (apply filter to Piso WiFi and Printer)
    const filteredPisoWifi = this.filterMonthlyData(this.data.pisoWifi);
    const filteredPrinter = this.filterMonthlyData(this.data.printer);

    const pisoWifiTotal = filteredPisoWifi.reduce((sum, p) => sum + p.revenue, 0);
    const printerTotal = filteredPrinter.reduce((sum, p) => sum + p.income, 0);
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
    else if (this.currentFilter === 'lastmonth') monthsToShow = 1;
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

    // Get filtered data for all streams
    const filteredStoreSales = this.filterByDateRange(this.data.storeSales, 'date');
    const filteredPisoWifi = this.filterMonthlyData(this.data.pisoWifi);
    const filteredPrinter = this.filterMonthlyData(this.data.printer);

    console.log('getMonthlyData - Filter:', this.currentFilter);
    console.log('Filtered Store Sales:', filteredStoreSales.length);
    console.log('Filtered Piso WiFi:', filteredPisoWifi.length);
    console.log('Filtered Printer:', filteredPrinter.length);

    // Calculate which months to show
    let monthsToIterate = [];
    if (this.currentFilter === 'lastmonth') {
      // Show only previous month (e.g., February if current is March)
      monthsToIterate = [1]; // Previous month only
    } else {
      // Show last N months including current month
      for (let i = months - 1; i >= 0; i--) {
        monthsToIterate.push(i);
      }
    }

    for (const i of monthsToIterate) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      console.log(`Processing month offset ${i}: ${Utils.getMonthName(date.getMonth() + 1)} ${date.getFullYear()}`);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = Utils.getMonthName(date.getMonth() + 1);

      // Store sales for this month
      const monthStoreSales = filteredStoreSales.filter(s => s.date.startsWith(monthKey));
      const storeSales = monthStoreSales.reduce((sum, s) => sum + s.totalProfit, 0);

      // Store sales components
      const gcashTotal = monthStoreSales.reduce((sum, s) => sum + s.gcashTotal, 0);
      const sariSariStore = monthStoreSales.reduce((sum, s) => sum + s.sariSariStore, 0);
      const orders = monthStoreSales.reduce((sum, s) => sum + s.orders, 0);

      // Piso WiFi for this month (case-insensitive match)
      const pisoWifi = filteredPisoWifi
        .find(p => p.month.toLowerCase() === monthName.toLowerCase() && p.year === date.getFullYear())?.revenue || 0;

      // Printer for this month (case-insensitive match)
      const printer = filteredPrinter
        .find(p => p.month.toLowerCase() === monthName.toLowerCase() && p.year === date.getFullYear())?.income || 0;

      result.push({
        month: monthName.substring(0, 3),
        year: date.getFullYear(),
        storeSales,
        pisoWifi,
        printer,
        gcashTotal,
        sariSariStore,
        orders,
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
    const filteredPisoWifi = this.filterMonthlyData(this.data.pisoWifi);
    const filteredPrinter = this.filterMonthlyData(this.data.printer);

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
    const filteredPisoWifi = this.filterMonthlyData(this.data.pisoWifi);
    const filteredPrinter = this.filterMonthlyData(this.data.printer);

    const storeSales = filteredStoreSales.reduce((sum, s) => sum + s.totalProfit, 0);
    const pisoWifi = filteredPisoWifi.reduce((sum, p) => sum + p.revenue, 0);
    const printer = filteredPrinter.reduce((sum, p) => sum + p.income, 0);

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

  /**
   * Get recent Piso WiFi records
   */
  getRecentPisoWifi(limit = 10) {
    return this.data.pisoWifi
      .filter(p => p.revenue > 0)
      .sort((a, b) => {
        // Sort by year desc, then month desc
        if (a.year !== b.year) return b.year - a.year;
        return Utils.getMonthNumber(b.month) - Utils.getMonthNumber(a.month);
      })
      .slice(0, limit);
  }

  /**
   * Get recent Printer records
   */
  getRecentPrinter(limit = 10) {
    return this.data.printer
      .filter(p => p.income > 0)
      .sort((a, b) => {
        // Sort by year desc, then month desc
        if (a.year !== b.year) return b.year - a.year;
        return Utils.getMonthNumber(b.month) - Utils.getMonthNumber(a.month);
      })
      .slice(0, limit);
  }

  /**
   * Update store sales record
   */
  async updateStoreSale(id, formData) {
    const index = this.data.storeSales.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Record not found');
    }

    // Calculate profits
    const gcashProfit = formData.gcashTotal * CONFIG.profitMargins.gcash;
    const sariSariStoreProfit = formData.sariSariStore * CONFIG.profitMargins.sariSariStore;
    const ordersProfit = formData.orders * CONFIG.profitMargins.orders;
    const totalProfit = gcashProfit + sariSariStoreProfit + ordersProfit;

    // Update record
    this.data.storeSales[index] = {
      ...this.data.storeSales[index],
      date: formData.date,
      cashIn: parseFloat(formData.cashIn),
      cashOut: parseFloat(formData.cashOut),
      gcashTotal: parseFloat(formData.gcashTotal),
      sariSariStore: parseFloat(formData.sariSariStore),
      orders: parseFloat(formData.orders),
      gcashProfit: gcashProfit,
      sariSariStoreProfit: sariSariStoreProfit,
      ordersProfit: ordersProfit,
      totalProfit: totalProfit
    };

    // Save to storage
    const storeSalesData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      records: this.data.storeSales
    };

    await storage.saveData(
      CONFIG.dataFiles.storeSales,
      storeSalesData,
      `chore: Update store sales record ${formData.date}`
    );

    return this.data.storeSales[index];
  }

  /**
   * Update Piso WiFi record
   */
  async updatePisoWifi(id, formData) {
    const index = this.data.pisoWifi.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Record not found');
    }

    this.data.pisoWifi[index] = {
      ...this.data.pisoWifi[index],
      month: formData.month,
      year: parseInt(formData.year),
      revenue: parseFloat(formData.revenue)
    };

    const pisoWifiData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      records: this.data.pisoWifi
    };

    await storage.saveData(
      CONFIG.dataFiles.pisoWifi,
      pisoWifiData,
      `chore: Update Piso WiFi record ${formData.month} ${formData.year}`
    );

    return this.data.pisoWifi[index];
  }

  /**
   * Update Printer record
   */
  async updatePrinter(id, formData) {
    const index = this.data.printer.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Record not found');
    }

    this.data.printer[index] = {
      ...this.data.printer[index],
      month: formData.month,
      year: parseInt(formData.year),
      income: parseFloat(formData.income)
    };

    const printerData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      records: this.data.printer
    };

    await storage.saveData(
      CONFIG.dataFiles.printer,
      printerData,
      `chore: Update Printer record ${formData.month} ${formData.year}`
    );

    return this.data.printer[index];
  }

  /**
   * Delete store sales record
   */
  async deleteStoreSale(id) {
    const index = this.data.storeSales.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Record not found');
    }

    const deletedRecord = this.data.storeSales[index];
    this.data.storeSales.splice(index, 1);

    const storeSalesData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      records: this.data.storeSales
    };

    await storage.saveData(
      CONFIG.dataFiles.storeSales,
      storeSalesData,
      `chore: Delete store sales record ${deletedRecord.date}`
    );

    return deletedRecord;
  }

  /**
   * Delete Piso WiFi record
   */
  async deletePisoWifi(id) {
    const index = this.data.pisoWifi.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Record not found');
    }

    const deletedRecord = this.data.pisoWifi[index];
    this.data.pisoWifi.splice(index, 1);

    const pisoWifiData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      records: this.data.pisoWifi
    };

    await storage.saveData(
      CONFIG.dataFiles.pisoWifi,
      pisoWifiData,
      `chore: Delete Piso WiFi record ${deletedRecord.month} ${deletedRecord.year}`
    );

    return deletedRecord;
  }

  /**
   * Delete Printer record
   */
  async deletePrinter(id) {
    const index = this.data.printer.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Record not found');
    }

    const deletedRecord = this.data.printer[index];
    this.data.printer.splice(index, 1);

    const printerData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      records: this.data.printer
    };

    await storage.saveData(
      CONFIG.dataFiles.printer,
      printerData,
      `chore: Delete Printer record ${deletedRecord.month} ${deletedRecord.year}`
    );

    return deletedRecord;
  }
}

// Create global instance
const dataManager = new DataManager();
