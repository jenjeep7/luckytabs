import { BoxItem } from '../../services/boxService';

interface WinningTicket {
  totalPrizes: number;
  claimedTotal: number;
  prize: string | number;
}

export interface Prize {
  value: number;
  remaining: number;
}

// Advanced Metrics Types
export interface AdvancedMetrics {
  evPerTicket: number;
  rtpRemaining: number;
  costToClear: number;
  netIfCleared: number;
  topPrizeOdds: {
    next1: number;
    next5: number;
    next10: number;
  };
  profitTicketOdds: {
    next1: number;
    next5: number;
    next10: number;
  };
  payoutConcentration: number;
  riskPerTicket: number;
  sensitivity: {
    evLow: number;
    evHigh: number;
    isEstimateSensitive: boolean;
  };
  // NEW METRICS FROM FEEDBACK
  evPerDollar: number;
  probabilityOfProfit: {
    budget20: number;
    budget50: number;
    budget100: number;
  };
  valueRiskRatio: number;
  bigHitOdds: {
    over50: { budget20: number; budget50: number; budget100: number };
    top2Prizes: { budget20: number; budget50: number; budget100: number };
  };
  // ADDITIONAL REQUESTED METRICS
  liveHitRate: number;
  expectedTicketsToFirstWin: number;
  anyWinOdds: {
    next1: number;
    next5: number;
    next10: number;
    next20: number;
  };
  prizeSurplusRatio: number;
}

// EV Calculation Functions
export function evPerTicket(p: number, R: number, prizes: Prize[]): number {
  const Prem = prizes.reduce((s, t) => s + t.value * t.remaining, 0);
  return (Prem / R) - p; // dollars per ticket
}

export function rtpRemaining(p: number, R: number, prizes: Prize[]): number {
  const Prem = prizes.reduce((s, t) => s + t.value * t.remaining, 0);
  return (Prem / (p * R)) * 100; // percentage
}

// Existing functions
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

// NEW ADVANCED METRICS FUNCTIONS

// Hypergeometric probability: P(at least 1 win in N draws)
const hypergeometricProbability = (totalTickets: number, winnersRemaining: number, draws: number): number => {
  if (totalTickets <= 0 || winnersRemaining <= 0 || draws <= 0) return 0;
  if (winnersRemaining >= totalTickets) return 1;
  if (draws >= totalTickets) return winnersRemaining > 0 ? 1 : 0;
  
  // P(at least 1) = 1 - P(0 wins) = 1 - C(R-K, N) / C(R, N)
  // For computational stability, we'll use a different approach
  let probability = 0;
  for (let wins = 1; wins <= Math.min(draws, winnersRemaining); wins++) {
    probability += combination(winnersRemaining, wins) * combination(totalTickets - winnersRemaining, draws - wins) / combination(totalTickets, draws);
  }
  return Math.min(1, probability);
};

/** Safe product for hypergeometric without huge combinations:
 *  P(no win in k) = Π_{i=0..k-1} (N-K-i) / (N-i)
 */
export function probNoWinNextK(N: number, K: number, k: number): number {
  if (k <= 0 || K <= 0) return 1;
  if (k > N) k = N;
  let p = 1;
  for (let i = 0; i < k; i++) {
    p *= (N - K - i) / (N - i);
    if (p <= 0) return 0;
  }
  return Math.max(0, Math.min(1, p));
}

export function probAtLeastOneWinNextK(N: number, K: number, k: number): number {
  return 1 - probNoWinNextK(N, K, k);
}

export function liveHitRate(N: number, K: number): number {
  if (N <= 0) return 0;
  return K / N;
}

export function expectedTicketsToFirstWin(N: number, K: number): number {
  if (K <= 0) return Infinity; // no winners left
  return (N + 1) / (K + 1);
}

export function liveRTP(
  tiers: Array<{value: number, remaining: number}>,
  N: number,
  ticketPrice: number
): number {
  if (N <= 0 || ticketPrice <= 0) return 0;
  const remainingValue = tiers.reduce((s, t) => s + t.value * t.remaining, 0);
  return remainingValue / (N * ticketPrice); // e.g., 1.08 = 108%
}

/** Big-win versions (prize >= minPrize) */
export function remainingCountAtLeast(
  tiers: Array<{value: number, remaining: number}>,
  minPrize: number
): number {
  return tiers.reduce((s, t) => s + (t.value >= minPrize ? t.remaining : 0), 0);
}

