import { useState, useEffect } from 'react';
import { transactionsAPI } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { X, ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const AccountDetailsModal = ({ account, onClose }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const [stats, setStats] = useState({
        income: 0,
        expense: 0,
        transferIn: 0,
        transferOut: 0
    });
    const [chartData, setChartData] = useState({
        trends: null,
        categories: null
    });

    useEffect(() => {
        fetchTransactions();
    }, [account._id]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await transactionsAPI.getAll();
            const allTransactions = response.data;

            const accountTransactions = allTransactions.filter(t =>
                t.account?._id === account._id || t.toAccount?._id === account._id
            );

            setTransactions(accountTransactions);
            calculateStats(accountTransactions);
            prepareChartData(accountTransactions);
        } catch (error) {
            console.error('Failed to load transactions', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (txs) => {
        const newStats = txs.reduce((acc, t) => {
            const amount = parseFloat(t.amount);

            if (t.type === 'income' && t.account?._id === account._id) {
                acc.income += amount;
            } else if (t.type === 'expense' && t.account?._id === account._id) {
                acc.expense += amount;
            } else if (t.type === 'transfer') {
                if (t.account?._id === account._id) {
                    acc.transferOut += amount;
                } else if (t.toAccount?._id === account._id) {
                    acc.transferIn += amount;
                }
            }
            return acc;
        }, { income: 0, expense: 0, transferIn: 0, transferOut: 0 });

        setStats(newStats);
    };

    const prepareChartData = (txs) => {
        // Prepare Trends Data (Last 6 months)
        const months = {};
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = d.toLocaleString('default', { month: 'short' });
            months[key] = { income: 0, expense: 0 };
        }

        // Prepare Category Data
        const categories = {};

        txs.forEach(t => {
            const date = new Date(t.date);
            const monthKey = date.toLocaleString('default', { month: 'short' });
            const amount = parseFloat(t.amount);

            // Trends
            if (months[monthKey]) {
                if (t.type === 'income' && t.account?._id === account._id) {
                    months[monthKey].income += amount;
                } else if (t.type === 'expense' && t.account?._id === account._id) {
                    months[monthKey].expense += amount;
                }
            }

            // Categories (Expenses only)
            if (t.type === 'expense' && t.account?._id === account._id) {
                categories[t.category] = (categories[t.category] || 0) + amount;
            }
        });

        setChartData({
            trends: {
                labels: Object.keys(months),
                datasets: [
                    {
                        label: 'Income',
                        data: Object.values(months).map(m => m.income),
                        borderColor: '#10B981',
                        backgroundColor: '#10B981',
                        tension: 0.4,
                    },
                    {
                        label: 'Expense',
                        data: Object.values(months).map(m => m.expense),
                        borderColor: '#EF4444',
                        backgroundColor: '#EF4444',
                        tension: 0.4,
                    }
                ]
            },
            categories: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: [
                        '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
                    ],
                    borderWidth: 0
                }]
            }
        });
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: theme === 'dark' ? '#fff' : '#374151'
                }
            }
        },
        scales: {
            y: {
                ticks: {
                    color: theme === 'dark' ? '#9ca3af' : '#4b5563',
                    callback: (value) => formatCurrency(value)
                },
                grid: {
                    color: theme === 'dark' ? '#374151' : '#e5e7eb'
                }
            },
            x: {
                ticks: {
                    color: theme === 'dark' ? '#9ca3af' : '#4b5563'
                },
                grid: {
                    color: theme === 'dark' ? '#374151' : '#e5e7eb',
                    display: false
                }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: theme === 'dark' ? '#fff' : '#374151'
                }
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: account.color }}
                            />
                            {account.name}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Current Balance: <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(account.balance, account.currency)}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white dark:bg-gray-800">
                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase">Total Income</p>
                            <p className="text-lg font-bold text-green-700 dark:text-green-300 mt-1">{formatCurrency(stats.income)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium uppercase">Total Expense</p>
                            <p className="text-lg font-bold text-red-700 dark:text-red-300 mt-1">{formatCurrency(stats.expense)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">Transfers In</p>
                            <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-1">{formatCurrency(stats.transferIn)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium uppercase">Transfers Out</p>
                            <p className="text-lg font-bold text-orange-700 dark:text-orange-300 mt-1">{formatCurrency(stats.transferOut)}</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    {!loading && chartData.trends && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 mb-6">
                            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Income vs Expense</h3>
                                <div className="h-64">
                                    <Line data={chartData.trends} options={chartOptions} />
                                </div>
                            </div>
                            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Expense Distribution</h3>
                                <div className="h-64 flex items-center justify-center">
                                    {chartData.categories.datasets[0].data.length > 0 ? (
                                        <Doughnut data={chartData.categories} options={doughnutOptions} />
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">No expense data available</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Transactions List */}
                    <div className="px-6 pb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Recent Transactions
                        </h3>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                        ) : transactions.length > 0 ? (
                            <div className="space-y-3">
                                {transactions.map((t) => (
                                    <div key={t._id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                                    t.type === 'expense' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                {t.type === 'income' ? <ArrowDownLeft className="h-4 w-4" /> :
                                                    t.type === 'expense' ? <ArrowUpRight className="h-4 w-4" /> :
                                                        <ArrowRightLeft className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{t.category}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(t.date)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-semibold ${(t.type === 'income' || (t.type === 'transfer' && t.toAccount?._id === account._id))
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                {(t.type === 'income' || (t.type === 'transfer' && t.toAccount?._id === account._id)) ? '+' : '-'}
                                                {formatCurrency(t.amount)}
                                            </p>
                                            {t.description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{t.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No transactions found for this account
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountDetailsModal;
