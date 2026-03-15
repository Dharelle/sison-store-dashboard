/**
 * Configuration file for Sison Store Dashboard
 */

const CONFIG = {
  // App metadata
  appName: 'Sison Store Dashboard',
  version: '1.0.0',

  // GitHub API configuration
  github: {
    apiBaseUrl: 'https://api.github.com',
    apiVersion: '2022-11-28',
    dataPath: 'data',
    branch: 'main'
  },

  // LocalStorage keys
  storage: {
    githubToken: 'sison_store_github_token',
    githubUsername: 'sison_store_github_username',
    githubRepo: 'sison_store_github_repo',
    cachePrefix: 'sison_store_cache_',
    lastSync: 'sison_store_last_sync'
  },

  // Data files
  dataFiles: {
    storeSales: 'store_sales.json',
    pisoWifi: 'piso_wifi.json',
    printer: 'printer.json',
    metadata: 'metadata.json'
  },

  // Business logic configuration (loaded from metadata.json - syncs across devices)
  profitMargins: {
    gcash: 0.022,      // 2.2% default
    sariSariStore: 0.1, // 10% default
    orders: 0.1        // 10% default
  },

  // Function to update profit margins (call this after loading metadata)
  updateProfitMargins(margins) {
    if (margins && margins.profitMargins) {
      this.profitMargins.gcash = margins.profitMargins.gcash || this.profitMargins.gcash;
      this.profitMargins.sariSariStore = margins.profitMargins.sariSariStore || this.profitMargins.sariSariStore;
      this.profitMargins.orders = margins.profitMargins.orders || this.profitMargins.orders;
    }
  },

  // UI configuration
  ui: {
    dateFormat: 'YYYY-MM-DD',
    currencySymbol: '₱',
    chartColors: [
      '#4F46E5', // Indigo
      '#06B6D4', // Cyan
      '#10B981', // Green
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#F97316'  // Orange
    ],
    monthsToShow: 12
  },

  // API retry configuration
  retry: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 5000
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
