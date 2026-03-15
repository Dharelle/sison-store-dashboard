/**
 * Charts manager for Sison Store Dashboard
 * Handles all Chart.js visualizations
 */

class ChartsManager {
  constructor() {
    this.charts = {};
  }

  /**
   * Initialize all charts
   */
  initialize() {
    const chartData = dataManager.getChartData();

    this.createRevenueTrendChart(chartData.monthly);
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
   * Create Revenue Trends line chart
   */
  createRevenueTrendChart(monthlyData) {
    const ctx = document.getElementById('revenue-trend-chart');
    if (!ctx) return;

    if (this.charts.revenueTrend) {
      this.charts.revenueTrend.destroy();
    }

    this.charts.revenueTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: monthlyData.map(d => `${d.month} ${d.year}`),
        datasets: [
          {
            label: 'Store Sales',
            data: monthlyData.map(d => d.storeSales),
            borderColor: CONFIG.ui.chartColors[0],
            backgroundColor: CONFIG.ui.chartColors[0] + '20',
            tension: 0.4
          },
          {
            label: 'Piso WiFi',
            data: monthlyData.map(d => d.pisoWifi),
            borderColor: CONFIG.ui.chartColors[1],
            backgroundColor: CONFIG.ui.chartColors[1] + '20',
            tension: 0.4
          },
          {
            label: 'Printer',
            data: monthlyData.map(d => d.printer),
            borderColor: CONFIG.ui.chartColors[2],
            backgroundColor: CONFIG.ui.chartColors[2] + '20',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Revenue Trends (Last 12 Months)',
            font: {
              size: 16
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + Utils.formatCurrency(context.parsed.y);
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
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
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
            text: 'Monthly Performance (Stacked)',
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
            text: 'Revenue Breakdown',
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
            text: 'Yearly Summary',
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
