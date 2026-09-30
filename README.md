# 🚀 Expense Tracker – CI/CD Deployment on Microsoft Azure
A responsive **Expense Tracker web application** deployed using an automated **CI/CD pipeline** with **GitHub, Azure DevOps, Azure CLI, and Microsoft Azure Storage Static Website**.

This project demonstrates a hands-on Cloud/DevOps workflow where application source code is maintained in GitHub, validated through Azure DevOps, and automatically deployed to Azure Blob Storage using a self-hosted Windows build agent.

---

## 📌 Project Overview
The Expense Tracker is a web-based application that allows users to manage and monitor their income and expenses through a simple dashboard.

The main purpose of this project was not only to build the web application but also to implement a complete **CI/CD deployment workflow on Microsoft Azure**.

### Key Objectives

- Build a functional Expense Tracker web application
- Store the project source code in GitHub
- Create an Azure DevOps CI/CD pipeline
- Configure a self-hosted Windows agent
- Validate application files automatically
- Deploy the application to Azure Storage
- Host the application using Azure Storage Static Website
- Automate deployment whenever changes are pushed to the `main` branch

---

## ✨ Features

### 📊 Dashboard

- Total balance
- Total income
- Total expenses
- Total transactions
- Current month expenses
- Recent transactions
- Expense categories

### 💰 Transaction Management

- Add income transactions
- Add expense transactions
- View transactions
- Categorize transactions
- Track transaction amounts

### 📈 Reports

- Expense summaries
- Category-based expense information
- Transaction analysis

### ⚙️ Settings

- Application settings
- User preferences
- Interface configuration

### 🌙 User Interface

- Responsive design
- Modern dashboard interface
- Light/Dark mode support
- Mobile-friendly layout

---

# 🏗️ Architecture
The project follows this deployment architecture:

```
                    ┌─────────────────────┐
                    │       GitHub        │
                    │   Source Repository │
                    └──────────┬──────────┘
                               │
                               │ Push to main
                               ▼
                    ┌─────────────────────┐
                    │    Azure DevOps     │
                    │      Pipeline       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Self-Hosted Windows │
                    │       Agent         │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │         CI          │
                    │  Validate Project   │
                    │       Files         │
                    └──────────┬──────────┘
                               │
                         CI Successful
                               │
                    ┌──────────▼──────────┐
                    │         CD          │
                    │    Azure CLI        │
                    │  Upload Deployment  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Azure Storage     │
                    │    Blob Storage     │
                    │     $web Container  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Static Website    │
                    │   Expense Tracker   │
                    └─────────────────────┘
```

---

# 🛠️ Technologies Used

## Frontend

- HTML5
- CSS3
- JavaScript

## Version Control

- Git
- GitHub

## Cloud

- Microsoft Azure
- Azure Storage Account
- Azure Blob Storage
- Azure Storage Static Website
- Azure Resource Manager

## DevOps / CI/CD

- Azure DevOps
- Azure Pipelines
- CI/CD
- Self-Hosted Azure DevOps Agent
- Azure CLI
- GitHub–Azure DevOps Integration

---

# 📂 Project Structure

```
ExpenseTracker/
│
├── assets/
│   └── favicon.svg
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   └── storage.js
│
├── index.html
│
├── README.md
│
└── azure-pipelines.yml
```

---

# 🔄 CI/CD Workflow
The project uses an automated CI/CD pipeline.

## 1. Developer Pushes Code
Changes are committed and pushed to the GitHub `main` branch.

```
git add .
git commit -m "Update Expense Tracker"
git push origin main
```
This triggers the Azure DevOps pipeline.

---

## 2. Azure DevOps Pipeline
Azure DevOps detects the change and starts the pipeline.

The pipeline contains two stages:

```
CI
↓
CD
```

---

# 🧪 CI – Continuous Integration
The CI stage validates that the required application files exist before deployment.

The pipeline checks:

```
index.html
css/style.css
js/app.js
js/storage.js
```
If any required file is missing, the pipeline fails.

Example validation logic:

```
$files = @(
  "index.html",
  "css/style.css",
  "js/app.js",
  "js/storage.js"
)

foreach ($file in $files) {
  if (-not (Test-Path $file)) {
    Write-Error "Missing required file: $file"
    exit 1
  }
}
```
If all required files are present:

```
All required files are present.
```
The CI stage succeeds and the pipeline continues to CD.

---

# 🚀 CD – Continuous Deployment
After successful CI validation, the CD stage deploys the application to Azure Storage.

Azure CLI is used to upload the application files to the `$web` container.

The deployment command used was:

```
az storage blob upload-batch \
  --account-name expensetracker2026cicd \
  --destination '$web' \
  --source "$(Build.SourcesDirectory)" \
  --auth-mode login \
  --overwrite
```

### Deployment Process

```
Azure DevOps
      ↓
AzureCLI@2
      ↓
Azure Authentication
      ↓
Azure Storage
      ↓
$web Container
      ↓
Static Website
```

---

# ☁️ Azure Storage Configuration
The application was hosted using **Azure Storage Static Website**.

The following configuration was used:

```
Storage Account
        │
        └── Static Website
                │
                ├── Index document
                │      └── index.html
                │
                └── $web container
                       ├── index.html
                       ├── css/
                       ├── js/
                       └── assets/
```
The `$web` container was used by Azure Storage Static Website hosting to serve the application.

---

# 🔐 Azure Authentication
The Azure DevOps pipeline used an **Azure Resource Manager service connection** with:

```
Authentication:
Workload Identity Federation
```
The service connection allowed Azure DevOps to authenticate with Azure without storing a traditional client secret in the pipeline.

The deployment used:

```
--auth-mode login
```
to perform authenticated Azure Storage operations.

---

# 🤖 Self-Hosted Agent
Instead of using a Microsoft-hosted pipeline agent, this project used a **self-hosted Windows agent**.

### Agent Environment

```
Operating System:
Windows

Agent Pool:
Default

Agent:
INSPIRON15
```
The self-hosted agent executed the Azure DevOps pipeline directly on the Windows machine.

### Why a Self-Hosted Agent Was Used
The Azure DevOps organization did not have hosted parallel jobs available for the pipeline, so a self-hosted agent was configured.

The agent successfully executed:

- GitHub checkout
- CI validation
- Azure CLI commands
- Azure deployment

---

# 📜 Azure Pipeline
The complete pipeline configuration used during the project was:

```
trigger:
  - main

pool:
  name: Default

stages:

# =========================
# CI - Validate
# =========================
- stage: CI
  displayName: 'CI - Validate Expense Tracker'

  jobs:
  - job: Validate
    displayName: 'Validate Files'

    steps:
    - checkout: self

    - powershell: |
        Write-Host "Checking Expense Tracker files..."

        $files = @(
          "index.html",
          "css/style.css",
          "js/app.js",
          "js/storage.js"
        )

        foreach ($file in $files) {
          if (-not (Test-Path $file)) {
            Write-Error "Missing required file: $file"
            exit 1
          }
        }

        Write-Host "All required files are present."
      displayName: 'Validate Expense Tracker'

# =========================
# CD - Deploy to Azure
# =========================
- stage: CD
  displayName: 'CD - Deploy to Azure'

  dependsOn: CI
  condition: succeeded()

  jobs:
  - job: Deploy
    displayName: 'Deploy to Azure Storage'

    steps:
    - checkout: self

    - task: AzureCLI@2
      displayName: 'Deploy Expense Tracker to Azure Storage'
      inputs:
        azureSubscription: 'ExpenseTracker-Azure'
        scriptType: 'ps'
        scriptLocation: 'inlineScript'
        inlineScript: |
          Write-Host "Deploying Expense Tracker to Azure Storage..."

          az storage blob upload-batch `
            --account-name expensetracker2026cicd `
            --destination '$web' `
            --source "$(Build.SourcesDirectory)" `
            --auth-mode login `
            --overwrite

          Write-Host "Deployment completed successfully!"
