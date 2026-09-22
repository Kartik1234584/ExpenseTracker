# ExpenseTrack - Personal Expense Tracker Web Application

![ExpenseTrack Logo](assets/favicon.svg)

**ExpenseTrack** is a complete, modern, responsive expense tracking single-page web application (SPA) built strictly using **HTML5**, **CSS3**, and **Vanilla JavaScript**. 

It features an intuitive dashboard, full CRUD operations (Create, Read, Update, Delete) for transactions, real-time multi-criteria filtering, interactive canvas reports, dark/light theme persistence, and an abstracted `localStorage` data service layer structured for seamless integration with a Python Flask + MySQL backend for Cloud/DevOps CI/CD projects.

---

## 🌟 Features

- **📊 Dashboard Analytics**:
  - Total Balance card (auto-colored based on net positive/negative state).
  - Total Income & Total Expenses summaries.
  - Total Transaction count & Current Month Expense metrics.
  - Recent activity feed & expense category progress bars.

- **💳 Complete Transaction CRUD**:
  - Add Income or Expense transactions with specific category selection.
  - Real-time form validation (prevents empty descriptions, negative amounts, invalid dates).
  - Edit existing transaction entries.
  - Delete transactions with confirmation modal.

- **🔍 Search & Advanced Filtering**:
  - Search transactions by description keyword.
  - Filter by Type (Income / Expense).
  - Filter by Category (Food, Transport, Shopping, Bills, Education, Entertainment, Health, Salary, Freelance, Business, Other).
  - Filter by Month (YYYY-MM picker).
  - Sort by Date (newest/oldest) or Amount (highest/lowest).

- **📈 Visual Reports & Summary**:
  - Interactive Donut Chart showing expenses by category (built using Vanilla JS HTML5 Canvas).
  - Comparative Bar Chart showing 6-month Income vs Expense trends.

- **🌙 Light / Dark Mode Toggle**:
  - Toggle between sleek Dark Mode and clean Light Mode.
  - User preference persisted in `localStorage`.

- **📱 Fully Responsive Design**:
  - Fixed sidebar navigation on Desktop.
  - Accessible mobile header & collapsible drawer navigation for Mobile & Tablet viewports.

---

## 📁 Project Structure

```text
expense-tracker/
│
├── index.html            # Semantic HTML5 Application Shell & SPA Views
├── css/
│   └── style.css         # Modern CSS3 Design Tokens, Themes, Layouts, & Animations
├── js/
│   ├── storage.js        # LocalStorage API Abstraction Layer (Flask REST ready)
│   └── app.js            # Core App Controller, DOM Binding, Canvas Charts, Validation
├── assets/
│   └── favicon.svg       # Application SVG Branding & Favicon
└── README.md             # Project Setup, Flask Integration, & CI/CD Documentation
```

---

## 🚀 How to Run Locally

Because ExpenseTrack is built with standard web technologies, no build tools or package managers (`npm`/`yarn`) are required!

### Option 1: Direct Browser Open
Simply double-click `index.html` or drag it into any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).

### Option 2: Python Built-in HTTP Server
If you have Python installed, navigate to the project directory in your terminal and run:

```bash
# Python 3
python -m http.server 8000
```
Then open `http://localhost:8000` in your web browser.

### Option 3: VS Code Live Server
1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension.
3. Click **"Go Live"** in the bottom status bar.

---