export function probAtLeastOneBigWinNextK(
  N: number,
  tiers: Array<{value: number, remaining: number}>,
  k: number,
  minPrize: number
): number {
  const Kbig = remainingCountAtLeast(tiers, minPrize);
  return probAtLeastOneWinNextK(N, Kbig, k);
}

/** Optional: Prize Surplus Ratio using counts (needs starting N0, K0) */
export function prizeSurplusRatio(N: number, K: number, N0: number, K0: number): number {
  if (N <= 0 || N0 <= 0 || K0 <= 0) return 0;
  return (K / N) / (K0 / N0);
}

// Combination function C(n, k) = n! / (k! * (n-k)!)
const combination = (n: number, k: number): number => {
  if (k > n || k < 0) return 0;
  if (k === 0 || k === n) return 1;
  
  // Use multiplicative approach to avoid large factorials
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return result;
};

// 1. EV per ticket
export const calculateEVPerTicket = (box: BoxItem, remainingTickets: number): number => {
  const pricePerTicket = Number(box.pricePerTicket) || 0;
  const totalRemainingPrizeValue = calculateTotalRemainingPrizeValue(box);
  
  if (remainingTickets <= 0) return -pricePerTicket;
  
  return (totalRemainingPrizeValue / remainingTickets) - pricePerTicket;
};

// 2. RTP remaining (Return to Player)
export const calculateRTPRemaining = (box: BoxItem, remainingTickets: number): number => {
  const pricePerTicket = Number(box.pricePerTicket) || 0;
  const totalRemainingPrizeValue = calculateTotalRemainingPrizeValue(box);
  
  if (remainingTickets <= 0 || pricePerTicket <= 0) return 0;
  
  return totalRemainingPrizeValue / (pricePerTicket * remainingTickets);
};

// 3. Cost to clear vs payout left
export const calculateCostToClear = (box: BoxItem, remainingTickets: number): { cost: number; payout: number; net: number } => {
  const pricePerTicket = Number(box.pricePerTicket) || 0;
  const totalRemainingPrizeValue = calculateTotalRemainingPrizeValue(box);
  const cost = pricePerTicket * remainingTickets;
  
  return {
    cost,
    payout: totalRemainingPrizeValue,
    net: totalRemainingPrizeValue - cost
  };
};

// 4. Top prize odds
export const calculateTopPrizeOdds = (box: BoxItem, remainingTickets: number): { next1: number; next5: number; next10: number } => {
  if (!box.winningTickets || remainingTickets <= 0) {
    return { next1: 0, next5: 0, next10: 0 };
  }

  // Get top tier prizes (highest value prizes)
  const sortedPrizes = box.winningTickets
    .map(ticket => ({
      value: Number(ticket.prize),
      remaining: Number(ticket.totalPrizes) - Number(ticket.claimedTotal)
    }))
    .filter(p => p.remaining > 0)
    .sort((a, b) => b.value - a.value);

  if (sortedPrizes.length === 0) {
    return { next1: 0, next5: 0, next10: 0 };
  }

  // Consider top 20% of prize values as "top prizes"
  const topTierCount = Math.max(1, Math.ceil(sortedPrizes.length * 0.2));
  const topPrizes = sortedPrizes.slice(0, topTierCount);
  const topPrizeTickets = topPrizes.reduce((sum, p) => sum + p.remaining, 0);

  return {
    next1: hypergeometricProbability(remainingTickets, topPrizeTickets, 1),
    next5: hypergeometricProbability(remainingTickets, topPrizeTickets, Math.min(5, remainingTickets)),
    next10: hypergeometricProbability(remainingTickets, topPrizeTickets, Math.min(10, remainingTickets))
  };
};

// 5. Profit ticket odds (tickets worth more than cost)
export const calculateProfitTicketOdds = (box: BoxItem, remainingTickets: number): { next1: number; next5: number; next10: number } => {
  if (!box.winningTickets || remainingTickets <= 0) {
    return { next1: 0, next5: 0, next10: 0 };
  }

  const pricePerTicket = Number(box.pricePerTicket) || 0;
  
  const profitTickets = box.winningTickets
    .filter(ticket => Number(ticket.prize) >= pricePerTicket)
    .reduce((sum, ticket) => sum + (Number(ticket.totalPrizes) - Number(ticket.claimedTotal)), 0);

  return {
    next1: hypergeometricProbability(remainingTickets, profitTickets, 1),
    next5: hypergeometricProbability(remainingTickets, profitTickets, Math.min(5, remainingTickets)),
    next10: hypergeometricProbability(remainingTickets, profitTickets, Math.min(10, remainingTickets))
  };
};

