export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface Stock {
  id: string;
  name: string; // e.g. Reliance Ind.
  company: string; // Reliance Industries Ltd
  sector: string; // Energy / Petrochemicals, IT, Banking, FMCG, Pharma, Auto
  purchaseDate: string; // YYYY-MM-DD for input or DD-MM-YYYY
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  riskLevel: RiskLevel;
  memberName: string; // Member who holds/entered this investment
  notes?: string;
  isDemo?: boolean;
}

export interface MutualFund {
  id: string;
  name: string; // e.g. SBI Bluechip Fund
  amc: string; // SBI Mutual Fund, HDFC Mutual Fund, ICICI Prudential MF
  category: string; // Equity (Large Cap), Equity (Mid Cap), Hybrid, Debt, Small Cap
  investmentType: 'SIP' | 'Lumpsum';
  purchaseDate: string; // YYYY-MM-DD
  amountInvested: number;
  purchaseNav: number;
  currentNav: number;
  riskLevel: RiskLevel;
  memberName: string; // Member who holds/entered this investment
  notes?: string;
  isDemo?: boolean;
}

export interface FixedDeposit {
  id: string;
  bankName: string; // e.g. State Bank of India, HDFC Bank, ICICI Bank, Post Office
  accountNumber?: string; // e.g. FD-928471
  depositDate: string; // YYYY-MM-DD
  maturityDate: string; // YYYY-MM-DD
  principalAmount: number; // ₹ Principal
  interestRate: number; // e.g. 7.25% p.a.
  compoundingFrequency: 'Quarterly' | 'Annually' | 'Monthly' | 'Simple';
  tenureMonths: number; // e.g. 12, 24, 36
  currentValue: number; // Current valuation / accrued amount
  riskLevel: RiskLevel; // Default 'Low'
  memberName: string; // Member who holds/entered this investment
  notes?: string;
  isDemo?: boolean;
}

export interface MonthlyRecord {
  id: string;
  month: string; // e.g. "Aug-25" or "2025-08"
  investmentAdded: number;
  portfolioValue: number;
  profitLoss: number;
  notes?: string;
  isDemo?: boolean;
}

export interface ScreenshotRecord {
  id: string;
  title: string;
  category: 'Stock Portfolio' | 'Mutual Fund Portfolio' | 'Broker Account' | 'Investment Statement' | 'Fixed Deposit Certificate';
  date: string;
  imageData: string; // Data URL or URL
  notes?: string;
  isDemo?: boolean;
}

export interface ReportSettings {
  studentName: string;
  teamMembers: string[]; // 4 team members
  academicYear: string;
  institution: string;
  projectTitle: string;
  investmentPeriod: string;
  investmentObjective: string;
  learningNotes: string[];
  observations: string[];
  goalStatement: string;
}

// Calculations for a Stock
export function getStockMetrics(stock: Stock) {
  const investedAmount = stock.quantity * stock.buyPrice;
  const currentValue = stock.quantity * stock.currentPrice;
  const profitLoss = currentValue - investedAmount;
  const returnPercentage = investedAmount > 0 ? (profitLoss / investedAmount) * 100 : 0;

  return {
    investedAmount,
    currentValue,
    profitLoss,
    returnPercentage,
  };
}

// Calculations for a Mutual Fund
export function getMutualFundMetrics(mf: MutualFund) {
  const units = mf.purchaseNav > 0 ? mf.amountInvested / mf.purchaseNav : 0;
  const currentValue = units * mf.currentNav;
  const profitLoss = currentValue - mf.amountInvested;
  const returnPercentage = mf.amountInvested > 0 ? (profitLoss / mf.amountInvested) * 100 : 0;

  return {
    units,
    investedAmount: mf.amountInvested,
    currentValue,
    profitLoss,
    returnPercentage,
  };
}

// Calculations for a Fixed Deposit (FD)
export function getFixedDepositMetrics(fd: FixedDeposit) {
  const investedAmount = fd.principalAmount;
  const currentValue = fd.currentValue > 0 ? fd.currentValue : fd.principalAmount;
  const profitLoss = currentValue - investedAmount;
  const returnPercentage = investedAmount > 0 ? (profitLoss / investedAmount) * 100 : 0;
  
  // Calculate maturity value using quarterly compounding if not explicitly specified
  const r = fd.interestRate / 100;
  const t = fd.tenureMonths / 12;
  const estimatedMaturityAmount = Math.round(investedAmount * Math.pow(1 + r / 4, 4 * t));

  return {
    investedAmount,
    principalAmount: investedAmount,
    currentValue,
    profitLoss,
    interestEarned: profitLoss,
    returnPercentage,
    estimatedMaturityAmount,
  };
}

// Overall Portfolio Summary
export interface PortfolioSummary {
  stockInvested: number;
  stockCurrentValue: number;
  stockProfitLoss: number;
  stockReturnPct: number;
  stockCount: number;

