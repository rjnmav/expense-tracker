import express from 'express';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const result = new Date(d);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getEndOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (6 - day);
  const result = new Date(d);
  result.setDate(diff);
  result.setHours(23, 59, 59, 999);
  return result;
};

const getStartOfMonth = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
};

const getEndOfMonth = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
};

const getStartOfYear = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
};

const getEndOfYear = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
};

const subtractWeeks = (date, weeks) => {
  const d = new Date(date);
  d.setDate(d.getDate() - (weeks * 7));
  return d;
};

const subtractMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
};

const subtractYears = (date, years) => {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() - years);
  return d;
};

router.get('/summary', async (req, res) => {
  try {
    const { period = 'month', account, startDate: queryStartDate, endDate: queryEndDate } = req.query;
    let startDate, endDate;
    const now = new Date();

    if (queryStartDate && queryEndDate) {
      startDate = new Date(queryStartDate);
      endDate = new Date(queryEndDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      if (period === 'week') {
        startDate = getStartOfWeek(now);
        endDate = getEndOfWeek(now);
      } else if (period === 'month') {
        startDate = getStartOfMonth(now);
        endDate = getEndOfMonth(now);
      } else if (period === 'year') {
        startDate = getStartOfYear(now);
        endDate = getEndOfYear(now);
      } else {
        startDate = getStartOfMonth(now);
        endDate = getEndOfMonth(now);
      }
    }

    const query = {
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    };

    if (account) {
      query.account = account;
    }

    const transactions = await Transaction.find(query);
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;

    const accountQuery = { user: req.user._id, isActive: true };
    if (account) {
      accountQuery._id = account;
    }
    const accounts = await Account.find(accountQuery);
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const categoryBreakdown = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    res.json({ period, startDate, endDate, income, expenses, balance, totalBalance, transactionCount: transactions.length, categoryBreakdown });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/trends', async (req, res) => {
  try {
    const { period = 'month', type = 'expense', account, startDate: queryStartDate, endDate: queryEndDate } = req.query;
    let startDate, endDate;

    if (queryStartDate && queryEndDate) {
      startDate = new Date(queryStartDate);
      endDate = new Date(queryEndDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      endDate = new Date();
      if (period === 'week') {
        startDate = subtractWeeks(endDate, 12);
      } else if (period === 'month') {
        startDate = subtractMonths(endDate, 12);
      } else if (period === 'year') {
        startDate = subtractYears(endDate, 5);
      } else {
        startDate = subtractMonths(endDate, 12);
      }
    }

    const query = {
      user: req.user._id,
      type,
      date: { $gte: startDate, $lte: endDate }
    };

    if (account) {
      query.account = account;
    }

    const transactions = await Transaction.find(query)
      .sort({ date: 1 })
      .populate('account', 'name color');

    const grouped = transactions.reduce((acc, transaction) => {
      let key;
      const date = new Date(transaction.date);

      if (period === 'day') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (period === 'week') {
        const yearStart = getStartOfYear(date);
        const weekNum = Math.ceil((date - yearStart) / (7 * 24 * 60 * 60 * 1000));
        key = date.getFullYear() + '-W' + weekNum;
      } else if (period === 'month') {
        key = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
      } else {
        key = String(date.getFullYear());
      }

      if (!acc[key]) {
        acc[key] = { total: 0, count: 0, accounts: {} };
      }

      acc[key].total += transaction.amount;
      acc[key].count += 1;

      // Group by account
      if (transaction.account) {
        const accId = transaction.account._id.toString();
        if (!acc[key].accounts[accId]) {
          acc[key].accounts[accId] = {
            name: transaction.account.name,
            color: transaction.account.color,
            total: 0
          };
        }
        acc[key].accounts[accId].total += transaction.amount;
      }

      return acc;
    }, {});

    const trends = Object.keys(grouped).map(key => ({
      period: key,
      total: grouped[key].total,
      count: grouped[key].count,
      average: grouped[key].total / grouped[key].count,
      accounts: grouped[key].accounts
    }));

    // Sort trends by period
    trends.sort((a, b) => a.period.localeCompare(b.period));

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const { period = 'month', account, startDate: queryStartDate, endDate: queryEndDate } = req.query;
    let startDate, endDate;
    const now = new Date();

    if (queryStartDate && queryEndDate) {
      startDate = new Date(queryStartDate);
      endDate = new Date(queryEndDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      if (period === 'week') {
        startDate = getStartOfWeek(now);
        endDate = getEndOfWeek(now);
      } else if (period === 'month') {
        startDate = getStartOfMonth(now);
        endDate = getEndOfMonth(now);
      } else if (period === 'year') {
        startDate = getStartOfYear(now);
        endDate = getEndOfYear(now);
      } else {
        startDate = getStartOfMonth(now);
        endDate = getEndOfMonth(now);
      }
    }

    const matchStage = {
      user: req.user._id,
      type: 'expense',
      date: { $gte: startDate, $lte: endDate }
    };

    if (account) {
      const mongoose = await import('mongoose');
      matchStage.account = new mongoose.default.Types.ObjectId(account);
    }

    const transactions = await Transaction.aggregate([
      { $match: matchStage },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    const total = transactions.reduce((sum, t) => sum + t.total, 0);
    const categoriesWithPercentage = transactions.map(cat => ({
      category: cat._id,
      total: cat.total,
      count: cat.count,
      percentage: total > 0 ? ((cat.total / total) * 100).toFixed(2) : 0
    }));

    res.json(categoriesWithPercentage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/accounts', async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    const accountStats = await Promise.all(accounts.map(async (account) => {
      const transactionCount = await Transaction.countDocuments({ user: req.user._id, account: account._id });
      return { _id: account._id, name: account.name, type: account.type, balance: account.balance, color: account.color, transactionCount };
    }));
    res.json(accountStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