// 6. Payout concentration
export const calculatePayoutConcentration = (box: BoxItem): number => {
  if (!box.winningTickets) return 0;

  const totalRemainingPrizeValue = calculateTotalRemainingPrizeValue(box);
  if (totalRemainingPrizeValue === 0) return 0;

  // Get prize values with remaining counts
  const prizeData = box.winningTickets
    .map(ticket => ({
      value: Number(ticket.prize),
      remaining: Number(ticket.totalPrizes) - Number(ticket.claimedTotal),
      totalValue: (Number(ticket.totalPrizes) - Number(ticket.claimedTotal)) * Number(ticket.prize)
    }))
    .filter(p => p.remaining > 0)
    .sort((a, b) => b.value - a.value);

  if (prizeData.length === 0) return 0;

  // Top 20% of prize tiers by value
  const topTierCount = Math.max(1, Math.ceil(prizeData.length * 0.2));
  const topTierValue = prizeData.slice(0, topTierCount).reduce((sum, p) => sum + p.totalValue, 0);

  return topTierValue / totalRemainingPrizeValue;
};

// 7. Risk per ticket (standard deviation)
export const calculateRiskPerTicket = (box: BoxItem, remainingTickets: number): number => {
  if (!box.winningTickets || remainingTickets <= 0) return 0;

  const totalRemainingPrizeValue = calculateTotalRemainingPrizeValue(box);
  const expectedValue = totalRemainingPrizeValue / remainingTickets;

  // Calculate E[X^2]
  let expectedSquared = 0;
  box.winningTickets.forEach(ticket => {
    const prizeValue = Number(ticket.prize);
    const remaining = Number(ticket.totalPrizes) - Number(ticket.claimedTotal);
    expectedSquared += (prizeValue * prizeValue * remaining) / remainingTickets;
  });

  const variance = expectedSquared - (expectedValue * expectedValue);
  return Math.sqrt(Math.max(0, variance));
};

// 8. Sensitivity analysis
export const calculateSensitivity = (box: BoxItem, remainingTickets: number): { evLow: number; evHigh: number; isEstimateSensitive: boolean } => {
  const lowEstimate = remainingTickets * 0.9;
  const highEstimate = remainingTickets * 1.1;
  
  const evLow = calculateEVPerTicket(box, lowEstimate);
  const evHigh = calculateEVPerTicket(box, highEstimate);
  
  // Sensitive if EV flips sign across the range
  const isEstimateSensitive = (evLow < 0 && evHigh > 0) || (evLow > 0 && evHigh < 0);
  
  return { evLow, evHigh, isEstimateSensitive };
};

// NEW METRICS FROM FEEDBACK

// 9. EV per Dollar (multiple)
export const calculateEVPerDollar = (box: BoxItem, remainingTickets: number): number => {
  const pricePerTicket = Number(box.pricePerTicket) || 0;
  const totalRemainingPrizeValue = calculateTotalRemainingPrizeValue(box);
  
  if (remainingTickets <= 0 || pricePerTicket <= 0) return 0;
  
  return totalRemainingPrizeValue / (remainingTickets * pricePerTicket);
};

// 10. Error function approximation for normal distribution
const erf = (x: number): number => {
  // Abramowitz and Stegun approximation
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
};

// 11. Probability of Profit using normal approximation
export const calculateProbabilityOfProfit = (box: BoxItem, remainingTickets: number): { budget20: number; budget50: number; budget100: number } => {
  const pricePerTicket = Number(box.pricePerTicket) || 0;
  const evPerTicket = calculateEVPerTicket(box, remainingTickets);
  const riskPerTicket = calculateRiskPerTicket(box, remainingTickets);
  
  if (pricePerTicket <= 0 || remainingTickets <= 0) {
    return { budget20: 0, budget50: 0, budget100: 0 };
  }

  const calculateProbForBudget = (budget: number): number => {
    const k = Math.floor(budget / pricePerTicket);
    if (k <= 0) return 0;
    
    const mu = k * evPerTicket;
    
    // Finite population correction for variance
    const varPerTicket = riskPerTicket * riskPerTicket;
    const fpc = Math.max(0, 1 - (k - 1) / Math.max(1, remainingTickets - 1));
    const sd = Math.sqrt(k * varPerTicket * fpc);
    
    if (sd === 0) return mu > 0 ? 1 : 0;
    
    const z = mu / sd;
    return 0.5 * (1 + erf(z / Math.sqrt(2)));
  };

  return {
    budget20: calculateProbForBudget(20),
    budget50: calculateProbForBudget(50),
    budget100: calculateProbForBudget(100)
  };
};

