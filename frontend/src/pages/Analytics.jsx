import { useState, useEffect } from 'react';
import { analyticsAPI } from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import { TrendingUp, DollarSign, PieChart, BarChart3 } from 'lucide-react';
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
  const [period, setPeriod] = useState('month');
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accountStats, setAccountStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [summaryRes, trendsRes, categoriesRes, accountsRes] = await Promise.all([
        analyticsAPI.getSummary({ period }),
        analyticsAPI.getTrends({ period, type: 'expense' }),
        analyticsAPI.getCategories({ period }),
        analyticsAPI.getAccounts(),
      ]);

      setSummary(summaryRes.data);
      setTrends(trendsRes.data);
      setCategories(categoriesRes.data);
      setAccountStats(accountsRes.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getTrendsChartData = () => {
    return {
      labels: trends.map((t) => t.period),
      datasets: [
        {
          label: 'Expenses',
          data: trends.map((t) => t.total),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true,
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
          backgroundColor: accountStats.map((a) => a.color),
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="input max-w-xs"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(summary?.income || 0)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {formatCurrency(summary?.expenses || 0)}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Balance</p>
              <p className={`text-2xl font-bold mt-1 ${summary?.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary?.balance || 0)}
              </p>
            </div>
            <div className={`${summary?.balance >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-lg`}>
              <BarChart3 className={`h-6 w-6 ${summary?.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary?.transactionCount || 0}
              </p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <PieChart className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Trends */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense Trends</h2>
          {trends.length > 0 ? (
            <div className="h-64">
              <Line
                data={getTrendsChartData()}
                options={{
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
                        callback: (value) => '$' + value,
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No trend data available
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h2>
          {categories.length > 0 ? (
            <div className="h-64">
              <Doughnut
                data={getCategoryChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No category data available
            </div>
          )}
        </div>

        {/* Account Balances */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Balances</h2>
          {accountStats.length > 0 ? (
            <div className="h-64">
              <Bar
                data={getAccountsChartData()}
                options={{
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
                        callback: (value) => '$' + value,
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No account data available
            </div>
          )}
        </div>

        {/* Top Categories */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Spending Categories</h2>
          {categories.length > 0 ? (
            <div className="space-y-3">
              {categories.slice(0, 5).map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{category.category}</p>
                      <p className="text-sm text-gray-500">{category.count} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(category.total)}</p>
                    <p className="text-sm text-gray-500">{category.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No category data available
            </div>
          )}
        </div>
      </div>

      {/* Account Statistics */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Account</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Balance</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {accountStats.map((account) => (
                <tr key={account._id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: account.color }}
                      />
                      <span className="font-medium text-gray-900">{account.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                    {account.type.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {formatCurrency(account.balance)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
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
