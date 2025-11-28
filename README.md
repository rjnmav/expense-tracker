# 💰 Expense Tracker

A modern, full-stack personal expense tracker web application with MongoDB database. Track daily transactions across multiple accounts and cash, analyze spending patterns weekly, monthly, and annually with beautiful graphical visualizations.

![Built with](https://img.shields.io/badge/Built%20with-React-61DAFB?style=flat&logo=react)
![Backend](https://img.shields.io/badge/Backend-Node.js-339933?style=flat&logo=node.js)
![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat&logo=mongodb)
![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss)

## ✨ Features

### 📊 Dashboard
- Real-time overview of your finances
- Summary cards showing total balance, income, expenses, and net balance
- Visual category breakdown with doughnut charts
- Recent transactions at a glance
- Quick account overview with balances

### 💳 Multi-Account Management
- Support for multiple account types (Bank, Cash, Credit Card, Wallet)
- Customizable account colors and icons
- Track balance for each account separately
- Easy account creation and management

### 📝 Transaction Management
- Add income, expenses, and transfers between accounts
- Categorize transactions with predefined categories
- Custom descriptions and tags
- Date selection for backdated entries
- Edit and delete transactions with automatic balance updates
- Advanced filtering and search functionality

### 📈 Analytics & Insights
- **Period Selection**: View data by week, month, or year
- **Expense Trends**: Line charts showing spending over time
- **Category Distribution**: Pie charts for expense breakdown
- **Account Statistics**: Bar charts comparing account balances
- **Top Spending Categories**: Ranked list with percentages
- **Detailed Reports**: Transaction counts and trends

### 🎨 Modern UI/UX
- Clean, elegant, and engaging design
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and transitions
- Intuitive navigation
- Toast notifications for user feedback
- Loading states and error handling

### 🔐 Authentication
- Secure user registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router DOM** - Navigation
- **Tailwind CSS** - Styling
- **Chart.js + react-chartjs-2** - Data visualization
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **date-fns** - Date manipulation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (v4.4 or higher)
  - Local installation OR
  - MongoDB Atlas account (cloud database)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd expense-tracker
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# Update MongoDB URI, JWT secret, etc.
nano .env
```

**Environment Variables (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

### 4. Start MongoDB

**Local MongoDB:**
```bash
# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
# Or start manually: mongod
```

**MongoDB Atlas:**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Add it to backend `.env` file

### 5. Run the Application

You'll need two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will start on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will start on `http://localhost:3000`

### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📱 Usage Guide

### Getting Started

1. **Register an Account**
   - Click "Sign up" on the login page
   - Enter your name, email, and password
   - Click "Create Account"

2. **Create Your First Account**
   - Navigate to "Accounts" page
   - Click "Add Account"
   - Choose account type, name, and initial balance
   - Select a color theme
   - Click "Create"

3. **Add Transactions**
   - Go to "Transactions" page
   - Click "Add Transaction"
   - Select type (Income/Expense/Transfer)
   - Choose category, amount, account, and date
   - Add optional description
   - Click "Create"

4. **View Analytics**
   - Navigate to "Analytics" page
   - Select time period (week/month/year)
   - View charts and statistics
   - Analyze spending patterns

### Categories

**Expense Categories:**
- Food & Dining
- Transportation
- Entertainment
- Utilities
- Healthcare
- Shopping
- Education
- Travel
- Insurance
- Rent
- Groceries
- Personal Care
- Gifts
- Other

**Income Categories:**
- Salary
- Freelance
- Business
- Investment
- Rental Income
- Gift
- Refund
- Other

## 🗂️ Project Structure

```
expense-tracker/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── middleware/
│   │   ├── auth.js               # Authentication middleware
│   │   └── errorHandler.js       # Error handling
│   ├── models/
│   │   ├── User.js               # User model
│   │   ├── Account.js            # Account model
│   │   └── Transaction.js        # Transaction model
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── accounts.js           # Account routes
│   │   ├── transactions.js       # Transaction routes
│   │   └── analytics.js          # Analytics routes
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   └── server.js                 # Entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx        # Main layout component
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login page
│   │   │   ├── Register.jsx      # Register page
│   │   │   ├── Dashboard.jsx     # Dashboard page
│   │   │   ├── Transactions.jsx  # Transactions page
│   │   │   ├── Accounts.jsx      # Accounts page
│   │   │   └── Analytics.jsx     # Analytics page
│   │   ├── utils/
│   │   │   ├── api.js            # API calls
│   │   │   ├── constants.js      # Constants
│   │   │   └── helpers.js        # Helper functions
│   │   ├── App.jsx               # App component
│   │   ├── main.jsx              # Entry point
│   │   └── index.css             # Global styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── .github/
│   └── copilot-instructions.md   # Project setup instructions
└── README.md                     # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Accounts
- `GET /api/accounts` - Get all accounts
- `GET /api/accounts/:id` - Get single account
- `POST /api/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Transactions
- `GET /api/transactions` - Get all transactions (with filters)
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Analytics
- `GET /api/analytics/summary` - Get summary statistics
- `GET /api/analytics/trends` - Get trend data
- `GET /api/analytics/categories` - Get category breakdown
- `GET /api/analytics/accounts` - Get account statistics

## 🧪 Testing

### Test the Backend API

```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## 🎨 Customization

### Change Color Scheme

Edit `frontend/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom color palette
      },
    },
  },
}
```

### Add New Categories

Edit `frontend/src/utils/constants.js`:
```javascript
export const EXPENSE_CATEGORIES = [
  // Add your categories here
];
```

## 🔧 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux
brew services list  # macOS

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Deployment

### Backend (Heroku example)
```bash
cd backend
heroku create your-app-name
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_jwt_secret
git push heroku main
```

### Frontend (Vercel example)
```bash
cd frontend
npm run build
vercel --prod
```

### Environment Variables for Production
Update your production environment with:
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Strong random secret
- `NODE_ENV=production`

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

Your Name - [Your GitHub](https://github.com/yourusername)

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

## 📧 Contact

For questions or feedback, please reach out at: your.email@example.com

---

**Happy Tracking! 💰📊**
