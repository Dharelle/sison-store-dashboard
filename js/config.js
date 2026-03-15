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

  // Business logic configuration (loaded from localStorage if available)
  profitMargins: {
    gcash: parseFloat(localStorage.getItem('profit_margin_gcash') || '2.2') / 100,
    sariSariStore: parseFloat(localStorage.getItem('profit_margin_sariSari') || '10') / 100,
    orders: parseFloat(localStorage.getItem('profit_margin_orders') || '10') / 100
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
