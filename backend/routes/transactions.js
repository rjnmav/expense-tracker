import express from 'express';
import { body } from 'express-validator';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/transactions
// @desc    Get all transactions for a user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, type, category, account } = req.query;
    const query = { user: req.user._id };

    // Add filters
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (type) query.type = type;
    if (category) query.category = category;
    if (account) query.account = account;

    const transactions = await Transaction.find(query)
      .populate('account', 'name type color')
      .populate('toAccount', 'name type color')
      .sort({ date: -1 });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    })
      .populate('account', 'name type color')
      .populate('toAccount', 'name type color');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', [
  body('type').isIn(['income', 'expense', 'transfer']).withMessage('Invalid transaction type'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('account').notEmpty().withMessage('Account is required')
], async (req, res) => {
  try {
    const { account, toAccount, amount, type } = req.body;

    // Verify account belongs to user
    const accountDoc = await Account.findOne({ _id: account, user: req.user._id });
    if (!accountDoc) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Create transaction
    const transaction = await Transaction.create({
      ...req.body,
      user: req.user._id
    });

    // Update account balance
    if (type === 'income') {
      accountDoc.balance += amount;
    } else if (type === 'expense') {
      accountDoc.balance -= amount;
    } else if (type === 'transfer' && toAccount) {
      const toAccountDoc = await Account.findOne({ _id: toAccount, user: req.user._id });
      if (toAccountDoc) {
        accountDoc.balance -= amount;
        toAccountDoc.balance += amount;
        await toAccountDoc.save();
      }
    }
    
    await accountDoc.save();

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('account', 'name type color')
      .populate('toAccount', 'name type color');
    
    res.status(201).json(populatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const oldTransaction = await Transaction.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!oldTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Revert old transaction balance changes
    const oldAccount = await Account.findById(oldTransaction.account);
    if (oldAccount) {
      if (oldTransaction.type === 'income') {
        oldAccount.balance -= oldTransaction.amount;
      } else if (oldTransaction.type === 'expense') {
        oldAccount.balance += oldTransaction.amount;
      } else if (oldTransaction.type === 'transfer' && oldTransaction.toAccount) {
        const oldToAccount = await Account.findById(oldTransaction.toAccount);
        if (oldToAccount) {
          oldAccount.balance += oldTransaction.amount;
          oldToAccount.balance -= oldTransaction.amount;
          await oldToAccount.save();
        }
      }
      await oldAccount.save();
    }

    // Update transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('account', 'name type color')
     .populate('toAccount', 'name type color');

    // Apply new balance changes
    const newAccount = await Account.findById(updatedTransaction.account);
    if (newAccount) {
      if (updatedTransaction.type === 'income') {
        newAccount.balance += updatedTransaction.amount;
      } else if (updatedTransaction.type === 'expense') {
        newAccount.balance -= updatedTransaction.amount;
      } else if (updatedTransaction.type === 'transfer' && updatedTransaction.toAccount) {
        const newToAccount = await Account.findById(updatedTransaction.toAccount);
        if (newToAccount) {
          newAccount.balance -= updatedTransaction.amount;
          newToAccount.balance += updatedTransaction.amount;
          await newToAccount.save();
        }
      }
      await newAccount.save();
    }
    
    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Revert balance changes
    const account = await Account.findById(transaction.account);
    if (account) {
      if (transaction.type === 'income') {
        account.balance -= transaction.amount;
      } else if (transaction.type === 'expense') {
        account.balance += transaction.amount;
      } else if (transaction.type === 'transfer' && transaction.toAccount) {
        const toAccount = await Account.findById(transaction.toAccount);
        if (toAccount) {
          account.balance += transaction.amount;
          toAccount.balance -= transaction.amount;
          await toAccount.save();
        }
      }
      await account.save();
    }

    await Transaction.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
