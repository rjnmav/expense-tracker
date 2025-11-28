# 🚨 IMPORTANT: Node.js Version Issue

## Problem
Your system is using **Node.js v12.22.9**, which is outdated and doesn't support modern JavaScript features used by the dependencies.

## Solution: Upgrade Node.js

### Option 1: Using NodeSource (Recommended)
```bash
# Remove old Node.js
sudo apt remove nodejs npm

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version
```

### Option 2: Using NVM (Node Version Manager)
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload your shell
source ~/.bashrc

# Install Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

# Verify
node --version
```

### Option 3: Download from NodeJS.org
Visit https://nodejs.org/ and download the LTS version (v18 or v20)

## After Upgrading Node.js

1. **Navigate to backend folder**:
   ```bash
   cd /home/wot-rajan/Practice/Tools/expense-tracker/backend
   ```

2. **Clean install dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Start the backend**:
   ```bash
   npm run dev
   ```

4. **In a new terminal, navigate to frontend**:
   ```bash
   cd /home/wot-rajan/Practice/Tools/expense-tracker/frontend
   npm install
   npm run dev
   ```

## Why This is Needed

- Node.js v12 reached **end-of-life** in April 2022
- Modern npm packages use features like:
  - Optional chaining (`?.`)
  - Nullish coalescing (`??`)
  - ES2020+ features
- These features are only available in Node.js v14+

## Recommended Version
- **Node.js 18 LTS** (Long Term Support) - most stable
- **Node.js 20 LTS** - latest LTS version

Both are fully compatible with this project.
