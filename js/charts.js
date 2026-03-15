/**
 * Charts manager for Sison Store Dashboard
 * Handles all Chart.js visualizations
 */

class ChartsManager {
  constructor() {
    this.charts = {};
  }

  /**
   * Get chart title suffix based on current filter
   */
  getFilterLabel() {
    const filter = dataManager.currentFilter;
    const labels = {
      'month': '(This Month)',
      'lastmonth': '(Last Month)',
      'quarter': '(Last 3 Months)',
      '6months': '(Last 6 Months)',
      'year': '(Last 12 Months)',
      'all': '(All Time)'
    };
    return labels[filter] || '(All Time)';
  }

  /**
   * Initialize all charts
   */
  initialize() {
    const chartData = dataManager.getChartData();

    this.createStoreSalesTrendChart(chartData.monthly);
    this.createPisoWifiTrendChart(chartData.monthly);
    this.createPrinterTrendChart(chartData.monthly);
    this.createStoreComponentsChart(chartData.monthly);
    this.createMonthlyPerformanceChart(chartData.monthly);
    this.createRevenueBreakdownChart(chartData.breakdown);
    this.createYearlySummaryChart(chartData.yearly);
  }

  /**
   * Destroy all charts
   */
  destroy() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    this.charts = {};
  }

  /**
   * Create Store Sales Trend chart
   */
  createStoreSalesTrendChart(monthlyData) {
    const ctx = document.getElementById('store-sales-trend-chart');
    if (!ctx) return;

    if (this.charts.storeSalesTrend) {
      this.charts.storeSalesTrend.destroy();
    }

    // Use bar chart if only 1 month, line chart otherwise
    const chartType = monthlyData.length === 1 ? 'bar' : 'line';

    this.charts.storeSalesTrend = new Chart(ctx, {
      type: chartType,
      data: {
        labels: monthlyData.map(d => `${d.month} ${d.year}`),
        datasets: [
          {
            label: 'Store Sales Profit',
            data: monthlyData.map(d => d.storeSales),
            borderColor: CONFIG.ui.chartColors[0],
            backgroundColor: CONFIG.ui.chartColors[0],
            tension: 0.4,
            fill: chartType === 'line',
            pointRadius: 6,
            pointHoverRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: `Store Sales Trend ${this.getFilterLabel()}`,
            font: {
              size: 16,
              weight: '600'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'Profit: ' + Utils.formatCurrency(context.parsed.y);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return CONFIG.ui.currencySymbol + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  /**
   * Create Piso WiFi Trend chart
   */
  createPisoWifiTrendChart(monthlyData) {
    const ctx = document.getElementById('piso-wifi-trend-chart');
    if (!ctx) return;

    if (this.charts.pisoWifiTrend) {
      this.charts.pisoWifiTrend.destroy();
    }

    // Use bar chart if only 1 month, line chart otherwise
    const chartType = monthlyData.length === 1 ? 'bar' : 'line';

    this.charts.pisoWifiTrend = new Chart(ctx, {
      type: chartType,
      data: {
        labels: monthlyData.map(d => `${d.month} ${d.year}`),
        datasets: [
          {
            label: 'Piso WiFi Revenue',
            data: monthlyData.map(d => d.pisoWifi),
            borderColor: CONFIG.ui.chartColors[1],
            backgroundColor: CONFIG.ui.chartColors[1],
            tension: 0.4,
            fill: chartType === 'line',
            pointRadius: 6,
            pointHoverRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: `Piso WiFi Trend ${this.getFilterLabel()}`,
            font: {
              size: 16,
              weight: '600'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'Revenue: ' + Utils.formatCurrency(context.parsed.y);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return CONFIG.ui.currencySymbol + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  /**
   * Create Printer Trend chart
   */
  createPrinterTrendChart(monthlyData) {
    const ctx = document.getElementById('printer-trend-chart');
    if (!ctx) return;

    if (this.charts.printerTrend) {
      this.charts.printerTrend.destroy();
    }

    // Use bar chart if only 1 month, line chart otherwise
    const chartType = monthlyData.length === 1 ? 'bar' : 'line';

    this.charts.printerTrend = new Chart(ctx, {
      type: chartType,
      data: {
        labels: monthlyData.map(d => `${d.month} ${d.year}`),
        datasets: [
          {
            label: 'Printer Income',
            data: monthlyData.map(d => d.printer),
            borderColor: CONFIG.ui.chartColors[2],
            backgroundColor: CONFIG.ui.chartColors[2],
            tension: 0.4,
            fill: chartType === 'line',
            pointRadius: 6,
            pointHoverRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: `Printer Trend ${this.getFilterLabel()}`,
            font: {
              size: 16,
              weight: '600'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'Income: ' + Utils.formatCurrency(context.parsed.y);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return CONFIG.ui.currencySymbol + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  /**
   * Create Store Components chart (Gcash, Sari Sari, Orders)
   */
  createStoreComponentsChart(monthlyData) {
    const ctx = document.getElementById('store-components-chart');
    if (!ctx) return;

    if (this.charts.storeComponents) {
      this.charts.storeComponents.destroy();
    }

    this.charts.storeComponents = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: monthlyData.map(d => `${d.month} ${d.year}`),
        datasets: [
          {
            label: 'Gcash Total',
            data: monthlyData.map(d => d.gcashTotal),
            backgroundColor: CONFIG.ui.chartColors[3]
          },
          {
            label: 'Sari Sari Store',
            data: monthlyData.map(d => d.sariSariStore),
            backgroundColor: CONFIG.ui.chartColors[4]
          },
          {
            label: 'Orders',
            data: monthlyData.map(d => d.orders),
            backgroundColor: CONFIG.ui.chartColors[5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: `Store Sales Components ${this.getFilterLabel()}`,
            font: {
              size: 16,
              weight: '600'
            }
          },
          tooltip: {
            mode: 'index',
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + Utils.formatCurrency(context.parsed.y);
              },
              footer: function(tooltipItems) {
                let total = 0;
                tooltipItems.forEach(item => {
                  total += item.parsed.y;
                });
                return 'Total: ' + Utils.formatCurrency(total);
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return CONFIG.ui.currencySymbol + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  /**
   * Create Monthly Performance stacked bar chart
   */
  createMonthlyPerformanceChart(monthlyData) {
    const ctx = document.getElementById('monthly-performance-chart');
    if (!ctx) return;

    if (this.charts.monthlyPerformance) {
      this.charts.monthlyPerformance.destroy();
    }

    this.charts.monthlyPerformance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: monthlyData.map(d => `${d.month} ${d.year}`),
        datasets: [
          {
            label: 'Store Sales',
            data: monthlyData.map(d => d.storeSales),
            backgroundColor: CONFIG.ui.chartColors[0]
          },
          {
            label: 'Piso WiFi',
            data: monthlyData.map(d => d.pisoWifi),
            backgroundColor: CONFIG.ui.chartColors[1]
          },
          {
            label: 'Printer',
            data: monthlyData.map(d => d.printer),
            backgroundColor: CONFIG.ui.chartColors[2]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: `Monthly Performance ${this.getFilterLabel()}`,
            font: {
              size: 16
            }
          },
          tooltip: {
            mode: 'index',
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + Utils.formatCurrency(context.parsed.y);
              },
              footer: function(tooltipItems) {
                let total = 0;
                tooltipItems.forEach(item => {
                  total += item.parsed.y;
                });
                return 'Total: ' + Utils.formatCurrency(total);
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return CONFIG.ui.currencySymbol + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  /**
   * Create Revenue Breakdown doughnut chart
   */
  createRevenueBreakdownChart(breakdown) {
    const ctx = document.getElementById('revenue-breakdown-chart');
    if (!ctx) return;

    if (this.charts.revenueBreakdown) {
      this.charts.revenueBreakdown.destroy();
    }

    this.charts.revenueBreakdown = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Store Sales', 'Piso WiFi', 'Printer'],
        datasets: [{
          data: [breakdown.storeSales, breakdown.pisoWifi, breakdown.printer],
          backgroundColor: [
            CONFIG.ui.chartColors[0],
            CONFIG.ui.chartColors[1],
            CONFIG.ui.chartColors[2]
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: `Revenue Breakdown ${this.getFilterLabel()}`,
            font: {
              size: 16
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${Utils.formatCurrency(value)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Create Yearly Summary bar chart
   */
  createYearlySummaryChart(yearlyData) {
    const ctx = document.getElementById('yearly-summary-chart');
    if (!ctx) return;

    if (this.charts.yearlySummary) {
      this.charts.yearlySummary.destroy();
    }

    this.charts.yearlySummary = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: yearlyData.map(d => d.year),
        datasets: [
          {
            label: 'Store Sales',
            data: yearlyData.map(d => d.storeSales),
            backgroundColor: CONFIG.ui.chartColors[0]
          },
          {
            label: 'Piso WiFi',
            data: yearlyData.map(d => d.pisoWifi),
            backgroundColor: CONFIG.ui.chartColors[1]
          },
          {
            label: 'Printer',
            data: yearlyData.map(d => d.printer),
            backgroundColor: CONFIG.ui.chartColors[2]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: `Yearly Summary ${this.getFilterLabel()}`,
            font: {
              size: 16
            }
          },
          tooltip: {
            mode: 'index',
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + Utils.formatCurrency(context.parsed.y);
              },
              footer: function(tooltipItems) {
                let total = 0;
                tooltipItems.forEach(item => {
                  total += item.parsed.y;
                });
                return 'Total: ' + Utils.formatCurrency(total);
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return CONFIG.ui.currencySymbol + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }
}

// Create global instance
const chartsManager = new ChartsManager();