// 12. Value/Risk Ratio (Sharpe-like ratio)
export const calculateValueRiskRatio = (box: BoxItem, remainingTickets: number): number => {
  const evPerTicket = calculateEVPerTicket(box, remainingTickets);
  const risk = calculateRiskPerTicket(box, remainingTickets);
  
  if (risk === 0) return evPerTicket > 0 ? 100 : 0; // Arbitrarily high for zero risk positive EV
  
  return evPerTicket / risk;
};

// 13. Big Hit Odds (probability of hitting prizes >= threshold)
export const calculateBigHitOdds = (box: BoxItem, remainingTickets: number): { 
  over50: { budget20: number; budget50: number; budget100: number }; 
  top2Prizes: { budget20: number; budget50: number; budget100: number }; 
} => {
  if (!box.winningTickets || remainingTickets <= 0) {
    return {
      over50: { budget20: 0, budget50: 0, budget100: 0 },
      top2Prizes: { budget20: 0, budget50: 0, budget100: 0 }
    };
  }

  const pricePerTicket = Number(box.pricePerTicket) || 0;
  
  const calculateBigHitForThreshold = (threshold: number) => {
    const bigTickets = (box.winningTickets || [])
      .filter(ticket => Number(ticket.prize) >= threshold)
      .reduce((sum, ticket) => sum + (Number(ticket.totalPrizes) - Number(ticket.claimedTotal)), 0);

    const calculateForBudget = (budget: number): number => {
      const k = Math.floor(budget / pricePerTicket);
      return hypergeometricProbability(remainingTickets, bigTickets, k);
    };

    return {
      budget20: calculateForBudget(20),
      budget50: calculateForBudget(50),
      budget100: calculateForBudget(100)
    };
  };

  const calculateTop2PrizeOdds = () => {
    // Get all unique prize values and sort them in descending order
    const prizeValues = (box.winningTickets || [])
      .map(ticket => Number(ticket.prize))
      .filter(prize => prize > 0);
    
    const uniquePrizeValues = Array.from(new Set(prizeValues))
      .sort((a, b) => b - a);
    
    // Get the top 2 prize values (or fewer if less than 2 exist)
    const top2Values = uniquePrizeValues.slice(0, 2);
    
    if (top2Values.length === 0) {
      return { budget20: 0, budget50: 0, budget100: 0 };
    }
    
    // Count tickets for top 2 prize values
    const top2Tickets = (box.winningTickets || [])
      .filter(ticket => top2Values.includes(Number(ticket.prize)))
      .reduce((sum, ticket) => sum + (Number(ticket.totalPrizes) - Number(ticket.claimedTotal)), 0);

    const calculateForBudget = (budget: number): number => {
      const k = Math.floor(budget / pricePerTicket);
      return hypergeometricProbability(remainingTickets, top2Tickets, k);
    };

    return {
      budget20: calculateForBudget(20),
      budget50: calculateForBudget(50),
      budget100: calculateForBudget(100)
    };
  };

  return {
    over50: calculateBigHitForThreshold(50),
    top2Prizes: calculateTop2PrizeOdds()
  };
};

// 14. Live Hit Rate (chance next ticket wins anything)
export const calculateLiveHitRate = (box: BoxItem, remainingTickets: number): number => {
  if (!box.winningTickets || remainingTickets <= 0) return 0;
  
  const remainingWinningTickets = calculateRemainingWinningTickets(box);
  return liveHitRate(remainingTickets, remainingWinningTickets);
};

// 15. Expected Tickets to First Win
export const calculateExpectedTicketsToFirstWin = (box: BoxItem, remainingTickets: number): number => {
  if (!box.winningTickets || remainingTickets <= 0) return Infinity;
  
  const remainingWinningTickets = calculateRemainingWinningTickets(box);
  return expectedTicketsToFirstWin(remainingTickets, remainingWinningTickets);
};

