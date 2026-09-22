/**
 * App.js - Core Application Controller
 * 
 * ExpenseTrack Web Application
 * Handles DOM interaction, SPA routing, CRUD events, visual Canvas charts,
 * search/filter logic, validation, theme management, and modal controls.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Single App Controller Instance
  window.appInstance = new ExpenseTrackerApp();
  window.appInstance.init();
});

class ExpenseTrackerApp {
  constructor() {
    this.storage = window.storageService;
    
    // Category mappings
    this.expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Education', 'Entertainment', 'Health', 'Other'];
    this.incomeCategories = ['Salary', 'Freelance', 'Business', 'Other'];
    
    // Color palettes for categories & charts
    this.categoryColors = {
      'Food': '#f59e0b',
      'Transport': '#3b82f6',
      'Shopping': '#ec4899',
      'Bills': '#ef4444',
      'Education': '#8b5cf6',
      'Entertainment': '#06b6d4',
      'Health': '#10b981',
      'Salary': '#10b981',
      'Freelance': '#6366f1',
      'Business': '#14b8a6',
      'Other': '#64748b'
    };

    // State
    this.currentView = 'dashboard';
    this.editingTransactionId = null;
    this.deletingTransactionId = null;
    
    // Filters State
    this.filters = {
      search: '',
      type: 'all',
      category: 'all',
      month: '',
      sort: 'date-desc'
    };
  }

  /**
   * Main Initialization Procedure
   */
  init() {
    this.cacheDOM();
    this.initTheme();
    this.bindEvents();
    this.populateCategoryDropdowns();
    this.renderCurrentView();
  }

  /**
   * 1. Theme Initialization & Management
   */
  initTheme() {
    const savedTheme = this.storage.getTheme();
    this.applyTheme(savedTheme);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    this.updateThemeIcon(theme);
    
    if (this.settingThemeToggle) {
      this.settingThemeToggle.checked = (theme === 'dark');
    }
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    this.applyTheme(newTheme);
    this.storage.setTheme(newTheme);
    
    // Re-render charts if reports view is active to update canvas text/grid colors
    if (this.currentView === 'reports') {
      this.renderCharts();
    }
    
    this.showToast(`Switched to ${newTheme.toUpperCase()} mode`, 'info');
  }

  updateThemeIcon(theme) {
    const themeBtn = document.getElementById('btnThemeToggle');
    if (!themeBtn) return;
    
    if (theme === 'dark') {
      themeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>`;
      themeBtn.setAttribute('title', 'Switch to Light Mode');
    } else {
      themeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>`;
      themeBtn.setAttribute('title', 'Switch to Dark Mode');
    }
  }

  /**
   * 2. DOM Elements Caching
   */
  cacheDOM() {
    // Navigation
    this.navLinks = document.querySelectorAll('.nav-link');
    this.pageHeading = document.getElementById('pageHeading');
    this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
    this.sidebar = document.getElementById('sidebar');

    // Action Buttons
    this.btnThemeToggle = document.getElementById('btnThemeToggle');
    this.btnOpenAddModal = document.getElementById('btnOpenAddModal');
    this.btnHeaderAdd = document.getElementById('btnHeaderAdd');

    // Modals
    this.modalTransaction = document.getElementById('modalTransaction');
    this.modalDelete = document.getElementById('modalDelete');
    
    // Form Elements
    this.formTransaction = document.getElementById('formTransaction');
    this.formTitle = document.getElementById('modalTransactionTitle');
    this.inputTxType = document.getElementById('inputTxType');
    this.inputTxAmount = document.getElementById('inputTxAmount');
    this.inputTxCategory = document.getElementById('inputTxCategory');
    this.inputTxDate = document.getElementById('inputTxDate');
    this.inputTxDescription = document.getElementById('inputTxDescription');
    this.btnIncomeToggle = document.getElementById('btnIncomeToggle');
    this.btnExpenseToggle = document.getElementById('btnExpenseToggle');

    // Filters
    this.filterSearch = document.getElementById('filterSearch');
    this.filterType = document.getElementById('filterType');
    this.filterCategory = document.getElementById('filterCategory');
    this.filterMonth = document.getElementById('filterMonth');
    this.filterSort = document.getElementById('filterSort');
    this.btnResetFilters = document.getElementById('btnResetFilters');

    // Settings
    this.settingThemeToggle = document.getElementById('settingThemeToggle');
    this.btnSettingResetSample = document.getElementById('btnSettingResetSample');
    this.btnSettingClearAll = document.getElementById('btnSettingClearAll');

    // Containers
    this.toastContainer = document.getElementById('toastContainer');
  }

  /**
   * 3. Event Listeners Binding
   */
  bindEvents() {
    // SPA Navigation
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-view');
        this.navigateTo(targetView);
      });
    });

    // Mobile Menu Toggle
    if (this.mobileMenuBtn) {
      this.mobileMenuBtn.addEventListener('click', () => {
        this.sidebar.classList.toggle('mobile-open');
      });
    }

    // Header & Dashboard Add Buttons
    if (this.btnHeaderAdd) {
      this.btnHeaderAdd.addEventListener('click', () => this.openTransactionModal());
    }
    if (this.btnOpenAddModal) {
      this.btnOpenAddModal.addEventListener('click', () => this.openTransactionModal());
    }

    // Theme Toggles
    if (this.btnThemeToggle) {
      this.btnThemeToggle.addEventListener('click', () => this.toggleTheme());
    }
    if (this.settingThemeToggle) {
      this.settingThemeToggle.addEventListener('change', () => this.toggleTheme());
    }

    // Form Type Buttons (Income / Expense Switch)
    if (this.btnIncomeToggle && this.btnExpenseToggle) {
      this.btnIncomeToggle.addEventListener('click', () => this.setFormType('income'));
      this.btnExpenseToggle.addEventListener('click', () => this.setFormType('expense'));
    }

    // Form Submission & Real-time Validation
    if (this.formTransaction) {
      this.formTransaction.addEventListener('submit', (e) => this.handleFormSubmit(e));
      
      // Live validation clearing on input
      [this.inputTxAmount, this.inputTxCategory, this.inputTxDate, this.inputTxDescription].forEach(input => {
        if (input) {
          input.addEventListener('input', () => this.clearInputError(input));
        }
      });
    }

    // Filter Controls
    if (this.filterSearch) {
      this.filterSearch.addEventListener('input', () => this.applyFilters());
    }
    if (this.filterType) {
      this.filterType.addEventListener('change', () => this.applyFilters());
    }
    if (this.filterCategory) {
      this.filterCategory.addEventListener('change', () => this.applyFilters());
    }
    if (this.filterMonth) {
      this.filterMonth.addEventListener('change', () => this.applyFilters());
    }
    if (this.filterSort) {
      this.filterSort.addEventListener('change', () => this.applyFilters());
    }
    if (this.btnResetFilters) {
      this.btnResetFilters.addEventListener('click', () => this.resetFilters());
    }

    // Modal Close Buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-backdrop');
        if (modal) this.closeModal(modal);
      });
    });

    // Delete Confirmation
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');
    if (btnConfirmDelete) {
      btnConfirmDelete.addEventListener('click', () => this.confirmDelete());
    }

    // Settings Data Resets
    if (this.btnSettingResetSample) {
      this.btnSettingResetSample.addEventListener('click', () => {
        if (confirm('Reset to sample data? Current changes will be overwritten.')) {
          this.storage.resetToSampleData();
          this.renderCurrentView();
          this.showToast('Reset to sample transaction data', 'success');
        }
      });
    }

    if (this.btnSettingClearAll) {
      this.btnSettingClearAll.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear ALL transaction data? This cannot be undone.')) {
          this.storage.clearAllTransactions();
          this.renderCurrentView();
          this.showToast('All transaction data cleared', 'error');
        }
      });
    }
  }

  /**
   * 4. Navigation & View Routing
   */
  navigateTo(viewName) {
    this.currentView = viewName;
    
    // Update active nav link
    this.navLinks.forEach(link => {
      if (link.getAttribute('data-view') === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close mobile sidebar if open
    if (this.sidebar) this.sidebar.classList.remove('mobile-open');

    // Update Header Title
    const titles = {
      'dashboard': 'Dashboard',
      'transactions': 'Transaction History',
      'add-transaction': 'Add Transaction',
      'reports': 'Reports & Summary',
      'settings': 'Settings'
    };
    if (this.pageHeading) {
      this.pageHeading.textContent = titles[viewName] || 'Dashboard';
    }

    // Render active view section
    document.querySelectorAll('.view-section').forEach(section => {
      section.classList.remove('active-view');
    });

    const activeSection = document.getElementById(`view-${viewName}`);
    if (activeSection) {
      activeSection.classList.add('active-view');
    }

    // If "add-transaction" tab clicked directly, open modal
    if (viewName === 'add-transaction') {
      this.openTransactionModal();
      this.navigateTo('dashboard');
      return;
    }

    this.renderCurrentView();
  }

  renderCurrentView() {
    switch (this.currentView) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'transactions':
        this.renderTransactionsTable();
        break;
      case 'reports':
        this.renderReportsView();
        break;
      case 'settings':
        this.renderSettingsView();
        break;
      default:
        this.renderDashboard();
    }
  }

  /**
   * 5. Dashboard View Logic
   */
  renderDashboard() {
    const transactions = this.storage.getTransactions();
    
    // Calculations
    let totalIncome = 0;
    let totalExpense = 0;
    let currentMonthExpense = 0;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    transactions.forEach(t => {
      const amount = parseFloat(t.amount) || 0;
      const tDate = new Date(t.date);

      if (t.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
        
        // Check current month expense
        if (tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth) {
          currentMonthExpense += amount;
        }
      }
    });

    const totalBalance = totalIncome - totalExpense;

    // Update DOM Cards
    document.getElementById('dashTotalBalance').textContent = this.formatCurrency(totalBalance);
    document.getElementById('dashTotalIncome').textContent = this.formatCurrency(totalIncome);
    document.getElementById('dashTotalExpense').textContent = this.formatCurrency(totalExpense);
    document.getElementById('dashTxCount').textContent = transactions.length;
    document.getElementById('dashCurrentMonthExpense').textContent = this.formatCurrency(currentMonthExpense);

    // Balance Card Styling
    const balanceCardAmount = document.getElementById('dashTotalBalance');
    if (totalBalance < 0) {
      balanceCardAmount.classList.add('amount-expense');
      balanceCardAmount.classList.remove('amount-income');
    } else {
      balanceCardAmount.classList.add('amount-income');
      balanceCardAmount.classList.remove('amount-expense');
    }

    // Render Recent Transactions (Top 5)
    const recentTableBody = document.getElementById('recentTransactionsBody');
    const recentEmptyState = document.getElementById('recentEmptyState');

    if (!recentTableBody) return;

    if (transactions.length === 0) {
      recentTableBody.innerHTML = '';
      if (recentEmptyState) recentEmptyState.style.display = 'block';
    } else {
      if (recentEmptyState) recentEmptyState.style.display = 'none';
      const recentList = transactions.slice(0, 5);
      
      recentTableBody.innerHTML = recentList.map(t => `
        <tr>
          <td>${this.formatDate(t.date)}</td>
          <td><strong>${this.escapeHTML(t.description)}</strong></td>
          <td><span class="badge badge-category">${this.escapeHTML(t.category)}</span></td>
          <td>
            <span class="badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}">
              ${t.type}
            </span>
          </td>
          <td class="${t.type === 'income' ? 'amount-income' : 'amount-expense'}">
            ${t.type === 'income' ? '+' : '-'}${this.formatCurrency(t.amount)}
          </td>
        </tr>
      `).join('');
    }

    // Render Quick Category Progress Bars
    this.renderCategoryBreakdownList('dashCategoryList', transactions);
  }

  /**
   * 6. Transactions List & Filter Logic
   */
  applyFilters() {
    this.filters.search = this.filterSearch ? this.filterSearch.value.trim().toLowerCase() : '';
    this.filters.type = this.filterType ? this.filterType.value : 'all';
    this.filters.category = this.filterCategory ? this.filterCategory.value : 'all';
    this.filters.month = this.filterMonth ? this.filterMonth.value : '';
    this.filters.sort = this.filterSort ? this.filterSort.value : 'date-desc';

    this.renderTransactionsTable();
  }

  resetFilters() {
    if (this.filterSearch) this.filterSearch.value = '';
    if (this.filterType) this.filterType.value = 'all';
    if (this.filterCategory) this.filterCategory.value = 'all';
    if (this.filterMonth) this.filterMonth.value = '';
    if (this.filterSort) this.filterSort.value = 'date-desc';

    this.applyFilters();
  }

  getFilteredTransactions() {
    let list = this.storage.getTransactions();

    // Search filter
    if (this.filters.search) {
      list = list.filter(t => t.description.toLowerCase().includes(this.filters.search));
    }

    // Type filter
    if (this.filters.type !== 'all') {
      list = list.filter(t => t.type === this.filters.type);
    }

    // Category filter
    if (this.filters.category !== 'all') {
      list = list.filter(t => t.category === this.filters.category);
    }

    // Month filter (YYYY-MM)
    if (this.filters.month) {
      list = list.filter(t => t.date.startsWith(this.filters.month));
    }

    // Sorting
    list.sort((a, b) => {
      if (this.filters.sort === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (this.filters.sort === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (this.filters.sort === 'amount-desc') return b.amount - a.amount;
      if (this.filters.sort === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    return list;
  }

  renderTransactionsTable() {
    const tbody = document.getElementById('transactionsTableBody');
    const emptyState = document.getElementById('tableEmptyState');
    const txCountSpan = document.getElementById('txFilteredCount');

    if (!tbody) return;

    const filtered = this.getFilteredTransactions();

    if (txCountSpan) {
      txCountSpan.textContent = `${filtered.length} transaction${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      
      tbody.innerHTML = filtered.map(t => `
        <tr>
          <td>${this.formatDate(t.date)}</td>
          <td><strong>${this.escapeHTML(t.description)}</strong></td>
          <td><span class="badge badge-category">${this.escapeHTML(t.category)}</span></td>
          <td>
            <span class="badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}">
              ${t.type}
            </span>
          </td>
          <td class="${t.type === 'income' ? 'amount-income' : 'amount-expense'}">
            ${t.type === 'income' ? '+' : '-'}${this.formatCurrency(t.amount)}
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn-icon-only" onclick="window.appInstance.editTransaction('${t.id}')" title="Edit Transaction">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-icon-only" onclick="window.appInstance.promptDeleteTransaction('${t.id}')" title="Delete Transaction">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-expense);">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  }

  /**
   * 7. Add / Edit Transaction Form Logic
   */
  populateCategoryDropdowns() {
    // Populate form category select
    this.updateFormCategories();

    // Populate filter category select
    if (this.filterCategory) {
      const allCategories = [...this.expenseCategories, ...this.incomeCategories];
      const uniqueCat = [...new Set(allCategories)];
      
      this.filterCategory.innerHTML = `
        <option value="all">All Categories</option>
        ${uniqueCat.map(c => `<option value="${c}">${c}</option>`).join('')}
      `;
    }
  }

  setFormType(type) {
    if (this.inputTxType) this.inputTxType.value = type;

    if (type === 'income') {
      this.btnIncomeToggle.classList.add('active-income');
      this.btnExpenseToggle.classList.remove('active-expense');
    } else {
      this.btnExpenseToggle.classList.add('active-expense');
      this.btnIncomeToggle.classList.remove('active-income');
    }

    this.updateFormCategories();
  }

  updateFormCategories() {
    if (!this.inputTxCategory) return;
    const type = this.inputTxType ? this.inputTxType.value : 'expense';
    const categories = type === 'income' ? this.incomeCategories : this.expenseCategories;

    this.inputTxCategory.innerHTML = `
      <option value="">Select Category</option>
      ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
    `;
  }

  openTransactionModal(transaction = null) {
    this.resetFormValidation();

    if (transaction) {
      this.editingTransactionId = transaction.id;
      if (this.formTitle) this.formTitle.textContent = 'Edit Transaction';
      this.setFormType(transaction.type);
      if (this.inputTxAmount) this.inputTxAmount.value = transaction.amount;
      if (this.inputTxCategory) this.inputTxCategory.value = transaction.category;
      if (this.inputTxDate) this.inputTxDate.value = transaction.date;
      if (this.inputTxDescription) this.inputTxDescription.value = transaction.description;
    } else {
      this.editingTransactionId = null;
      if (this.formTitle) this.formTitle.textContent = 'Add Transaction';
      this.setFormType('expense');
      this.formTransaction.reset();
      
      // Default to today's date (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      if (this.inputTxDate) this.inputTxDate.value = today;
    }

    this.openModal(this.modalTransaction);
  }

  editTransaction(id) {
    const t = this.storage.getTransactionById(id);
    if (t) {
      this.openTransactionModal(t);
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    const transactionData = {
      id: this.editingTransactionId,
      type: this.inputTxType.value,
      amount: parseFloat(this.inputTxAmount.value),
      category: this.inputTxCategory.value,
      date: this.inputTxDate.value,
      description: this.inputTxDescription.value
    };

    this.storage.saveTransaction(transactionData);
    this.closeModal(this.modalTransaction);
    this.renderCurrentView();

    const actionText = this.editingTransactionId ? 'updated' : 'added';
    this.showToast(`Transaction ${actionText} successfully`, 'success');
  }

  /**
   * Form Validation Logic
   */
  validateForm() {
    let isValid = true;
    this.resetFormValidation();

    // 1. Validate Amount
    const amountVal = parseFloat(this.inputTxAmount.value);
    if (isNaN(amountVal) || amountVal <= 0) {
      this.showInputError(this.inputTxAmount, 'Please enter a valid positive amount.');
      isValid = false;
    }

    // 2. Validate Category
    if (!this.inputTxCategory.value) {
      this.showInputError(this.inputTxCategory, 'Please select a category.');
      isValid = false;
    }

    // 3. Validate Date
    if (!this.inputTxDate.value) {
      this.showInputError(this.inputTxDate, 'Please select a valid date.');
      isValid = false;
    }

    // 4. Validate Description
    if (!this.inputTxDescription.value.trim()) {
      this.showInputError(this.inputTxDescription, 'Description cannot be empty.');
      isValid = false;
    }

    return isValid;
  }

  showInputError(inputEl, message) {
    if (!inputEl) return;
    inputEl.classList.add('is-invalid');
    const feedbackEl = inputEl.nextElementSibling;
    if (feedbackEl && feedbackEl.classList.contains('invalid-feedback')) {
      feedbackEl.textContent = message;
      feedbackEl.classList.add('show');
    }
  }

  clearInputError(inputEl) {
    if (!inputEl) return;
    inputEl.classList.remove('is-invalid');
    const feedbackEl = inputEl.nextElementSibling;
    if (feedbackEl && feedbackEl.classList.contains('invalid-feedback')) {
      feedbackEl.classList.remove('show');
    }
  }

  resetFormValidation() {
    [this.inputTxAmount, this.inputTxCategory, this.inputTxDate, this.inputTxDescription].forEach(input => {
      this.clearInputError(input);
    });
  }

  /**
   * 8. Delete Transaction Handling
   */
  promptDeleteTransaction(id) {
    const t = this.storage.getTransactionById(id);
    if (!t) return;

    this.deletingTransactionId = id;
    const deleteDescEl = document.getElementById('deleteTxDescription');
    if (deleteDescEl) {
      deleteDescEl.textContent = `"${t.description}" (${this.formatCurrency(t.amount)})`;
    }

    this.openModal(this.modalDelete);
  }

  confirmDelete() {
    if (this.deletingTransactionId) {
      this.storage.deleteTransaction(this.deletingTransactionId);
      this.closeModal(this.modalDelete);
      this.deletingTransactionId = null;
      this.renderCurrentView();
      this.showToast('Transaction deleted successfully', 'error');
    }
  }

  /**
   * 9. Reports & Canvas Visual Summary Charts
   */
  renderReportsView() {
    this.renderCharts();
    
    // Category Breakdown Table in Reports
    const transactions = this.storage.getTransactions();
    this.renderCategoryBreakdownList('reportsCategoryList', transactions);
  }

  renderCharts() {
    const transactions = this.storage.getTransactions();

    this.renderCategoryDonutChart(transactions);
    this.renderMonthlyBarChart(transactions);
  }

  /**
   * Pure Vanilla JS HTML5 Canvas Donut Chart for Expense Categories
   */
  renderCategoryDonutChart(transactions) {
    const canvas = document.getElementById('canvasCategoryDonut');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Resize for high DPI
    const width = canvas.width = canvas.parentElement.clientWidth || 300;
    const height = canvas.height = 250;

    ctx.clearRect(0, 0, width, height);

    // Filter expense transactions
    const expenses = transactions.filter(t => t.type === 'expense');
    
    if (expenses.length === 0) {
      ctx.fillStyle = this.isDarkMode() ? '#94a3b8' : '#64748b';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('No expense data available', width / 2, height / 2);
      return;
    }

    // Aggregate by category
    const categoryTotals = {};
    let totalExpenseAmount = 0;

    expenses.forEach(t => {
      const amt = parseFloat(t.amount);
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amt;
      totalExpenseAmount += amt;
    });

    // Draw Donut
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 20;
    const innerRadius = outerRadius * 0.65;

    let startAngle = -Math.PI / 2;

    Object.keys(categoryTotals).forEach(cat => {
      const sliceAngle = (categoryTotals[cat] / totalExpenseAmount) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = this.categoryColors[cat] || '#6366f1';
      ctx.fill();

      startAngle = endAngle;
    });

    // Center Total Text
    ctx.fillStyle = this.isDarkMode() ? '#f8fafc' : '#0f172a';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.formatCurrency(totalExpenseAmount), centerX, centerY - 8);

    ctx.fillStyle = this.isDarkMode() ? '#94a3b8' : '#64748b';
    ctx.font = '12px system-ui';
    ctx.fillText('Total Expenses', centerX, centerY + 14);

    // Update Donut Legend DOM
    const legendContainer = document.getElementById('donutChartLegend');
    if (legendContainer) {
      legendContainer.innerHTML = Object.keys(categoryTotals).map(cat => {
        const percent = Math.round((categoryTotals[cat] / totalExpenseAmount) * 100);
        return `
          <div class="legend-item">
            <span class="legend-color" style="background-color: ${this.categoryColors[cat] || '#6366f1'};"></span>
            <span>${cat}: ${percent}% (${this.formatCurrency(categoryTotals[cat])})</span>
          </div>
        `;
      }).join('');
    }
  }

  /**
   * Pure Vanilla JS HTML5 Canvas Monthly Bar Chart (Income vs Expense)
   */
  renderMonthlyBarChart(transactions) {
    const canvas = document.getElementById('canvasMonthlyBar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = canvas.width = canvas.parentElement.clientWidth || 400;
    const height = canvas.height = 250;

    ctx.clearRect(0, 0, width, height);

    if (transactions.length === 0) {
      ctx.fillStyle = this.isDarkMode() ? '#94a3b8' : '#64748b';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('No transaction history available', width / 2, height / 2);
      return;
    }

    // Group by month (Last 6 months)
    const monthsData = {};
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short' });
      monthsData[key] = { label, income: 0, expense: 0 };
    }

    transactions.forEach(t => {
      const key = t.date.substring(0, 7);
      if (monthsData[key]) {
        if (t.type === 'income') {
          monthsData[key].income += parseFloat(t.amount);
        } else {
          monthsData[key].expense += parseFloat(t.amount);
        }
      }
    });

    const monthKeys = Object.keys(monthsData);
    let maxVal = 100;
    monthKeys.forEach(k => {
      maxVal = Math.max(maxVal, monthsData[k].income, monthsData[k].expense);
    });

    // Drawing parameters
    const padding = { top: 30, right: 20, bottom: 40, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const groupW = chartW / monthKeys.length;
    const barW = Math.min(18, groupW * 0.35);

    // Draw Y-Axis Grid Lines
    ctx.strokeStyle = this.isDarkMode() ? '#334155' : '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const valLabel = Math.round(maxVal - (maxVal / 4) * i);
      ctx.fillStyle = this.isDarkMode() ? '#64748b' : '#94a3b8';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`Rs ${valLabel}`, padding.left - 8, y + 3);
    }

    // Draw Bars
    monthKeys.forEach((key, index) => {
      const data = monthsData[key];
      const groupX = padding.left + index * groupW + groupW / 2;

      // Income Bar (Green)
      const incomeH = (data.income / maxVal) * chartH;
      const incomeX = groupX - barW - 2;
      const incomeY = padding.top + (chartH - incomeH);
      
      ctx.fillStyle = '#10b981';
      ctx.fillRect(incomeX, incomeY, barW, incomeH);

      // Expense Bar (Rose)
      const expenseH = (data.expense / maxVal) * chartH;
      const expenseX = groupX + 2;
      const expenseY = padding.top + (chartH - expenseH);

      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(expenseX, expenseY, barW, expenseH);

      // Month Label
      ctx.fillStyle = this.isDarkMode() ? '#cbd5e1' : '#475569';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(data.label, groupX, height - 15);
    });
  }

  /**
   * Helper to Render Category Progress Bars
   */
  renderCategoryBreakdownList(containerId, transactions) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.875rem;">No expense data yet.</p>';
      return;
    }

    const catTotals = {};
    let totalExpense = 0;
    expenses.forEach(t => {
      const amt = parseFloat(t.amount);
      catTotals[t.category] = (catTotals[t.category] || 0) + amt;
      totalExpense += amt;
    });

    const sortedCats = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a]);

    container.innerHTML = sortedCats.map(cat => {
      const amt = catTotals[cat];
      const pct = Math.round((amt / totalExpense) * 100);
      const color = this.categoryColors[cat] || '#6366f1';

      return `
        <div style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem;">
            <span>${cat}</span>
            <span>${this.formatCurrency(amt)} (${pct}%)</span>
          </div>
          <div style="height: 8px; background-color: var(--bg-surface-hover); border-radius: 999px; overflow: hidden;">
            <div style="width: ${pct}%; height: 100%; background-color: ${color}; border-radius: 999px; transition: width 0.3s ease;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * 10. Settings View Rendering
   */
  renderSettingsView() {
    if (this.settingThemeToggle) {
      this.settingThemeToggle.checked = this.isDarkMode();
    }
  }

  /**
   * 11. Modal Helper Utilities
   */
  openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('active');
    document.body.style.overflow = '';
  }

  /**
   * 12. Toast Notification Utilities
   */
  showToast(message, type = 'info') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${this.escapeHTML(message)}</span>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * 13. General Utility Functions
   */
  formatCurrency(amount) {
    const num = Math.abs(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return (amount < 0 ? '-Rs ' : 'Rs ') + num;
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  isDarkMode() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}
