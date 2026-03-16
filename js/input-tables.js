/**
 * Input page tables handler
 * Manages tab switching and data tables with search/filter/pagination
 */

// Tab switching
document.addEventListener('DOMContentLoaded', async () => {
  // Dark mode
  const darkMode = localStorage.getItem('darkMode') === 'true';
  if (darkMode) {
    document.body.classList.add('dark-mode');
  }

  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
  }

  // Tab switching
  const tabButtons = document.querySelectorAll('.type-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all buttons and sections
      tabButtons.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));

      // Add active to clicked button and corresponding section
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(`${tabId}-section`).classList.add('active');

      // Load data for the active tab
      if (tabId === 'store-sales') {
        loadStoreSalesTable();
      } else if (tabId === 'piso-wifi') {
        loadPisoWifiTable();
      } else if (tabId === 'printer') {
        loadPrinterTable();
      }
    });
  });

  // Initialize data manager
  await dataManager.initialize();

  // Refresh profit margin labels after data loads (to get correct percentages from metadata)
  if (typeof refreshProfitMarginLabels === 'function') {
    refreshProfitMarginLabels();
  }

  // Load initial table (Store Sales)
  loadStoreSalesTable();
});

// ========== STORE SALES TABLE ==========
let ssAllData = [];
let ssFilteredData = [];
let ssCurrentPage = 1;
const ssItemsPerPage = 20;
let ssSortColumn = 'date';
let ssSortAsc = false;

async function loadStoreSalesTable() {
  ssAllData = dataManager.data.storeSales
    .filter(s => s.totalProfit > 0)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  ssFilteredData = [...ssAllData];
  displayStoreSalesTable();

  // Set up event listeners
  document.getElementById('ss-search').addEventListener('input', filterStoreSales);
  document.getElementById('ss-filter').addEventListener('change', filterStoreSales);
  document.getElementById('ss-prev').addEventListener('click', () => changeStoreSalesPage(-1));
  document.getElementById('ss-next').addEventListener('click', () => changeStoreSalesPage(1));

  // Add sortable column headers
  const headers = document.querySelectorAll('#store-sales-section table thead th');
  const sortableColumns = ['date', 'cashIn', 'cashOut', 'gcashTotal', 'gcashProfit', 'sariSariStore', 'orders', 'totalProfit'];
  headers.forEach((th, index) => {
    if (sortableColumns[index]) {
      th.style.cursor = 'pointer';
      th.style.userSelect = 'none';
      th.addEventListener('click', () => sortStoreSales(sortableColumns[index]));
      th.title = 'Click to sort';
    }
  });
}

function sortStoreSales(column) {
  if (ssSortColumn === column) {
    ssSortAsc = !ssSortAsc;
  } else {
    ssSortColumn = column;
    ssSortAsc = true;
  }

  ssFilteredData.sort((a, b) => {
    let aVal = a[column];
    let bVal = b[column];

    if (column === 'date') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    if (aVal < bVal) return ssSortAsc ? -1 : 1;
    if (aVal > bVal) return ssSortAsc ? 1 : -1;
    return 0;
  });

  displayStoreSalesTable();
}

function filterStoreSales() {
  const searchTerm = document.getElementById('ss-search').value.toLowerCase();
  const filter = document.getElementById('ss-filter').value;

  ssFilteredData = ssAllData.filter(t => {
    // Search filter
    const matchesSearch = !searchTerm ||
      t.date.includes(searchTerm) ||
      t.totalProfit.toString().includes(searchTerm);

    // Date filter
    let matchesDate = true;
    if (filter !== 'all') {
      const now = new Date();
      const itemDate = new Date(t.date);

      if (filter === 'month') {
        matchesDate = itemDate.getMonth() === now.getMonth() &&
                     itemDate.getFullYear() === now.getFullYear();
      } else if (filter === 'quarter') {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        matchesDate = itemDate >= threeMonthsAgo;
      } else if (filter === 'year') {
        matchesDate = itemDate.getFullYear() === now.getFullYear();
      }
    }

    return matchesSearch && matchesDate;
  });

  ssCurrentPage = 1;
  displayStoreSalesTable();
}

