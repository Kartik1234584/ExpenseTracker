/**
 * StorageService - LocalStorage Abstraction Layer
 * 
 * ExpenseTrack Web Application
 * This service manages transaction state and theme preferences in browser localStorage.
 * It is structured cleanly so that methods can later be replaced with fetch API calls 
 * to a Python Flask + MySQL backend in a CI/CD cloud deployment.
 */

const STORAGE_KEYS = {
  TRANSACTIONS: 'expensetrack_transactions',
  THEME: 'expensetrack_theme',
  INITIALIZED: 'expensetrack_initialized'
};

// Initial sample transaction dataset for first launch
const SAMPLE_TRANSACTIONS = [
  {
    id: 'tx_101',
    type: 'income',
    amount: 4500.00,
    category: 'Salary',
    date: '2026-09-01',
    description: 'Monthly Salary Payment',
    createdAt: '2026-09-01T09:00:00.000Z'
  },
  {
    id: 'tx_102',
    type: 'expense',
    amount: 1200.00,
    category: 'Bills',
    date: '2026-09-03',
    description: 'Apartment Rent Payment',
    createdAt: '2026-09-03T10:30:00.000Z'
  },
  {
    id: 'tx_103',
    type: 'expense',
    amount: 145.50,
    category: 'Food',
    date: '2026-09-05',
    description: 'Weekly Grocery Shopping',
    createdAt: '2026-09-05T14:15:00.000Z'
  },
  {
    id: 'tx_104',
    type: 'income',
    amount: 650.00,
    category: 'Freelance',
    date: '2026-09-10',
    description: 'Web Design Project Client',
    createdAt: '2026-09-10T16:45:00.000Z'
  },
  {
    id: 'tx_105',
    type: 'expense',
    amount: 60.00,
    category: 'Transport',
    date: '2026-09-12',
    description: 'Monthly Transit Pass',
    createdAt: '2026-09-12T08:20:00.000Z'
  },
  {
    id: 'tx_106',
    type: 'expense',
    amount: 120.00,
    category: 'Entertainment',
    date: '2026-09-15',
    description: 'Concert Tickets',
    createdAt: '2026-09-15T19:00:00.000Z'
  },
  {
    id: 'tx_107',
    type: 'expense',
    amount: 210.00,
    category: 'Shopping',
    date: '2026-09-18',
    description: 'New Running Shoes',
    createdAt: '2026-09-18T15:10:00.000Z'
  },
  {
    id: 'tx_108',
    type: 'expense',
    amount: 85.00,
    category: 'Health',
    date: '2026-09-20',
    description: 'Pharmacy & Vitamin Supplements',
    createdAt: '2026-09-20T11:00:00.000Z'
  },
  {
    id: 'tx_109',
    type: 'expense',
    amount: 45.00,
    category: 'Education',
    date: '2026-08-25',
    description: 'Online Tech Book Purchase',
    createdAt: '2026-08-25T13:30:00.000Z'
  },
  {
    id: 'tx_110',
    type: 'income',
    amount: 4500.00,
    category: 'Salary',
    date: '2026-08-01',
    description: 'August Salary Payment',
    createdAt: '2026-08-01T09:00:00.000Z'
  }
];

class StorageService {
  constructor() {
    this.initStorage();
  }

  /**
   * Initialize storage with sample data on first run
   */
  initStorage() {
    try {
      const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!isInitialized) {
        this.resetToSampleData();
      }
    } catch (e) {
      console.error('LocalStorage initialization error:', e);
    }
  }

  /**
   * Retrieve all transactions sorted by date (newest first)
   * @returns {Array} List of transaction objects
   */
  getTransactions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const transactions = data ? JSON.parse(data) : [];
      return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (e) {
      console.error('Error reading transactions from LocalStorage:', e);
      return [];
    }
  }

  /**
   * Fetch a single transaction by ID
   * @param {string} id 
   * @returns {Object|null}
   */
  getTransactionById(id) {
    const transactions = this.getTransactions();
    return transactions.find(t => t.id === id) || null;
  }

  /**
   * Save a new transaction or update existing transaction
   * @param {Object} transaction 
   * @returns {Object} Saved transaction
   */
  saveTransaction(transactionData) {
    const transactions = this.getTransactions();
    let savedItem;

    if (transactionData.id) {
      // Update existing
      const index = transactions.findIndex(t => t.id === transactionData.id);
      if (index !== -1) {
        transactions[index] = {
          ...transactions[index],
          ...transactionData,
          amount: parseFloat(transactionData.amount),
          updatedAt: new Date().toISOString()
        };
        savedItem = transactions[index];
      }
    } else {
      // Create new
      savedItem = {
        id: 'tx_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        type: transactionData.type,
        amount: parseFloat(transactionData.amount),
        category: transactionData.category,
        date: transactionData.date,
        description: transactionData.description.trim(),
        createdAt: new Date().toISOString()
      };
      transactions.unshift(savedItem);
    }

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return savedItem;
  }

  /**
   * Delete a transaction by ID
   * @param {string} id 
   * @returns {boolean} True if deleted successfully
   */
  deleteTransaction(id) {
    let transactions = this.getTransactions();
    const initialLength = transactions.length;
    transactions = transactions.filter(t => t.id !== id);

    if (transactions.length !== initialLength) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      return true;
    }
    return false;
  }

  /**
   * Clear all transactions from localStorage
   */
  clearAllTransactions() {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }

  /**
   * Reset data to default sample transactions
   */
  resetToSampleData() {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(SAMPLE_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }

  /**
   * Get theme preference ('light' | 'dark')
   */
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  }

  /**
   * Save theme preference
   * @param {string} theme 
   */
  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }
}

// Global instance for application access
window.storageService = new StorageService();
