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

export const getDateRange = (filterType) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start = null;
  let end = null;

  switch (filterType) {
    case 'this_week':
      start = new Date(today);
      start.setDate(today.getDate() - today.getDay()); // Sunday
      end = new Date(today);
      end.setDate(today.getDate() + (6 - today.getDay())); // Saturday
      break;
    case 'last_week':
      start = new Date(today);
      start.setDate(today.getDate() - today.getDay() - 7);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      break;
    case 'this_month':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case 'last_month':
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    case 'this_year':
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
      break;
    default:
      return null;
  }

  // Set end of day for end date
  if (end) {
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
};
