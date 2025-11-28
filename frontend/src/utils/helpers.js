export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getTransactionColor = (type) => {
  switch (type) {
    case 'income':
      return 'text-green-600 bg-green-50';
    case 'expense':
      return 'text-red-600 bg-red-50';
    case 'transfer':
      return 'text-blue-600 bg-blue-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const getCategoryColor = (category) => {
  const colors = {
    food: 'bg-orange-500',
    transport: 'bg-blue-500',
    entertainment: 'bg-purple-500',
    utilities: 'bg-yellow-500',
    healthcare: 'bg-red-500',
    shopping: 'bg-pink-500',
    education: 'bg-indigo-500',
    salary: 'bg-green-500',
    business: 'bg-teal-500',
    other: 'bg-gray-500',
  };
  return colors[category.toLowerCase()] || colors.other;
};
