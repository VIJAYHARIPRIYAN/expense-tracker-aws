# Expense Tracker Analytics Platform (AWS Cloud Project)

## Overview

Expense Tracker Analytics Platform is a serverless cloud-based application that allows users to upload expense CSV files, automatically process transaction data, store files in AWS S3, generate analytics using AWS Lambda, and visualize spending insights through an interactive dashboard.

The project demonstrates the use of modern cloud technologies and data processing workflows using AWS services.

---

## Features

* Upload expense CSV files
* Store raw files in Amazon S3
* Process uploaded data using AWS Lambda
* Store analytics results in Amazon DynamoDB
* Automatic currency normalization to INR (₹)
* Dashboard for spending analysis
* Category-wise expenditure breakdown
* Total spending and transaction summaries
* Serverless architecture with AWS

---

## AWS Services Used

### Amazon S3

* Stores uploaded raw expense files

### AWS Lambda

* Processes uploaded CSV files
* Calculates spending analytics
* Converts supported currencies to INR

### Amazon DynamoDB

* Stores processed analytics and metadata

### Amazon API Gateway

* Provides REST API endpoints for frontend communication

---

## Architecture

User Upload CSV
↓
React Frontend
↓
API Gateway
↓
ExpenseProcessor Lambda
↓
Amazon S3 (Raw Files)
↓
Amazon DynamoDB (Analytics)
↓
ExpenseSummary Lambda
↓
Dashboard Visualization

---

## Dashboard Metrics

* Total Spending
* Total Transactions
* Top Spending Category
* Monthly Spending Overview
* Category Breakdown Charts

---

## Technologies Used

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* AWS Lambda (Python)
* API Gateway

### Database

* Amazon DynamoDB

### Storage

* Amazon S3

---

## Sample CSV Format

```csv
Category,Amount
Food,500
Transport,300
Bills,1200
Shopping,800
```

---

## Project Outcomes

* Built a fully serverless expense analytics solution
* Implemented cloud-based file storage and processing
* Developed data visualization dashboards
* Integrated multiple AWS services into a production workflow
* Demonstrated cloud computing and data engineering concepts

---

## Future Enhancements

* Upload history tracking
* Advanced file validation
* AI-powered spending recommendations
* Multi-user authentication
* Athena and QuickSight integration
* Real-time exchange rate support

---

## Author

Vijay Haripriyan

AWS Cloud & Data Engineering Project