  mfInvested: number;
  mfCurrentValue: number;
  mfProfitLoss: number;
  mfReturnPct: number;
  mfCount: number;

  fdInvested: number;
  fdCurrentValue: number;
  fdProfitLoss: number;
  fdReturnPct: number;
  fdCount: number;

  totalInvested: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  overallReturnPct: number;

  stockAllocationPct: number;
  mfAllocationPct: number;
  fdAllocationPct: number;
}

export function calculatePortfolioSummary(
  stocks: Stock[],
  mutualFunds: MutualFund[],
  fixedDeposits: FixedDeposit[] = []
): PortfolioSummary {
  let stockInvested = 0;
  let stockCurrentValue = 0;

  stocks.forEach((s) => {
    const m = getStockMetrics(s);
    stockInvested += m.investedAmount;
    stockCurrentValue += m.currentValue;
  });

  const stockProfitLoss = stockCurrentValue - stockInvested;
  const stockReturnPct = stockInvested > 0 ? (stockProfitLoss / stockInvested) * 100 : 0;

  let mfInvested = 0;
  let mfCurrentValue = 0;

  mutualFunds.forEach((mf) => {
    const m = getMutualFundMetrics(mf);
    mfInvested += m.investedAmount;
    mfCurrentValue += m.currentValue;
  });

  const mfProfitLoss = mfCurrentValue - mfInvested;
  const mfReturnPct = mfInvested > 0 ? (mfProfitLoss / mfInvested) * 100 : 0;

  let fdInvested = 0;
  let fdCurrentValue = 0;

  fixedDeposits.forEach((fd) => {
    const m = getFixedDepositMetrics(fd);
    fdInvested += m.investedAmount;
    fdCurrentValue += m.currentValue;
  });

  const fdProfitLoss = fdCurrentValue - fdInvested;
  const fdReturnPct = fdInvested > 0 ? (fdProfitLoss / fdInvested) * 100 : 0;

  const totalInvested = stockInvested + mfInvested + fdInvested;
  const totalCurrentValue = stockCurrentValue + mfCurrentValue + fdCurrentValue;
  const totalProfitLoss = totalCurrentValue - totalInvested;
  const overallReturnPct = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  const stockAllocationPct = totalCurrentValue > 0 ? (stockCurrentValue / totalCurrentValue) * 100 : 0;
  const mfAllocationPct = totalCurrentValue > 0 ? (mfCurrentValue / totalCurrentValue) * 100 : 0;
  const fdAllocationPct = totalCurrentValue > 0 ? (fdCurrentValue / totalCurrentValue) * 100 : 0;

  return {
    stockInvested,
    stockCurrentValue,
    stockProfitLoss,
    stockReturnPct,
    stockCount: stocks.length,

    mfInvested,
    mfCurrentValue,
    mfProfitLoss,
    mfReturnPct,
    mfCount: mutualFunds.length,

    fdInvested,
    fdCurrentValue,
    fdProfitLoss,
    fdReturnPct,
    fdCount: fixedDeposits.length,

    totalInvested,
    totalCurrentValue,
    totalProfitLoss,
    overallReturnPct,

    stockAllocationPct,
    mfAllocationPct,
    fdAllocationPct,
  };
}

// Indian Rupee Currency Formatter
export function formatINR(val: number, options?: { hideSymbol?: boolean; decimals?: number; showSign?: boolean }): string {
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const decimals = options?.decimals ?? (absVal % 1 === 0 ? 0 : 2);

  // Format to standard Indian comma grouping (en-IN)
  const formattedNumber = absVal.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const sign = options?.showSign ? (isNegative ? '- ' : '+ ') : (isNegative ? '- ' : '');
  const symbol = options?.hideSymbol ? '' : '₹';

  return `${sign}${symbol}${formattedNumber}`;
}

// Percent Formatter
export function formatPercent(val: number, showSign: boolean = true): string {
  const isPositive = val > 0;
  const isNegative = val < 0;
  const sign = showSign ? (isPositive ? '+' : isNegative ? '-' : '') : (isNegative ? '-' : '');
  return `${sign}${Math.abs(val).toFixed(2)}%`;
}

// Format date to Indian format DD-MM-YYYY
export function formatIndianDate(dateString: string): string {
  if (!dateString) return '-';
  // If already in DD-MM-YYYY or DD-Mon-YY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString) || /^\d{2}-[A-Za-z]{3}-\d{2,4}$/.test(dateString)) {
    return dateString;
  }
  try {
    const parts = dateString.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      // YYYY-MM-DD
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    }
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }
  } catch {
    // fallback
  }
  return dateString;
}

// Format date to readable e.g. 15-Aug-2025
export function formatReadableIndianDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    let d: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [y, m, day] = dateString.split('-').map(Number);
      d = new Date(y, m - 1, day);
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      const [day, m, y] = dateString.split('-').map(Number);
      d = new Date(y, m - 1, day);
    } else {
      d = new Date(dateString);
    }
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
    }
  } catch {
    // fallback
  }
  return dateString;
}
