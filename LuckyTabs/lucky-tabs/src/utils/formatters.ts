  // Helper function to format currency with commas
  export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Helper function to format currency without decimals for whole dollar amounts
  export const formatCurrencyClean = (amount: number): string => {
    const isWholeNumber = amount % 1 === 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: isWholeNumber ? 0 : 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  export const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
    });
  };

  export const formatDateRange = (startDate: Date, endDate: Date) => {
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    const currentYear = new Date().getFullYear();
    
    // If both dates are in the current year, omit the year
    if (startYear === currentYear && endYear === currentYear) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    
    // If different years, show the year for the end date
    return `${formatDate(startDate)} - ${formatDate(endDate)}/${endYear.toString().slice(2)}`;
  };
