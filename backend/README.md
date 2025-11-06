Fusion Global Accounting Tool - Backend

A robust NestJS backend for the Fusion Global Accounting Tool with MongoDB integration, providing RESTful APIs for client management, transaction tracking, and invoice generation.

Features

Client Management: Create, read, update, and delete clients
Transaction Tracking: Record debit/credit transactions with automatic balance updates
Invoice Generation: Create and manage invoices with customizable templates
WeChat Integration: Send invoices and payment confirmations via WeChat
Excel Export: Export invoices and reports to Excel format
MongoDB Integration: Persistent data storage with Mongoose ODM
CORS Enabled: Ready for frontend integration
RESTful APIs: Clean and consistent API design

Installation & Setup

Prerequisites

Node.js 16+
npm or yarn
MongoDB 4.4+

1. Clone and Install Dependencies

bash
# Clone the repository
git clone <your-repo-url>
cd fusion-global-accounting/backend

# Install dependencies
npm install

2. Environment Setup

Create a .env file in the backend root directory:

env
# Database
MONGODB_URI=mongodb://localhost:27017/fusion-global-accounting

# Server
PORT=4000
NODE_ENV=development

3. Start MongoDB

bash
# Using Homebrew on macOS
brew services start mongodb-community

# Or start manually
mongod --dbpath /usr/local/var/mongodb

4. Run the Application

bash
# Development mode (auto-restart on changes)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Or start directly
npm start