```

---

# 📸 Project Implementation
The project was implemented hands-on using Microsoft Azure and Azure DevOps.

The completed pipeline successfully executed:

```
CI - Validate Expense Tracker       ✅

CD - Deploy to Azure                ✅

Deploy to Azure Storage             ✅
```
The application was successfully loaded through Azure Storage Static Website hosting.

> **Note:** The Azure resources were removed after the project was completed to avoid ongoing cloud-resource usage and costs.

---

# 🧪 Pipeline Result
A successful pipeline execution followed this flow:

```
GitHub
   ↓
Azure DevOps
   ↓
Self-Hosted Agent
   ↓
CI Validation
   ↓
CI Passed
   ↓
CD Deployment
   ↓
Azure Storage
   ↓
Expense Tracker Website
```

---

# 🎯 What I Learned
Through this project, I gained hands-on experience with:

- Git and GitHub source control
- Azure DevOps projects
- Azure Pipelines
- YAML pipeline configuration
- Continuous Integration
- Continuous Deployment
- Self-hosted Azure DevOps agents
- Azure CLI
- Azure Storage
- Azure Blob Storage
- Static Website hosting
- Azure Resource Manager
- Workload Identity Federation
- Azure RBAC
- Storage Blob Data Contributor role
- GitHub and Azure DevOps integration
- Cloud deployment troubleshooting
- Pipeline troubleshooting and debugging

---

# 🧩 Challenges Solved

## 1. Azure DevOps Hosted Agent Limitation
The initial pipeline could not use a Microsoft-hosted agent because hosted parallelism was not available.

### Solution
Configured a Windows self-hosted Azure DevOps agent.

---

## 2. Azure Authentication
The pipeline required secure authentication to Azure.

### Solution
Configured an Azure Resource Manager service connection using:

```
Workload Identity Federation
```

---

## 3. Azure Storage Permissions
The pipeline could authenticate to Azure but initially could not upload blobs.

### Solution
Assigned:

```
Storage Blob Data Contributor
```
to the service principal associated with the Azure DevOps service connection.

---

## 4. Automated Deployment
The application needed to be deployed without manually uploading files.

### Solution
Used:

```
AzureCLI@2
```
and:

```
az storage blob upload-batch
```
to automatically upload the application to the `$web` container.

---

# 🔒 Security Considerations
This project used Azure DevOps Workload Identity Federation instead of storing a long-lived Azure client secret in the pipeline.

Important security practices followed:

- No passwords stored in the repository
- No Azure credentials committed to GitHub
- Azure service connection used for authentication
- Azure RBAC used for Storage access
- Storage permissions limited to the required data operation

---

# 📌 Future Improvements
Possible improvements for a production-ready version include:

- Add automated HTML/CSS/JavaScript linting
- Add automated testing
- Add code quality checks
- Add separate development and production environments
- Add deployment approval gates
- Add rollback strategy
- Add Azure monitoring
- Add Application Insights where applicable
- Improve security and access policies
- Use Infrastructure as Code with Terraform or Bicep

---

# 👨‍💻 Author
**Kartik Sadhu**

MCA – Cloud Computing

Interested in:

- Cloud Computing
- Microsoft Azure
- AWS
- DevOps
- CI/CD
- Cloud Infrastructure

---

# ⭐ Project Highlights

```
☁️ Microsoft Azure
🔄 CI/CD Pipeline
🐙 GitHub
🔧 Azure DevOps
🖥️ Self-Hosted Agent
⚡ Azure CLI
📦 Azure Blob Storage
🌐 Static Website Hosting
🔐 Workload Identity Federation
```

---

## 📄 License
This project is created for **educational, portfolio, and learning purposes**.
