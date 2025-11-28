# Quick Start Guide

## Prerequisites Check

- [ ] Node.js installed (v16+)
- [ ] npm installed
- [ ] MongoDB installed OR MongoDB Atlas account

## Installation Steps

### Option 1: Automated Setup (Linux/macOS)

```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

#### 1. Install Backend Dependencies
```bash
cd backend
npm install
cp .env.example .env
# Edit .env file with your configuration
```

#### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

#### 3. Configure Environment

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=change_this_to_a_random_secret_string
JWT_EXPIRE=7d
NODE_ENV=development
```

#### 4. Start MongoDB

**Local:**
```bash
sudo systemctl start mongod
```

**Cloud (MongoDB Atlas):**
- Create free cluster at mongodb.com/cloud/atlas
- Get connection string
- Update MONGODB_URI in .env

#### 5. Run Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### 6. Access Application

Open browser: http://localhost:3000

## First Time Use

1. Click "Sign Up"
2. Create your account
3. Add your first account (Settings > Accounts)
4. Start adding transactions!

## Common Issues

### Port 5000 in use
```bash
# Find and kill process
lsof -i :5000
kill -9 <PID>
```

### MongoDB connection failed
- Check if MongoDB is running
- Verify MONGODB_URI in .env
- Check MongoDB logs

### Dependencies installation failed
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Need Help?

Check the full README.md for detailed documentation.
