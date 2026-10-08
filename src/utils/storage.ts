import { Stock, MutualFund, FixedDeposit, MonthlyRecord, ScreenshotRecord, ReportSettings } from '../types/portfolio';
import {
  INITIAL_STOCKS,
  INITIAL_MUTUAL_FUNDS,
  INITIAL_FIXED_DEPOSITS,
  INITIAL_MONTHLY_RECORDS,
  INITIAL_SCREENSHOTS,
  INITIAL_REPORT_SETTINGS,
  DEFAULT_MEMBERS,
} from '../data/initialData';

const STORAGE_KEYS = {
  STOCKS: 'stock_mf_portfolio_stocks_v2',
  MUTUAL_FUNDS: 'stock_mf_portfolio_mf_v2',
  FIXED_DEPOSITS: 'stock_mf_portfolio_fd_v2',
  MEMBERS: 'stock_mf_portfolio_members_v2',
  MONTHLY: 'stock_mf_portfolio_monthly_v2',
  SCREENSHOTS: 'stock_mf_portfolio_screenshots_v2',
  REPORT_SETTINGS: 'stock_mf_portfolio_report_settings_v2',
  IS_DEMO_ACTIVE: 'stock_mf_portfolio_demo_active_v2',
};

export function sanitizeMembers(list: unknown): string[] {
  if (!Array.isArray(list)) return [...DEFAULT_MEMBERS];
  const unique = Array.from(
    new Set(list.map((m) => String(m || '').trim()).filter((m) => m.length > 0))
  );
  return unique.length > 0 ? unique : [...DEFAULT_MEMBERS];
}

export function loadStoredData() {
  let stocks: Stock[] = INITIAL_STOCKS;
  let mutualFunds: MutualFund[] = INITIAL_MUTUAL_FUNDS;
  let fixedDeposits: FixedDeposit[] = INITIAL_FIXED_DEPOSITS;
  let members: string[] = DEFAULT_MEMBERS;
  let monthlyRecords: MonthlyRecord[] = INITIAL_MONTHLY_RECORDS;
  let screenshots: ScreenshotRecord[] = INITIAL_SCREENSHOTS;
  let reportSettings: ReportSettings = INITIAL_REPORT_SETTINGS;
  let isDemoActive: boolean = true;

  try {
    const rawStocks = localStorage.getItem(STORAGE_KEYS.STOCKS);
    if (rawStocks) stocks = JSON.parse(rawStocks);

    const rawMf = localStorage.getItem(STORAGE_KEYS.MUTUAL_FUNDS);
    if (rawMf) mutualFunds = JSON.parse(rawMf);

    const rawFd = localStorage.getItem(STORAGE_KEYS.FIXED_DEPOSITS);
    if (rawFd) fixedDeposits = JSON.parse(rawFd);

    const rawMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (rawMembers) {
      members = sanitizeMembers(JSON.parse(rawMembers));
    } else {
      members = sanitizeMembers(DEFAULT_MEMBERS);
    }

    const rawMonthly = localStorage.getItem(STORAGE_KEYS.MONTHLY);
    if (rawMonthly) monthlyRecords = JSON.parse(rawMonthly);

    const rawScreenshots = localStorage.getItem(STORAGE_KEYS.SCREENSHOTS);
    if (rawScreenshots) screenshots = JSON.parse(rawScreenshots);

    const rawSettings = localStorage.getItem(STORAGE_KEYS.REPORT_SETTINGS);
    if (rawSettings) reportSettings = { ...INITIAL_REPORT_SETTINGS, ...JSON.parse(rawSettings) };

    const rawDemoActive = localStorage.getItem(STORAGE_KEYS.IS_DEMO_ACTIVE);
    if (rawDemoActive !== null) isDemoActive = JSON.parse(rawDemoActive);
  } catch (err) {
    console.warn('Failed to load portfolio data from localStorage:', err);
  }

  const cleanMembers = sanitizeMembers(members);
  return { stocks, mutualFunds, fixedDeposits, members: cleanMembers, teamMembers: cleanMembers, monthlyRecords, screenshots, reportSettings, isDemoActive };
}

export function saveStocks(stocks: Stock[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.STOCKS, JSON.stringify(stocks));
  } catch (err) {
    console.error('Failed to save stocks:', err);
  }
}

export function saveMutualFunds(mf: MutualFund[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MUTUAL_FUNDS, JSON.stringify(mf));
  } catch (err) {
    console.error('Failed to save mutual funds:', err);
  }
}

export function saveFixedDeposits(fds: FixedDeposit[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.FIXED_DEPOSITS, JSON.stringify(fds));
  } catch (err) {
    console.error('Failed to save fixed deposits:', err);
  }
}

export function saveMembers(members: string[]) {
  try {
    const clean = sanitizeMembers(members);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(clean));
  } catch (err) {
    console.error('Failed to save members:', err);
  }
}

export const saveTeamMembers = saveMembers;

export function saveMonthlyRecords(records: MonthlyRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MONTHLY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save monthly records:', err);
  }
}

export function saveScreenshots(screenshots: ScreenshotRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SCREENSHOTS, JSON.stringify(screenshots));
  } catch (err) {
    console.error('Failed to save screenshots:', err);
  }
}

export function saveReportSettings(settings: ReportSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.REPORT_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save report settings:', err);
  }
}

export function saveDemoActive(isActive: boolean) {
  try {
    localStorage.setItem(STORAGE_KEYS.IS_DEMO_ACTIVE, JSON.stringify(isActive));
  } catch (err) {
    console.error('Failed to save demo active flag:', err);
  }
}

export function resetToDemoData() {
  saveStocks(INITIAL_STOCKS);
  saveMutualFunds(INITIAL_MUTUAL_FUNDS);
  saveFixedDeposits(INITIAL_FIXED_DEPOSITS);
  saveMembers(DEFAULT_MEMBERS);
  saveMonthlyRecords(INITIAL_MONTHLY_RECORDS);
  saveScreenshots(INITIAL_SCREENSHOTS);
  saveReportSettings(INITIAL_REPORT_SETTINGS);
  saveDemoActive(true);
}

export function clearAllPortfolioData() {
  saveStocks([]);
  saveMutualFunds([]);
  saveFixedDeposits([]);
  saveMonthlyRecords([]);
  saveScreenshots([]);
  saveDemoActive(false);
}