function displayStoreSalesTable() {
  const tbody = document.getElementById('ss-tbody');
  const start = (ssCurrentPage - 1) * ssItemsPerPage;
  const end = start + ssItemsPerPage;
  const pageData = ssFilteredData.slice(start, end);

  if (pageData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">No transactions found</td></tr>';
  } else {
    tbody.innerHTML = pageData.map(t => `
      <tr data-id="${t.id}">
        <td data-field="date">${Utils.formatDate(t.date)}</td>
        <td data-field="cashIn">${Utils.formatCurrency(t.cashIn)}</td>
        <td data-field="cashOut">${Utils.formatCurrency(t.cashOut)}</td>
        <td data-field="gcashTotal">${Utils.formatCurrency(t.gcashTotal)}</td>
        <td data-field="gcashProfit">${Utils.formatCurrency(t.gcashProfit)}</td>
        <td data-field="sariSariStore">${Utils.formatCurrency(t.sariSariStore)}</td>
        <td data-field="orders">${Utils.formatCurrency(t.orders)}</td>
        <td class="font-semibold" data-field="totalProfit">${Utils.formatCurrency(t.totalProfit)}</td>
        <td>
          <button class="btn btn-sm btn-secondary edit-btn" onclick="editStoreSale('${t.id}')">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" onclick="deleteStoreSale('${t.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  // Update pagination
  const totalPages = Math.ceil(ssFilteredData.length / ssItemsPerPage);
  document.getElementById('ss-page-info').textContent =
    `Showing ${start + 1}-${Math.min(end, ssFilteredData.length)} of ${ssFilteredData.length} transactions`;
  document.getElementById('ss-prev').disabled = ssCurrentPage === 1;
  document.getElementById('ss-next').disabled = ssCurrentPage >= totalPages;
}

function changeStoreSalesPage(direction) {
  ssCurrentPage += direction;
  displayStoreSalesTable();
}

// ========== PISO WIFI TABLE ==========
let pwAllData = [];
let pwFilteredData = [];
let pwCurrentPage = 1;
const pwItemsPerPage = 20;
let pwSortColumn = 'year';
let pwSortAsc = false;

async function loadPisoWifiTable() {
  pwAllData = dataManager.data.pisoWifi
    .filter(p => p.revenue > 0)
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return Utils.getMonthNumber(b.month) - Utils.getMonthNumber(a.month);
    });
  pwFilteredData = [...pwAllData];
  displayPisoWifiTable();

  // Set up event listeners
  document.getElementById('pw-search').addEventListener('input', filterPisoWifi);
  document.getElementById('pw-filter').addEventListener('change', filterPisoWifi);
  document.getElementById('pw-prev').addEventListener('click', () => changePisoWifiPage(-1));
  document.getElementById('pw-next').addEventListener('click', () => changePisoWifiPage(1));

  // Add sortable column headers
  const headers = document.querySelectorAll('#piso-wifi-section table thead th');
  const sortableColumns = ['month', 'year', 'revenue'];
  headers.forEach((th, index) => {
    th.style.cursor = 'pointer';
    th.style.userSelect = 'none';
    th.addEventListener('click', () => sortPisoWifi(sortableColumns[index]));
    th.title = 'Click to sort';
  });
}

function sortPisoWifi(column) {
  if (pwSortColumn === column) {
    pwSortAsc = !pwSortAsc;
  } else {
    pwSortColumn = column;
    pwSortAsc = true;
  }

  pwFilteredData.sort((a, b) => {
    let aVal = a[column];
    let bVal = b[column];

    if (column === 'month') {
      aVal = Utils.getMonthNumber(aVal);
      bVal = Utils.getMonthNumber(bVal);
    }

    if (aVal < bVal) return pwSortAsc ? -1 : 1;
    if (aVal > bVal) return pwSortAsc ? 1 : -1;
    return 0;
  });

  displayPisoWifiTable();
}

function filterPisoWifi() {
  const searchTerm = document.getElementById('pw-search').value.toLowerCase();
  const filter = document.getElementById('pw-filter').value;

  pwFilteredData = pwAllData.filter(p => {
    // Search filter
    const matchesSearch = !searchTerm ||
      p.month.toLowerCase().includes(searchTerm) ||
      p.year.toString().includes(searchTerm) ||
      p.revenue.toString().includes(searchTerm);

    // Date filter
    let matchesDate = true;
    if (filter === 'year') {
      matchesDate = p.year === new Date().getFullYear();
    } else if (filter === 'lastyear') {
      matchesDate = p.year === new Date().getFullYear() - 1;
    }

    return matchesSearch && matchesDate;
  });

  pwCurrentPage = 1;
  displayPisoWifiTable();
}

function displayPisoWifiTable() {
  const tbody = document.getElementById('pw-tbody');
  const start = (pwCurrentPage - 1) * pwItemsPerPage;
  const end = start + pwItemsPerPage;
  const pageData = pwFilteredData.slice(start, end);

  if (pageData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">No records found</td></tr>';
  } else {
    tbody.innerHTML = pageData.map(p => `
      <tr data-id="${p.id}">
        <td data-field="month">${p.month}</td>
        <td data-field="year">${p.year}</td>
        <td class="font-semibold" data-field="revenue">${Utils.formatCurrency(p.revenue)}</td>
        <td>
          <button class="btn btn-sm btn-secondary edit-btn" onclick="editPisoWifi('${p.id}')">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" onclick="deletePisoWifi('${p.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  // Update pagination
  const totalPages = Math.ceil(pwFilteredData.length / pwItemsPerPage);
  document.getElementById('pw-page-info').textContent =
    `Showing ${start + 1}-${Math.min(end, pwFilteredData.length)} of ${pwFilteredData.length} records`;
  document.getElementById('pw-prev').disabled = pwCurrentPage === 1;
  document.getElementById('pw-next').disabled = pwCurrentPage >= totalPages;
}

function changePisoWifiPage(direction) {
  pwCurrentPage += direction;
  displayPisoWifiTable();
}

// ========== PRINTER TABLE ==========
let prAllData = [];
let prFilteredData = [];
let prCurrentPage = 1;
const prItemsPerPage = 20;
let prSortColumn = 'year';
let prSortAsc = false;

async function loadPrinterTable() {
  prAllData = dataManager.data.printer
    .filter(p => p.income > 0)
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return Utils.getMonthNumber(b.month) - Utils.getMonthNumber(a.month);
    });
  prFilteredData = [...prAllData];
  displayPrinterTable();

  // Set up event listeners
  document.getElementById('pr-search').addEventListener('input', filterPrinter);
  document.getElementById('pr-filter').addEventListener('change', filterPrinter);
  document.getElementById('pr-prev').addEventListener('click', () => changePrinterPage(-1));
  document.getElementById('pr-next').addEventListener('click', () => changePrinterPage(1));

  // Add sortable column headers
  const headers = document.querySelectorAll('#printer-section table thead th');
  const sortableColumns = ['month', 'year', 'income'];
  headers.forEach((th, index) => {
    th.style.cursor = 'pointer';
    th.style.userSelect = 'none';
    th.addEventListener('click', () => sortPrinter(sortableColumns[index]));
    th.title = 'Click to sort';
  });
}

function sortPrinter(column) {
  if (prSortColumn === column) {
    prSortAsc = !prSortAsc;
  } else {
    prSortColumn = column;
    prSortAsc = true;
  }

  prFilteredData.sort((a, b) => {
    let aVal = a[column];
    let bVal = b[column];

    if (column === 'month') {
      aVal = Utils.getMonthNumber(aVal);
      bVal = Utils.getMonthNumber(bVal);
    }

    if (aVal < bVal) return prSortAsc ? -1 : 1;
    if (aVal > bVal) return prSortAsc ? 1 : -1;
    return 0;
  });

  displayPrinterTable();
}

function filterPrinter() {
  const searchTerm = document.getElementById('pr-search').value.toLowerCase();
  const filter = document.getElementById('pr-filter').value;

  prFilteredData = prAllData.filter(p => {
    // Search filter
    const matchesSearch = !searchTerm ||
      p.month.toLowerCase().includes(searchTerm) ||
      p.year.toString().includes(searchTerm) ||
      p.income.toString().includes(searchTerm);

    // Date filter
    let matchesDate = true;
    if (filter === 'year') {
      matchesDate = p.year === new Date().getFullYear();
    } else if (filter === 'lastyear') {
      matchesDate = p.year === new Date().getFullYear() - 1;
    }

    return matchesSearch && matchesDate;
  });

  prCurrentPage = 1;
  displayPrinterTable();
}

function displayPrinterTable() {
  const tbody = document.getElementById('pr-tbody');
  const start = (prCurrentPage - 1) * prItemsPerPage;
  const end = start + prItemsPerPage;
  const pageData = prFilteredData.slice(start, end);

  if (pageData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">No records found</td></tr>';
  } else {
    tbody.innerHTML = pageData.map(p => `
      <tr data-id="${p.id}">
        <td data-field="month">${p.month}</td>
        <td data-field="year">${p.year}</td>
        <td class="font-semibold" data-field="income">${Utils.formatCurrency(p.income)}</td>
        <td>
          <button class="btn btn-sm btn-secondary edit-btn" onclick="editPrinter('${p.id}')">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" onclick="deletePrinter('${p.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  // Update pagination
  const totalPages = Math.ceil(prFilteredData.length / prItemsPerPage);
  document.getElementById('pr-page-info').textContent =
    `Showing ${start + 1}-${Math.min(end, prFilteredData.length)} of ${prFilteredData.length} records`;
  document.getElementById('pr-prev').disabled = prCurrentPage === 1;
  document.getElementById('pr-next').disabled = prCurrentPage >= totalPages;
}

function changePrinterPage(direction) {
  prCurrentPage += direction;
  displayPrinterTable();
}

// ========== EDIT/DELETE FUNCTIONS ==========

// Store Sales Edit/Delete
async function editStoreSale(id) {
  const record = ssAllData.find(s => s.id === id);
  if (!record) return;

  const row = document.querySelector(`#ss-tbody tr[data-id="${id}"]`);
  if (!row) return;

  // Convert row to editable inputs
  row.innerHTML = `
    <td><input type="date" class="form-input" value="${record.date}" data-field="date" style="width: 140px;"></td>
    <td><input type="number" class="form-input" value="${record.cashIn}" data-field="cashIn" step="0.01" style="width: 100px;"></td>
    <td><input type="number" class="form-input" value="${record.cashOut}" data-field="cashOut" step="0.01" style="width: 100px;"></td>
    <td><input type="number" class="form-input" value="${record.gcashTotal}" data-field="gcashTotal" step="0.01" style="width: 100px;"></td>
    <td><input type="number" class="form-input" value="${record.gcashProfit}" data-field="gcashProfit" step="0.01" style="width: 100px;"></td>
    <td><input type="number" class="form-input" value="${record.sariSariStore}" data-field="sariSariStore" step="0.01" style="width: 100px;"></td>
    <td><input type="number" class="form-input" value="${record.orders}" data-field="orders" step="0.01" style="width: 100px;"></td>
    <td class="font-semibold">${Utils.formatCurrency(record.totalProfit)}</td>
    <td>
      <button class="btn btn-sm btn-success" onclick="saveStoreSale('${id}')">Save</button>
      <button class="btn btn-sm btn-secondary" onclick="cancelEdit()">Cancel</button>
    </td>
  `;
}

async function saveStoreSale(id) {
  const row = document.querySelector(`#ss-tbody tr[data-id="${id}"]`);
  if (!row) return;

  try {
    const formData = {
      date: row.querySelector('[data-field="date"]').value,
      cashIn: row.querySelector('[data-field="cashIn"]').value,
      cashOut: row.querySelector('[data-field="cashOut"]').value,
      gcashTotal: row.querySelector('[data-field="gcashTotal"]').value,
      gcashProfit: row.querySelector('[data-field="gcashProfit"]').value,
      sariSariStore: row.querySelector('[data-field="sariSariStore"]').value,
      orders: row.querySelector('[data-field="orders"]').value
    };

    await dataManager.updateStoreSale(id, formData);
    Utils.showNotification('Record updated successfully!', 'success');

    // Reload table
    await dataManager.initialize(true);
    loadStoreSalesTable();

  } catch (error) {
    Utils.showNotification('Failed to update: ' + error.message, 'error');
  }
}

async function deleteStoreSale(id) {
  if (!confirm('Are you sure you want to delete this transaction?')) return;

  try {
    await dataManager.deleteStoreSale(id);
    Utils.showNotification('Record deleted successfully!', 'success');

    // Reload table
    await dataManager.initialize(true);
    loadStoreSalesTable();

  } catch (error) {
    Utils.showNotification('Failed to delete: ' + error.message, 'error');
  }
}

// Piso WiFi Edit/Delete
async function editPisoWifi(id) {
  const record = pwAllData.find(p => p.id === id);
  if (!record) return;

  const row = document.querySelector(`#pw-tbody tr[data-id="${id}"]`);
  if (!row) return;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthOptions = months.map(m => `<option value="${m}" ${m === record.month ? 'selected' : ''}>${m}</option>`).join('');

  row.innerHTML = `
    <td>
      <select class="form-select" data-field="month" style="width: 120px;">
        ${monthOptions}
      </select>
    </td>
    <td><input type="number" class="form-input" value="${record.year}" data-field="year" min="2025" max="2030" style="width: 80px;"></td>
    <td><input type="number" class="form-input" value="${record.revenue}" data-field="revenue" step="0.01" style="width: 120px;"></td>
    <td>
      <button class="btn btn-sm btn-success" onclick="savePisoWifi('${id}')">Save</button>
      <button class="btn btn-sm btn-secondary" onclick="cancelEdit()">Cancel</button>
    </td>
  `;
}

async function savePisoWifi(id) {
  const row = document.querySelector(`#pw-tbody tr[data-id="${id}"]`);
  if (!row) return;

  try {
    const formData = {
      month: row.querySelector('[data-field="month"]').value,
      year: row.querySelector('[data-field="year"]').value,
      revenue: row.querySelector('[data-field="revenue"]').value
    };

    await dataManager.updatePisoWifi(id, formData);
    Utils.showNotification('Record updated successfully!', 'success');

    await dataManager.initialize(true);
    loadPisoWifiTable();

  } catch (error) {
    Utils.showNotification('Failed to update: ' + error.message, 'error');
  }
}

async function deletePisoWifi(id) {
  if (!confirm('Are you sure you want to delete this record?')) return;

  try {
    await dataManager.deletePisoWifi(id);
    Utils.showNotification('Record deleted successfully!', 'success');

    await dataManager.initialize(true);
    loadPisoWifiTable();

  } catch (error) {
    Utils.showNotification('Failed to delete: ' + error.message, 'error');
  }
}

// Printer Edit/Delete
async function editPrinter(id) {
  const record = prAllData.find(p => p.id === id);
  if (!record) return;

  const row = document.querySelector(`#pr-tbody tr[data-id="${id}"]`);
  if (!row) return;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthOptions = months.map(m => `<option value="${m}" ${m === record.month ? 'selected' : ''}>${m}</option>`).join('');

  row.innerHTML = `
    <td>
      <select class="form-select" data-field="month" style="width: 120px;">
        ${monthOptions}
      </select>
    </td>
    <td><input type="number" class="form-input" value="${record.year}" data-field="year" min="2025" max="2030" style="width: 80px;"></td>
    <td><input type="number" class="form-input" value="${record.income}" data-field="income" step="0.01" style="width: 120px;"></td>
    <td>
      <button class="btn btn-sm btn-success" onclick="savePrinter('${id}')">Save</button>
      <button class="btn btn-sm btn-secondary" onclick="cancelEdit()">Cancel</button>
    </td>
  `;
}

async function savePrinter(id) {
  const row = document.querySelector(`#pr-tbody tr[data-id="${id}"]`);
  if (!row) return;

  try {
    const formData = {
      month: row.querySelector('[data-field="month"]').value,
      year: row.querySelector('[data-field="year"]').value,
      income: row.querySelector('[data-field="income"]').value
    };

    await dataManager.updatePrinter(id, formData);
    Utils.showNotification('Record updated successfully!', 'success');

    await dataManager.initialize(true);
    loadPrinterTable();

  } catch (error) {
    Utils.showNotification('Failed to update: ' + error.message, 'error');
  }
}

async function deletePrinter(id) {
  if (!confirm('Are you sure you want to delete this record?')) return;

  try {
    await dataManager.deletePrinter(id);
    Utils.showNotification('Record deleted successfully!', 'success');

    await dataManager.initialize(true);
    loadPrinterTable();

  } catch (error) {
    Utils.showNotification('Failed to delete: ' + error.message, 'error');
  }
}

function cancelEdit() {
  // Reload the table to cancel edit
  displayStoreSalesTable();
  displayPisoWifiTable();
  displayPrinterTable();
}
