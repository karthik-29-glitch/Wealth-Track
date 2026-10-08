import {
  Stock,
  MutualFund,
  FixedDeposit,
  MonthlyRecord,
  getStockMetrics,
  getMutualFundMetrics,
  getFixedDepositMetrics,
  formatIndianDate,
} from '../types/portfolio';

function convertToCSV(headers: string[], rows: (string | number)[][]): string {
  const escapeCell = (cell: string | number) => {
    const stringVal = String(cell ?? '');
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const headerLine = headers.map(escapeCell).join(',');
  const rowLines = rows.map((row) => row.map(escapeCell).join(',')).join('\n');

  return `${headerLine}\n${rowLines}`;
}

function triggerDownload(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportStocksToCSV(stocks: Stock[]) {
  const headers = [
    'Investor / Member',
    'Stock Name',
    'Company',
    'Sector',
    'Purchase Date',
    'Quantity',
    'Buy Price (₹)',
    'Invested Amount (₹)',
    'Current Price (₹)',
    'Current Value (₹)',
    'Profit/Loss (₹)',
    'Return (%)',
    'Risk Level',
    'Notes',
  ];

  const rows = stocks.map((s) => {
    const m = getStockMetrics(s);
    return [
      s.memberName || 'General',
      s.name,
      s.company,
      s.sector,
      formatIndianDate(s.purchaseDate),
      s.quantity,
      s.buyPrice,
      m.investedAmount,
      s.currentPrice,
      m.currentValue,
      m.profitLoss.toFixed(2),
      m.returnPercentage.toFixed(2),
      s.riskLevel,
      s.notes || '',
    ];
  });

  const csv = convertToCSV(headers, rows);
  triggerDownload(csv, `Stock_Portfolio_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportMutualFundsToCSV(mutualFunds: MutualFund[]) {
  const headers = [
    'Investor / Member',
    'Fund Name',
    'AMC',
    'Category',
    'Investment Type',
    'Purchase Date',
    'Amount Invested (₹)',
    'Purchase NAV (₹)',
    'Units',
    'Current NAV (₹)',
    'Current Value (₹)',
    'Profit/Loss (₹)',
    'Return (%)',
    'Risk Level',
    'Notes',
  ];

  const rows = mutualFunds.map((mf) => {
    const m = getMutualFundMetrics(mf);
    return [
      mf.memberName || 'General',
      mf.name,
      mf.amc,
      mf.category,
      mf.investmentType,
      formatIndianDate(mf.purchaseDate),
      mf.amountInvested,
      mf.purchaseNav,
      m.units.toFixed(3),
      mf.currentNav,
      m.currentValue.toFixed(2),
      m.profitLoss.toFixed(2),
      m.returnPercentage.toFixed(2),
      mf.riskLevel,
      mf.notes || '',
    ];
  });

  const csv = convertToCSV(headers, rows);
  triggerDownload(csv, `Mutual_Fund_Portfolio_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportFixedDepositsToCSV(fixedDeposits: FixedDeposit[]) {
  const headers = [
    'Investor / Member',
    'Bank / Institution',
    'Account / FD No.',
    'Deposit Date',
    'Maturity Date',
    'Principal Amount (₹)',
    'Interest Rate (%)',
    'Compounding',
    'Tenure (Months)',
    'Current Value (₹)',
    'Interest Earned / Gain (₹)',
    'Return (%)',
    'Notes',
  ];

  const rows = fixedDeposits.map((fd) => {
    const m = getFixedDepositMetrics(fd);
    return [
      fd.memberName || 'General',
      fd.bankName,
      fd.accountNumber || '-',
      formatIndianDate(fd.depositDate),
      formatIndianDate(fd.maturityDate),
      fd.principalAmount,
      fd.interestRate,
      fd.compoundingFrequency,
      fd.tenureMonths,
      m.currentValue,
      m.profitLoss.toFixed(2),
      m.returnPercentage.toFixed(2),
      fd.notes || '',
    ];
  });

  const csv = convertToCSV(headers, rows);
  triggerDownload(csv, `Fixed_Deposits_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportMonthlyTrackingToCSV(records: MonthlyRecord[]) {
  const headers = ['Month', 'Investment Added (₹)', 'Portfolio Value (₹)', 'Profit/Loss (₹)', 'Notes'];

  const rows = records.map((r) => [r.month, r.investmentAdded, r.portfolioValue, r.profitLoss, r.notes || '']);

  const csv = convertToCSV(headers, rows);
  triggerDownload(csv, `Monthly_Investment_Tracking_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportFullPortfolioSummaryCSV(
  stocks: Stock[],
  mutualFunds: MutualFund[],
  fixedDeposits: FixedDeposit[],
  monthly: MonthlyRecord[]
) {
  const headers = [
    'Asset Type',
    'Investor / Member',
    'Investment Name',
    'Sector / Category / Bank',
    'Invested (₹)',
    'Current Value (₹)',
    'P/L or Interest (₹)',
    'Return (%)',
  ];

  const stockRows = stocks.map((s) => {
    const m = getStockMetrics(s);
    return ['Stock (Equity)', s.memberName || 'General', s.name, s.sector, m.investedAmount, m.currentValue, m.profitLoss.toFixed(2), `${m.returnPercentage.toFixed(2)}%`];
  });

  const mfRows = mutualFunds.map((mf) => {
    const m = getMutualFundMetrics(mf);
    return ['Mutual Fund', mf.memberName || 'General', mf.name, mf.category, m.investedAmount, m.currentValue.toFixed(2), m.profitLoss.toFixed(2), `${m.returnPercentage.toFixed(2)}%`];
  });

  const fdRows = fixedDeposits.map((fd) => {
    const m = getFixedDepositMetrics(fd);
    return ['Fixed Deposit (FD)', fd.memberName || 'General', fd.bankName, `${fd.interestRate}% (${fd.tenureMonths}M)`, m.investedAmount, m.currentValue.toFixed(2), m.profitLoss.toFixed(2), `${m.returnPercentage.toFixed(2)}%`];
  });

  const rows = [...stockRows, ...mfRows, ...fdRows];
  const csv = convertToCSV(headers, rows);
  triggerDownload(csv, `Complete_Portfolio_Report_${new Date().toISOString().slice(0, 10)}.csv`);
}