// 16. Any Win Odds (chance of hitting any prize in next k pulls)
export const calculateAnyWinOdds = (box: BoxItem, remainingTickets: number): { 
  next1: number; 
  next5: number; 
  next10: number; 
  next20: number; 
} => {
  if (!box.winningTickets || remainingTickets <= 0) {
    return { next1: 0, next5: 0, next10: 0, next20: 0 };
  }

  const remainingWinningTickets = calculateRemainingWinningTickets(box);

  return {
    next1: probAtLeastOneWinNextK(remainingTickets, remainingWinningTickets, 1),
    next5: probAtLeastOneWinNextK(remainingTickets, remainingWinningTickets, Math.min(5, remainingTickets)),
    next10: probAtLeastOneWinNextK(remainingTickets, remainingWinningTickets, Math.min(10, remainingTickets)),
    next20: probAtLeastOneWinNextK(remainingTickets, remainingWinningTickets, Math.min(20, remainingTickets))
  };
};

// 17. Prize Surplus Ratio (requires original box stats - simplified version)
export const calculatePrizeSurplusRatio = (box: BoxItem, remainingTickets: number): number => {
  if (!box.winningTickets || remainingTickets <= 0) return 0;
  
  // Calculate current values
  const remainingWinningTickets = calculateRemainingWinningTickets(box);
  
  // Estimate original ratio (this would ideally be stored with the box)
  // For now, assume original box had similar win rate - this could be enhanced
  // by storing original stats when box is created
  const totalOriginalTickets = (box.winningTickets || [])
    .reduce((sum, ticket) => sum + Number(ticket.totalPrizes), 0);
  
  const originalWinningTickets = totalOriginalTickets;
  
  // Estimate original total tickets (could be enhanced with actual data)
  // Using a rough estimate based on common pull-tab ratios
  const estimatedOriginalTotal = Math.max(totalOriginalTickets * 5, remainingTickets + totalOriginalTickets);
  const originalRatio = originalWinningTickets / estimatedOriginalTotal;
  
  if (originalRatio <= 0) return 1;
  
  return prizeSurplusRatio(remainingTickets, remainingWinningTickets, estimatedOriginalTotal, originalWinningTickets);
};

// Main function to calculate all advanced metrics
export const calculateAdvancedMetrics = (box: BoxItem, remainingTickets: number): AdvancedMetrics => {
  const evPerTicket = calculateEVPerTicket(box, remainingTickets);
  const rtpRemaining = calculateRTPRemaining(box, remainingTickets);
  const clearMetrics = calculateCostToClear(box, remainingTickets);
  const topPrizeOdds = calculateTopPrizeOdds(box, remainingTickets);
  const profitTicketOdds = calculateProfitTicketOdds(box, remainingTickets);
  const payoutConcentration = calculatePayoutConcentration(box);
  const riskPerTicket = calculateRiskPerTicket(box, remainingTickets);
  const sensitivity = calculateSensitivity(box, remainingTickets);
  
  // NEW METRICS
  const evPerDollar = calculateEVPerDollar(box, remainingTickets);
  const probabilityOfProfit = calculateProbabilityOfProfit(box, remainingTickets);
  const valueRiskRatio = calculateValueRiskRatio(box, remainingTickets);
  const bigHitOdds = calculateBigHitOdds(box, remainingTickets);

  // ADDITIONAL REQUESTED METRICS
  const liveHitRate = calculateLiveHitRate(box, remainingTickets);
  const expectedTicketsToFirstWin = calculateExpectedTicketsToFirstWin(box, remainingTickets);
  const anyWinOdds = calculateAnyWinOdds(box, remainingTickets);
  const prizeSurplusRatio = calculatePrizeSurplusRatio(box, remainingTickets);

  return {
    evPerTicket,
    rtpRemaining,
    costToClear: clearMetrics.cost,
    netIfCleared: clearMetrics.net,
    topPrizeOdds,
    profitTicketOdds,
    payoutConcentration,
    riskPerTicket,
    sensitivity,
    evPerDollar,
    probabilityOfProfit,
    valueRiskRatio,
    bigHitOdds,
    liveHitRate,
    expectedTicketsToFirstWin,
    anyWinOdds,
    prizeSurplusRatio
  };
};
