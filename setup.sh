#!/bin/bash

# Expense Tracker Quick Start Script
echo "🚀 Expense Tracker Quick Start"
echo "================================"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first:"
    echo "   Ubuntu/Debian: sudo apt install nodejs npm"
    echo "   macOS: brew install node"
    echo "   Or download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js and npm found"
echo ""

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found locally. You can either:"
    echo "   1. Install MongoDB locally"
    echo "   2. Use MongoDB Atlas (cloud) - get connection string from https://www.mongodb.com/cloud/atlas"
    echo ""
fi

# Backend setup
echo "📦 Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env and update:"
    echo "   - MONGODB_URI (if using Atlas or custom MongoDB)"
    echo "   - JWT_SECRET (use a strong random string)"
fi

if [ ! -d "node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

cd ..

# Frontend setup
echo ""
echo "📦 Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Make sure MongoDB is running (or update .env with Atlas URI)"
echo "   2. Open two terminal windows:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   $ cd backend"
echo "   $ npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   $ cd frontend"
echo "   $ npm run dev"
echo ""
echo "   3. Open http://localhost:3000 in your browser"
echo ""
echo "💡 Tip: Check README.md for detailed instructions"
echo ""
