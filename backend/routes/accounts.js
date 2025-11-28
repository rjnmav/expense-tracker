import express from 'express';
import { body } from 'express-validator';
import Account from '../models/Account.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/accounts
// @desc    Get all accounts for a user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/accounts/:id
// @desc    Get single account
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/accounts
// @desc    Create a new account
// @access  Private
router.post('/', [
  body('name').trim().notEmpty().withMessage('Account name is required'),
  body('type').isIn(['bank', 'cash', 'credit_card', 'wallet']).withMessage('Invalid account type')
], async (req, res) => {
  try {
    const account = await Account.create({
      ...req.body,
      user: req.user._id
    });
    
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/accounts/:id
// @desc    Update an account
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const updatedAccount = await Account.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/accounts/:id
// @desc    Delete an account
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    await Account.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
