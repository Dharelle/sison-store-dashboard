/**
 * Utility functions for Sison Store Dashboard
 */

const Utils = {
  /**
   * Format number as currency
   */
  formatCurrency(amount) {
    return `${CONFIG.ui.currencySymbol}${parseFloat(amount).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  },

  /**
   * Format date to readable string
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  /**
   * Format date for input field (YYYY-MM-DD)
   */
  formatDateForInput(date = new Date()) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Parse date from various formats
   */
  parseDate(dateString) {
    return new Date(dateString);
  },

  /**
   * Get month name from number (1-12)
   */
  getMonthName(monthNum) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNum - 1] || '';
  },

  /**
   * Get month number from name (case-insensitive)
   */
  getMonthNumber(monthName) {
    if (!monthName) return 0;

    const months = {
      'january': 1, 'february': 2, 'march': 3, 'april': 4,
      'may': 5, 'june': 6, 'july': 7, 'august': 8,
      'september': 9, 'october': 10, 'november': 11, 'december': 12
    };
    return months[monthName.toLowerCase()] || 0;
  },

  /**
   * Generate unique ID
   */
  generateId(prefix, date = new Date()) {
    const timestamp = date.getTime();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}_${timestamp}_${random}`;
  },

  /**
   * Calculate percentage
   */
  calculatePercentage(part, total) {
    if (total === 0) return 0;
    return (part / total) * 100;
  },

  /**
   * Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Show notification/toast
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  },

  /**
   * Show loading indicator
   */
  showLoading(element, message = 'Loading...') {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = `
      <div class="spinner"></div>
      <p>${message}</p>
    `;
    element.appendChild(loader);
    return loader;
  },

  /**
   * Hide loading indicator
   */
  hideLoading(loader) {
    if (loader && loader.parentNode) {
      loader.parentNode.removeChild(loader);
    }
  },

  /**
   * Validate required fields
   */
  validateRequired(formData, requiredFields) {
    const errors = [];
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field] === '') {
        errors.push(`${field} is required`);
      }
    });
    return errors;
  },

  /**
   * Validate numeric field
   */
  validateNumeric(value, fieldName) {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return `${fieldName} must be a valid number`;
    }
    if (num < 0) {
      return `${fieldName} cannot be negative`;
    }
    return null;
  },

  /**
   * Deep clone object
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Sort array of objects by key
   */
  sortByKey(array, key, ascending = true) {
    return array.sort((a, b) => {
      if (a[key] < b[key]) return ascending ? -1 : 1;
      if (a[key] > b[key]) return ascending ? 1 : -1;
      return 0;
    });
  },

  /**
   * Group array by key or function
   */
  groupBy(array, keyOrFn) {
    return array.reduce((result, item) => {
      // Support both string key and function
      const groupKey = typeof keyOrFn === 'function' ? keyOrFn(item) : item[keyOrFn];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  },

  /**
   * Sleep/delay function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Exponential backoff for retries
   */
  async retry(fn, maxAttempts = CONFIG.retry.maxAttempts) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        const delay = Math.min(
          CONFIG.retry.baseDelay * Math.pow(2, attempt - 1),
          CONFIG.retry.maxDelay
        );
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }
  }
};
