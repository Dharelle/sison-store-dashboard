/**
 * Forms handler for Sison Store Dashboard
 * Manages data entry forms and validation
 */

class FormsManager {
  constructor() {
    this.currentForm = null;
    this.isSubmitting = false;
  }

  /**
   * Initialize forms on input page
   */
  initialize() {
    // Set up Store Sales form
    const storeSalesForm = document.getElementById('store-sales-form');
    if (storeSalesForm) {
      this.setupStoreSalesForm(storeSalesForm);
    }

    // Set up Piso WiFi form
    const pisoWifiForm = document.getElementById('piso-wifi-form');
    if (pisoWifiForm) {
      this.setupPisoWifiForm(pisoWifiForm);
    }

    // Set up Printer form
    const printerForm = document.getElementById('printer-form');
    if (printerForm) {
      this.setupPrinterForm(printerForm);
    }

    // Set default date to today
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
      if (!input.value) {
        input.value = Utils.formatDateForInput();
      }
    });
  }

  /**
   * Setup Store Sales form
   */
  setupStoreSalesForm(form) {
    // Update profit margin labels dynamically (will be called again after data loads)
    this.updateProfitMarginLabels(form);

    // Auto-sum Gcash Total from Cash In + Cash Out
    const cashInInput = form.querySelector('[name="cashIn"]');
    const cashOutInput = form.querySelector('[name="cashOut"]');
    const gcashTotalInput = form.querySelector('[name="gcashTotal"]');

    const updateGcashTotal = () => {
      const cashIn = parseFloat(cashInInput.value) || 0;
      const cashOut = parseFloat(cashOutInput.value) || 0;
      gcashTotalInput.value = (cashIn + cashOut).toFixed(2);
    };

    if (cashInInput && cashOutInput && gcashTotalInput) {
      cashInInput.addEventListener('input', updateGcashTotal);
      cashOutInput.addEventListener('input', updateGcashTotal);
    }

    // Auto-calculate profits when inputs change (excluding gcashProfit which is manual)
    const inputs = ['sariSariStore', 'orders', 'gcashProfit'];
    inputs.forEach(inputName => {
      const input = form.querySelector(`[name="${inputName}"]`);
      if (input) {
        input.addEventListener('input', () => this.calculateStoreSalesProfits(form));
      }
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleStoreSalesSubmit(form);
    });

    // Initial calculation
    this.calculateStoreSalesProfits(form);
  }

  /**
   * Update profit margin labels dynamically from CONFIG
   */
  updateProfitMarginLabels(form) {
    const gcashLabel = form.querySelector('label[for="gcashProfit"]');
    if (gcashLabel) {
      gcashLabel.textContent = 'Gcash Profit (Manual)';
    }

    const sariSariLabel = form.querySelector('label[for="sariSariStoreProfit"]');
    if (sariSariLabel) {
      const percent = (CONFIG.profitMargins.sariSariStore * 100).toFixed(1);
      sariSariLabel.textContent = `Sari Sari Store Profit (${percent}%)`;
    }

    const ordersLabel = form.querySelector('label[for="ordersProfit"]');
    if (ordersLabel) {
      const percent = (CONFIG.profitMargins.orders * 100).toFixed(1);
      ordersLabel.textContent = `Orders Profit (${percent}%)`;
    }
  }

  /**
   * Calculate profits for store sales form
   * Note: gcashProfit is manually entered due to non-linear fee structure
   */
  calculateStoreSalesProfits(form) {
    const sariSariStore = parseFloat(form.querySelector('[name="sariSariStore"]').value) || 0;
    const orders = parseFloat(form.querySelector('[name="orders"]').value) || 0;
    const gcashProfit = parseFloat(form.querySelector('[name="gcashProfit"]').value) || 0;

    const sariSariStoreProfit = sariSariStore * CONFIG.profitMargins.sariSariStore;
    const ordersProfit = orders * CONFIG.profitMargins.orders;
    const totalProfit = gcashProfit + sariSariStoreProfit + ordersProfit;

    // Update calculated fields
    form.querySelector('[name="sariSariStoreProfit"]').value = sariSariStoreProfit.toFixed(2);
    form.querySelector('[name="ordersProfit"]').value = ordersProfit.toFixed(2);
    form.querySelector('[name="totalProfit"]').value = totalProfit.toFixed(2);
  }

  /**
   * Handle Store Sales form submission
   */
  async handleStoreSalesSubmit(form) {
    if (this.isSubmitting) return;

    try {
      this.isSubmitting = true;
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';

      // Get form data
      const formData = new FormData(form);
      const data = {
        date: formData.get('date'),
        cashIn: formData.get('cashIn'),
        cashOut: formData.get('cashOut'),
        gcashTotal: formData.get('gcashTotal'),
        gcashProfit: formData.get('gcashProfit'),
        sariSariStore: formData.get('sariSariStore'),
        orders: formData.get('orders')
      };

      // Validate
      const errors = this.validateStoreSales(data);
      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }

      // Add to data manager
      const record = await dataManager.addStoreSale(data);

      // Show success
      Utils.showNotification('Transaction saved successfully!', 'success');

      // Reset form
      form.reset();
      form.querySelector('[name="date"]').value = Utils.formatDateForInput();
      this.calculateStoreSalesProfits(form);

      // Force reload from GitHub to ensure we have latest data
      await dataManager.initialize(true);

      // Update profit margin labels with latest config
      this.updateProfitMarginLabels(form);

      // Reload table if on input page
      if (typeof loadStoreSalesTable === 'function') {
        loadStoreSalesTable();
      } else {
        // Redirect to dashboard after 1 second if not on input page
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }

    } catch (error) {
      Utils.showNotification(error.message, 'error');
    } finally {
      this.isSubmitting = false;
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Transaction';
    }
  }

  /**
   * Validate Store Sales data
   */
  validateStoreSales(data) {
    const errors = [];

    if (!data.date) {
      errors.push('Date is required');
    }

    const numericFields = ['cashIn', 'cashOut', 'gcashTotal', 'gcashProfit', 'sariSariStore', 'orders'];
    numericFields.forEach(field => {
      const error = Utils.validateNumeric(data[field], field);
      if (error) {
        errors.push(error);
      }
    });

    return errors;
  }

  /**
   * Setup Piso WiFi form
   */
  setupPisoWifiForm(form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handlePisoWifiSubmit(form);
    });
  }

  /**
   * Handle Piso WiFi form submission
   */
  async handlePisoWifiSubmit(form) {
    if (this.isSubmitting) return;

    try {
      this.isSubmitting = true;
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';

      const formData = new FormData(form);
      const data = {
        month: formData.get('month'),
        year: formData.get('year'),
        revenue: formData.get('revenue')
      };

      // Validate
      const errors = this.validatePisoWifi(data);
      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }

      // Add to data manager
      await dataManager.addPisoWifi(data);

      // Show success
      Utils.showNotification('Piso WiFi record saved successfully!', 'success');

      // Reset form
      form.reset();

      // Reload table if on input page
      if (typeof loadPisoWifiTable === 'function') {
        await dataManager.initialize(true);
        loadPisoWifiTable();
      } else {
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }

    } catch (error) {
      Utils.showNotification(error.message, 'error');
    } finally {
      this.isSubmitting = false;
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Revenue';
    }
  }

  /**
   * Validate Piso WiFi data
   */
  validatePisoWifi(data) {
    const errors = [];

    if (!data.month) {
      errors.push('Month is required');
    }

    if (!data.year) {
      errors.push('Year is required');
    }

    const error = Utils.validateNumeric(data.revenue, 'Revenue');
    if (error) {
      errors.push(error);
    }

    return errors;
  }

  /**
   * Setup Printer form
   */
  setupPrinterForm(form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handlePrinterSubmit(form);
    });
  }

  /**
   * Handle Printer form submission
   */
  async handlePrinterSubmit(form) {
    if (this.isSubmitting) return;

    try {
      this.isSubmitting = true;
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';

      const formData = new FormData(form);
      const data = {
        month: formData.get('month'),
        year: formData.get('year'),
        income: formData.get('income')
      };

      // Validate
      const errors = this.validatePrinter(data);
      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }

      // Add to data manager
      await dataManager.addPrinter(data);

      // Show success
      Utils.showNotification('Printer record saved successfully!', 'success');

      // Reset form
      form.reset();

      // Reload table if on input page
      if (typeof loadPrinterTable === 'function') {
        await dataManager.initialize(true);
        loadPrinterTable();
      } else {
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }

    } catch (error) {
      Utils.showNotification(error.message, 'error');
    } finally {
      this.isSubmitting = false;
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Income';
    }
  }

  /**
   * Validate Printer data
   */
  validatePrinter(data) {
    const errors = [];

    if (!data.month) {
      errors.push('Month is required');
    }

    if (!data.year) {
      errors.push('Year is required');
    }

    const error = Utils.validateNumeric(data.income, 'Income');
    if (error) {
      errors.push(error);
    }

    return errors;
  }
}

// Create global instance
let formsManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  formsManager = new FormsManager();
  formsManager.initialize();
});

// Global function to refresh profit margin labels after data loads
function refreshProfitMarginLabels() {
  if (formsManager) {
    const form = document.getElementById('store-sales-form');
    if (form) {
      formsManager.updateProfitMarginLabels(form);
    }
  }
}
