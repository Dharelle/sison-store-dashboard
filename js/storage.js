/**
 * Storage manager for Sison Store Dashboard
 * Handles localStorage caching and GitHub synchronization
 */

class StorageManager {
  constructor() {
    this.cachePrefix = CONFIG.storage.cachePrefix;
  }

  /**
   * Get cache key for a data file
   */
  getCacheKey(fileName) {
    return `${this.cachePrefix}${fileName}`;
  }

  /**
   * Load data from cache or GitHub
   */
  async loadData(fileName, forceRefresh = false) {
    const cacheKey = this.getCacheKey(fileName);

    // Try cache first if not forcing refresh
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          console.log(`Loaded ${fileName} from cache`);
          return data;
        } catch (error) {
          console.warn(`Failed to parse cached data for ${fileName}`, error);
        }
      }
    }

    // Load from GitHub
    if (githubAPI.isConfigured()) {
      try {
        const filePath = `${CONFIG.github.dataPath}/${fileName}`;
        const result = await githubAPI.fetchFile(filePath);

        // Cache the data
        localStorage.setItem(cacheKey, JSON.stringify(result.content));

        // Store SHA for later updates
        localStorage.setItem(`${cacheKey}_sha`, result.sha);

        console.log(`Loaded ${fileName} from GitHub`);
        return result.content;
      } catch (error) {
        console.error(`Failed to load ${fileName} from GitHub:`, error);

        // If GitHub fails, try cache as fallback
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          console.log(`Using cached ${fileName} as fallback`);
          return JSON.parse(cached);
        }

        throw error;
      }
    }

    // No GitHub configured and no cache
    throw new Error('GitHub not configured and no cached data available');
  }

  /**
   * Save data to cache and GitHub
   */
  async saveData(fileName, data, commitMessage) {
    const cacheKey = this.getCacheKey(fileName);

    // Update timestamp
    data.lastUpdated = new Date().toISOString();

    // Save to cache immediately
    localStorage.setItem(cacheKey, JSON.stringify(data));

    // Sync to GitHub if configured
    if (githubAPI.isConfigured()) {
      const filePath = `${CONFIG.github.dataPath}/${fileName}`;

      try {
        const sha = localStorage.getItem(`${cacheKey}_sha`);
        const result = await githubAPI.updateFile(filePath, data, commitMessage, sha);

        // Update stored SHA
        localStorage.setItem(`${cacheKey}_sha`, result.content.sha);

        // Update last sync time
        localStorage.setItem(CONFIG.storage.lastSync, new Date().toISOString());

        console.log(`Saved ${fileName} to GitHub`);
        return result;
      } catch (error) {
        console.error(`Failed to save ${fileName} to GitHub:`, error);

        // Auto-retry on SHA conflict (409)
        if (error.message.includes('409')) {
          console.log('SHA conflict detected, retrying with fresh SHA...');

          // Clear cached SHA and retry once
          localStorage.removeItem(`${cacheKey}_sha`);

          try {
            // Fetch fresh SHA and retry
            const result = await githubAPI.updateFile(filePath, data, commitMessage, null);

            // Update stored SHA
            localStorage.setItem(`${cacheKey}_sha`, result.content.sha);

            // Update last sync time
            localStorage.setItem(CONFIG.storage.lastSync, new Date().toISOString());

            console.log(`Saved ${fileName} to GitHub (retry succeeded)`);
            return result;
          } catch (retryError) {
            console.error(`Retry failed:`, retryError);
            throw new Error('Data conflict detected and retry failed. Please refresh the page and try again.');
          }
        } else if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('GitHub authentication failed. Please check your token in Setup.');
        } else if (error.message.includes('404')) {
          throw new Error('GitHub repository or file not found. Please check your setup.');
        }

        throw error;
      }
    } else {
      console.warn('GitHub not configured, data saved to cache only');
    }
  }

  /**
   * Load all data files
   */
  async loadAllData(forceRefresh = false) {
    try {
      const [storeSales, pisoWifi, printer, metadata] = await Promise.all([
        this.loadData(CONFIG.dataFiles.storeSales, forceRefresh),
        this.loadData(CONFIG.dataFiles.pisoWifi, forceRefresh),
        this.loadData(CONFIG.dataFiles.printer, forceRefresh),
        this.loadData(CONFIG.dataFiles.metadata, forceRefresh).catch(() => ({
          version: '1.0',
          counters: { storeSales: 0, pisoWifi: 0, printer: 0 }
        }))
      ]);

      return {
        storeSales: storeSales.records || [],
        pisoWifi: pisoWifi.records || [],
        printer: printer.records || [],
        metadata: metadata
      };
    } catch (error) {
      console.error('Failed to load data:', error);
      throw error;
    }
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.cachePrefix)) {
        localStorage.removeItem(key);
      }
    });
    console.log('Cache cleared');
  }

  /**
   * Get last sync time
   */
  getLastSyncTime() {
    const lastSync = localStorage.getItem(CONFIG.storage.lastSync);
    return lastSync ? new Date(lastSync) : null;
  }

  /**
   * Export data as JSON file (backup)
   */
  async exportData(fileName = null) {
    const data = await this.loadAllData(true);
    const exportData = {
      exportDate: new Date().toISOString(),
      version: CONFIG.version,
      data: data
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `sison-store-backup-${Utils.formatDateForInput()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Create global instance
const storage = new StorageManager();
