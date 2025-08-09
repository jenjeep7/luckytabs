interface WinningTicket {
  totalPrizes: number;
  claimedTotal: number;
  prize: string | number;
}

interface BoxItem {
  id: string;
  boxName: string;
  boxNumber: string;
  pricePerTicket: string;
  startingTickets?: number;
  type: "wall" | "bar box";
  locationId: string;
  ownerId: string;
  isActive?: boolean;
  winningTickets?: WinningTicket[];
  estimatedRemainingTickets?: number;
  rowEstimates?: {
    row1: number;
    row2: number;
    row3: number;
    row4: number;
  };
  [key: string]: unknown;
}

export const calculateRemainingPrizes = (box: BoxItem): number => {
  if (!box.winningTickets || !Array.isArray(box.winningTickets)) {
    return 0;
  }

  return box.winningTickets.reduce((total: number, ticket: WinningTicket) => {
    const totalPrizes = Number(ticket.totalPrizes) || 0;
    const claimedTotal = Number(ticket.claimedTotal) || 0;
    const prize = Number(ticket.prize) || 0;
    const remaining = totalPrizes - claimedTotal;
    return total + (remaining * prize);
  }, 0);
};

export const calculateRemainingWinningTickets = (box: BoxItem): number => {
  if (!box.winningTickets || !Array.isArray(box.winningTickets)) {
    return 0;
  }

  return box.winningTickets.reduce((total: number, ticket: WinningTicket) => {
    const totalPrizes = Number(ticket.totalPrizes) || 0;
    const claimedTotal = Number(ticket.claimedTotal) || 0;
    return total + (totalPrizes - claimedTotal);
  }, 0);
};

export const calculateTotalRemainingPrizeValue = (box: BoxItem): number => {
  if (!box.winningTickets || !Array.isArray(box.winningTickets)) {
    return 0;
  }

  return box.winningTickets.reduce((total: number, ticket: WinningTicket) => {
    const totalPrizes = Number(ticket.totalPrizes) || 0;
    const claimedTotal = Number(ticket.claimedTotal) || 0;
    const prizeValue = Number(ticket.prize) || 0;
    const remainingTickets = totalPrizes - claimedTotal;
    return total + (remainingTickets * prizeValue);
  }, 0);
};

export const calculatePayoutPercentage = (remainingTicketsInput: { [boxId: string]: string }, boxId: string, box: BoxItem): string => {
  const inputValue = remainingTicketsInput[boxId];
  const remainingTickets = Number(inputValue);
  const pricePerTicket = Number(box.pricePerTicket) || 0;
  
  if (!inputValue || remainingTickets <= 0 || pricePerTicket <= 0) {
    return '0.00%';
  }

  // Total value of remaining winners (remaining prize value)
  const totalRemainingPrizeValue = calculateTotalRemainingPrizeValue(box);
  
  // Total value of remaining tickets (remaining tickets × price per ticket)
  const totalValueOfRemainingTickets = remainingTickets * pricePerTicket;
  
  if (totalValueOfRemainingTickets === 0) {
    return '0.00%';
  }

  const payoutPercentage = (totalRemainingPrizeValue / totalValueOfRemainingTickets) * 100;
  
  return `${payoutPercentage.toFixed(2)}%`;
};

export const getPayoutColor = (remainingTicketsInput: { [boxId: string]: string }, boxId: string, box: BoxItem): string => {
  const inputValue = remainingTicketsInput[boxId];
  const remainingTickets = Number(inputValue);
  const pricePerTicket = Number(box.pricePerTicket) || 0;
  
  if (!inputValue || remainingTickets <= 0 || pricePerTicket <= 0) {
    return 'text.primary';
  }

  const totalRemainingPrizeValue = calculateTotalRemainingPrizeValue(box);
  const totalValueOfRemainingTickets = remainingTickets * pricePerTicket;
  
  if (totalValueOfRemainingTickets === 0) {
    return 'text.primary';
  }

  const payoutPercentage = (totalRemainingPrizeValue / totalValueOfRemainingTickets) * 100;
  
  return payoutPercentage >= 100 ? 'success.main' : 'error.main';
};

export const calculateChancePercentage = (remainingTicketsInput: { [boxId: string]: string }, boxId: string, box: BoxItem): string => {
  const inputValue = remainingTicketsInput[boxId];
  const remainingTickets = Number(inputValue);
  
  if (!inputValue || remainingTickets <= 0) {
    return '0.00%';
  }

  const remainingWinningTickets = calculateRemainingWinningTickets(box);
  const chancePercentage = (remainingWinningTickets / remainingTickets) * 100;
  
  return `${chancePercentage.toFixed(2)}%`;
};

export const calculateOneInXChances = (remainingTicketsInput: { [boxId: string]: string }, boxId: string, box: BoxItem): string => {
  const inputValue = remainingTicketsInput[boxId];
  const remainingTickets = Number(inputValue);
  
  if (!inputValue || remainingTickets <= 0) {
    return '1 in ∞';
  }

  const remainingWinningTickets = calculateRemainingWinningTickets(box);
  
  if (remainingWinningTickets === 0) {
    return '1 in ∞';
  }

  const oneInX = remainingTickets / remainingWinningTickets;
  
  return `1 in ${oneInX.toFixed(1)}`;
};