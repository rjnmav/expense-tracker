import { useState, useEffect } from 'react';
import { analyticsAPI, accountsAPI, transactionsAPI } from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, accountsRes, transactionsRes, incomeTrendsRes, expenseTrendsRes, categoriesRes] = await Promise.all([
        analyticsAPI.getSummary({ period }),
        accountsAPI.getAll(),
        transactionsAPI.getAll(),
        analyticsAPI.getTrends({ period, type: 'income' }),
        analyticsAPI.getTrends({ period, type: 'expense' }),
        analyticsAPI.getCategories({ period }),
      ]);

      const incomeTrends = incomeTrendsRes.data;
      const expenseTrends = expenseTrendsRes.data;

      // Merge trends by period
      const allPeriods = new Set([...incomeTrends.map(t => t.period), ...expenseTrends.map(t => t.period)]);
      const sortedPeriods = Array.from(allPeriods).sort();

      const mergedTrends = sortedPeriods.map(p => {
        const inc = incomeTrends.find(t => t.period === p);
        const exp = expenseTrends.find(t => t.period === p);
        return {
          period: p,
          income: inc ? inc.total : 0,
          expense: exp ? exp.total : 0
        };
      });

      setSummary({ ...summaryRes.data, trends: mergedTrends });
      setAccounts(accountsRes.data);
      setRecentTransactions(transactionsRes.data.slice(0, 5));
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryChartData = () => {
    if (!summary?.categoryBreakdown) return null;

    const categories = Object.keys(summary.categoryBreakdown);
    const amounts = Object.values(summary.categoryBreakdown);

    return {
      labels: categories,
      datasets: [
        {
          data: amounts,
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6',
            '#EC4899',
            '#14B8A6',
            '#F97316',
          ],
          borderWidth: 0,
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="mt-4 sm:mt-0">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(summary?.totalBalance || 0)}
              </p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg">
              <Wallet className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {formatCurrency(summary?.income || 0)}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {formatCurrency(summary?.expenses || 0)}
              </p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
              <ArrowDownRight className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Net Balance</p>
              <p className={`text-2xl font-bold mt-1 ${summary?.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(summary?.balance || 0)}
              </p>
            </div>
            <div className={`${summary?.balance >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'} p-3 rounded-lg`}>
              <DollarSign className={`h-6 w-6 ${summary?.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Trend */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income vs Expense Trend</h2>
          {summary?.trends ? (
            <div className="h-64">
              <Line
                data={{
                  labels: summary.trends.map(t => t.period),
                  datasets: [
                    {
                      label: 'Income',
                      data: summary.trends.map(t => t.income),
                      borderColor: '#10B981',
                      backgroundColor: '#10B981',
                      tension: 0.4,
                    },
                    {
                      label: 'Expense',
                      data: summary.trends.map(t => t.expense),
                      borderColor: '#EF4444',
                      backgroundColor: '#EF4444',
                      tension: 0.4,
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: {
                        color: document.documentElement.classList.contains('dark') ? '#fff' : '#374151'
                      }
                    }
                  },
                  scales: {
                    y: {
                      ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563',
                        callback: (value) => formatCurrency(value)
                      },
                      grid: {
                        color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
                      }
                    },
                    x: {
                      ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563'
                      },
                      grid: {
                        color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No trend data available
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expenses by Category</h2>
          {getCategoryChartData() ? (
            <div className="h-64 flex items-center justify-center">
              <Doughnut
                data={getCategoryChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: document.documentElement.classList.contains('dark') ? '#fff' : '#374151'
                      }
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No expense data available
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: transaction.account?.color + '20' }}
                    >
                      <span className="text-lg">
                        {transaction.type === 'income' ? '↑' : transaction.type === 'expense' ? '↓' : '→'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{transaction.category}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.account?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No recent transactions
              </div>
            )}
          </div>
        </div>

        {/* Top Spending Categories */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Spending Categories</h2>
          {categories.length > 0 ? (
            <div className="space-y-3">
              {categories.slice(0, 5).map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{category.category}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{category.count} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(category.total)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{category.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No category data available
            </div>
          )}
        </div>
      </div>

      {/* Accounts Overview */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Accounts Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((account) => (
            <div
              key={account._id}
              className="p-4 rounded-lg border-2 dark:bg-gray-800"
              style={{ borderColor: account.color }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{account.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{account.type}</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(account.balance)}
              </p>
            </div>
          ))}
          {accounts.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              No accounts found. Create one to get started!
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

export default Dashboard;
