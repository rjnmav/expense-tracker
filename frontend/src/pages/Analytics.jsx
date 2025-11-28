import { useState, useEffect } from 'react';
import { analyticsAPI } from '../utils/api';
import { formatCurrency, getDateRange } from '../utils/helpers';
import { COLORS } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';
import { TrendingUp, DollarSign, PieChart, BarChart3, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [period, setPeriod] = useState('month'); // Keep this for grouping logic if needed, or derive it
  const [selectedAccount, setSelectedAccount] = useState('');
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accountStats, setAccountStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [dateFilter, customStartDate, customEndDate, selectedAccount]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      let startDate, endDate;
      let groupingPeriod = 'day'; // Default grouping for short ranges

      if (dateFilter === 'custom') {
        if (!customStartDate || !customEndDate) {
          setLoading(false);
          return; // Wait for both dates
        }
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);
      } else {
        const range = getDateRange(dateFilter);
        if (range) {
          startDate = range.start;
          endDate = range.end;
        }
      }

      // Determine grouping period based on range duration
      if (startDate && endDate) {
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 35) {
          groupingPeriod = 'day';
        } else if (diffDays <= 365) {
          groupingPeriod = 'month';
        } else {
          groupingPeriod = 'year';
        }
      }

      const params = {
        period: groupingPeriod,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined
      };

      if (selectedAccount) params.account = selectedAccount;

      const [summaryRes, trendsRes, incomeTrendsRes, categoriesRes, accountsRes] = await Promise.all([
        analyticsAPI.getSummary(params),
        analyticsAPI.getTrends({ ...params, type: 'expense' }),
        analyticsAPI.getTrends({ ...params, type: 'income' }),
        analyticsAPI.getCategories(params),
        analyticsAPI.getAccounts(),
      ]);

      // Merge income and expense for net balance
      const expenseTrends = trendsRes.data;
      const incomeTrends = incomeTrendsRes.data;

      const allPeriods = new Set([...expenseTrends.map(t => t.period), ...incomeTrends.map(t => t.period)]);
      const sortedPeriods = Array.from(allPeriods).sort();

      const combinedTrends = sortedPeriods.map(p => {
        const inc = incomeTrends.find(t => t.period === p);
        const exp = expenseTrends.find(t => t.period === p);
        return {
          period: p,
          income: inc ? inc.total : 0,
          expense: exp ? exp.total : 0,
          net: (inc ? inc.total : 0) - (exp ? exp.total : 0),
          // Keep original structure for expense stacked bar
          ...exp
        };
      });

      setSummary(summaryRes.data);
      setTrends(combinedTrends);
      setCategories(categoriesRes.data);
      setAccountStats(accountsRes.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getTrendsChartData = () => {
    // Get all unique account IDs across all periods
    const accountIds = new Set();
    trends.forEach(t => {
      if (t.accounts) {
        Object.keys(t.accounts).forEach(id => accountIds.add(id));
      }
    });

    const datasets = Array.from(accountIds).map(accId => {
      // Find account details from the first occurrence
      let accountInfo = { name: 'Unknown', color: '#ccc' };
      for (const t of trends) {
        if (t.accounts && t.accounts[accId]) {
          accountInfo = t.accounts[accId];
          break;
        }
      }

      return {
        label: accountInfo.name,
        data: trends.map(t => (t.accounts && t.accounts[accId]) ? t.accounts[accId].total : 0),
        backgroundColor: accountInfo.color,
        stack: 'Stack 0',
      };
    });

    return {
      labels: trends.map((t) => t.period),
      datasets: datasets.length > 0 ? datasets : [
        {
          label: 'Expenses',
          data: trends.map((t) => t.total),
          backgroundColor: '#EF4444',
          stack: 'Stack 0',
        },
      ],
    };
  };

  const getExpenseByAccountChartData = () => {
    const accountTotals = {};

    trends.forEach(t => {
      if (t.accounts) {
        Object.values(t.accounts).forEach(acc => {
          if (!accountTotals[acc.name]) {
            accountTotals[acc.name] = { total: 0 };
          }
          accountTotals[acc.name].total += acc.total;
        });
      }
    });

    const labels = Object.keys(accountTotals);
    return {
      labels,
      datasets: [
        {
          data: Object.values(accountTotals).map(a => a.total),
          backgroundColor: labels.map((_, index) => COLORS[index % COLORS.length]),
          borderWidth: 0,
        },
      ],
    };
  };

  const getCategoryChartData = () => {
    return {
      labels: categories.map((c) => c.category),
      datasets: [
        {
          data: categories.map((c) => c.total),
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

  const getAccountsChartData = () => {
    return {
      labels: accountStats.map((a) => a.name),
      datasets: [
        {
          label: 'Balance',
          data: accountStats.map((a) => a.balance),
          backgroundColor: accountStats.map((_, index) => COLORS[index % COLORS.length]),
          borderWidth: 0,
        },
      ],
    };
  };

  const { theme } = useTheme();

  const getChartOptions = (isCurrency = true) => {
    const textColor = theme === 'dark' ? '#9ca3af' : '#4b5563';
    const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => isCurrency ? formatCurrency(value) : value,
            color: textColor,
          },
          grid: {
            color: gridColor,
          }
        },
        x: {
          ticks: {
            color: textColor,
          },
          grid: {
            color: gridColor,
            display: false
          }
        }
      },
    };
  };

  const getDoughnutOptions = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: theme === 'dark' ? '#fff' : '#374151'
          }
        },
      },
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="input min-w-[200px] pr-10"
          >
            <option value="">All Accounts</option>
            {accountStats.map(account => (
              <option key={account._id} value={account._id}>{account.name}</option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input min-w-[150px] pr-10"
          >
            <option value="all">All Time</option>
            <option value="this_week">This Week</option>
            <option value="last_week">Last Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {dateFilter === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
            <div className="relative">
              <DatePicker
                selected={customStartDate ? new Date(customStartDate) : null}
                onChange={(date) => setCustomStartDate(date ? date.toISOString().split('T')[0] : '')}
                className="input w-full pl-10"
                placeholderText="Select start date"
                dateFormat="MMM d, yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
            <div className="relative">
              <DatePicker
                selected={customEndDate ? new Date(customEndDate) : null}
                onChange={(date) => setCustomEndDate(date ? date.toISOString().split('T')[0] : '')}
                className="input w-full pl-10"
                placeholderText="Select end date"
                dateFormat="MMM d, yyyy"
                minDate={customStartDate ? new Date(customStartDate) : null}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {formatCurrency(summary?.income || 0)}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {formatCurrency(summary?.expenses || 0)}
              </p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Net Balance</p>
              <p className={`text-2xl font-bold mt-1 ${summary?.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(summary?.balance || 0)}
              </p>
            </div>
            <div className={`${summary?.balance >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'} p-3 rounded-lg`}>
              <BarChart3 className={`h-6 w-6 ${summary?.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {summary?.transactionCount || 0}
              </p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg">
              <PieChart className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Account */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expenses by Account</h2>
          {trends.length > 0 ? (
            <div className="h-64">
              <Doughnut
                data={getExpenseByAccountChartData()}
                options={getDoughnutOptions()}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No data available
            </div>
          )}
        </div>

        {/* Net Balance Trend */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Net Balance Trend</h2>
          {trends.length > 0 ? (
            <div className="h-64">
              <Line
                data={{
                  labels: trends.map(t => t.period),
                  datasets: [
                    {
                      label: 'Net Balance',
                      data: trends.map(t => t.net),
                      borderColor: '#3B82F6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4,
                      fill: true,
                    }
                  ]
                }}
                options={getChartOptions(true)}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No trend data available
            </div>
          )}
        </div>

        {/* Income vs Expense Trend */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income vs Expense Trend</h2>
          {trends.length > 0 ? (
            <div className="h-64">
              <Line
                data={{
                  labels: trends.map(t => t.period),
                  datasets: [
                    {
                      label: 'Income',
                      data: trends.map(t => t.income),
                      borderColor: '#10B981',
                      backgroundColor: '#10B981',
                      tension: 0.4,
                    },
                    {
                      label: 'Expense',
                      data: trends.map(t => t.expense),
                      borderColor: '#EF4444',
                      backgroundColor: '#EF4444',
                      tension: 0.4,
                    }
                  ]
                }}
                options={getChartOptions(true)}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No trend data available
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Distribution</h2>
          {categories.length > 0 ? (
            <div className="h-64">
              <Doughnut
                data={getCategoryChartData()}
                options={getDoughnutOptions()}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No category data available
            </div>
          )}
        </div>

        {/* Account Balances */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Balances</h2>
          {accountStats.length > 0 ? (
            <div className="h-64">
              <Bar
                data={getAccountsChartData()}
                options={getChartOptions(true)}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No account data available
            </div>
          )}
        </div>

        {/* Top Categories */}
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

      {/* Account Statistics */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Statistics</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Account</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Balance</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {accountStats.map((account) => (
                <tr key={account._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: account.color }}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">{account.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {account.type.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(account.balance)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                    {account.transactionCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
