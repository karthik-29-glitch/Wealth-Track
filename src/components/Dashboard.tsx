import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Layers,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PieChart as PieIcon,
  PlusCircle,
  FileText,
  Award,
  User,
  Users,
  Search,
  X,
  Sparkles,
} from 'lucide-react';
import {
  Stock,
  MutualFund,
  FixedDeposit,
  PortfolioSummary,
  formatINR,
  formatPercent,
  getStockMetrics,
  getMutualFundMetrics,
  getFixedDepositMetrics,
  calculatePortfolioSummary,
} from '../types/portfolio';
import { DonutChart, CompareBarChart, ProfitLossChart } from './Charts';
import { TabType } from './Navbar';

interface DashboardProps {
  summary: PortfolioSummary;
  stocks: Stock[];
  mutualFunds: MutualFund[];
  fixedDeposits: FixedDeposit[];
  members: string[];
  isDemoActive: boolean;
  setActiveTab: (tab: TabType) => void;
  onViewStock: (stock: Stock) => void;
  onViewMf: (mf: MutualFund) => void;
  onViewFd: (fd: FixedDeposit) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  summary: initialSummary,
  stocks,
  mutualFunds,
  fixedDeposits,
  members,
  isDemoActive,
  setActiveTab,
  onViewStock,
  onViewMf,
  onViewFd,
}) => {
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchCategory, setSearchCategory] = useState<'all' | 'stock' | 'mf' | 'fd'>('all');

  const uniqueMembers = useMemo(() => {
    return Array.from(new Set(members.map((m) => m.trim()).filter(Boolean)));
  }, [members]);

  // Filter items if specific member selected
  const filteredStocks = useMemo(() => {
    if (selectedMember === 'all') return stocks;
    return stocks.filter((s) => s.memberName === selectedMember);
  }, [stocks, selectedMember]);

  const filteredMfs = useMemo(() => {
    if (selectedMember === 'all') return mutualFunds;
    return mutualFunds.filter((mf) => mf.memberName === selectedMember);
  }, [mutualFunds, selectedMember]);

  const filteredFds = useMemo(() => {
    if (selectedMember === 'all') return fixedDeposits;
    return fixedDeposits.filter((fd) => fd.memberName === selectedMember);
  }, [fixedDeposits, selectedMember]);

  // Recalculate summary if member is filtered
  const summary = useMemo(() => {
    if (selectedMember === 'all') return initialSummary;
    return calculatePortfolioSummary(filteredStocks, filteredMfs, filteredFds);
  }, [selectedMember, initialSummary, filteredStocks, filteredMfs, filteredFds]);

  const isOverallProfit = summary.totalProfitLoss >= 0;

  // GLOBAL SEARCH ACROSS STOCKS, MUTUAL FUNDS, AND FIXED DEPOSITS
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const matchedStocks = filteredStocks
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.company.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q) ||
          (s.notes && s.notes.toLowerCase().includes(q)) ||
          (s.memberName && s.memberName.toLowerCase().includes(q))
      )
      .map((s) => ({
        id: s.id,
        name: s.name,
        companyOrBank: s.company,
        subtitle: `${s.company} • ${s.sector}`,
        type: 'Stock' as const,
        member: s.memberName,
        raw: s,
        ...getStockMetrics(s),
      }));

    const matchedMfs = filteredMfs
      .filter(
        (mf) =>
          mf.name.toLowerCase().includes(q) ||
          mf.amc.toLowerCase().includes(q) ||
          mf.category.toLowerCase().includes(q) ||
          (mf.notes && mf.notes.toLowerCase().includes(q)) ||
          (mf.memberName && mf.memberName.toLowerCase().includes(q))
      )
      .map((mf) => ({
        id: mf.id,
        name: mf.name,
        companyOrBank: mf.amc,
        subtitle: `${mf.amc} • ${mf.category}`,
        type: 'Mutual Fund' as const,
        member: mf.memberName,
        raw: mf,
        ...getMutualFundMetrics(mf),
      }));

    const matchedFds = filteredFds
      .filter(
        (fd) =>
          fd.bankName.toLowerCase().includes(q) ||
          (fd.accountNumber && fd.accountNumber.toLowerCase().includes(q)) ||
          (fd.notes && fd.notes.toLowerCase().includes(q)) ||
          (fd.memberName && fd.memberName.toLowerCase().includes(q))
      )
      .map((fd) => {
        const metrics = getFixedDepositMetrics(fd);
        return {
          id: fd.id,
          name: `${fd.bankName} Fixed Deposit`,
          companyOrBank: fd.bankName,
          subtitle: `${fd.tenureMonths} Mo @ ${fd.interestRate}% p.a. • A/C: ${fd.accountNumber || 'N/A'}`,
          type: 'FD' as const,
          member: fd.memberName,
          raw: fd,
          investedAmount: metrics.principalAmount,
          currentValue: metrics.currentValue,
          profitLoss: metrics.interestEarned,
          returnPercentage: metrics.returnPercentage,
        };
      });

    const combined = [...matchedStocks, ...matchedMfs, ...matchedFds];

    if (searchCategory === 'stock') return combined.filter((i) => i.type === 'Stock');
    if (searchCategory === 'mf') return combined.filter((i) => i.type === 'Mutual Fund');
    if (searchCategory === 'fd') return combined.filter((i) => i.type === 'FD');
    return combined;
  }, [searchQuery, searchCategory, filteredStocks, filteredMfs, filteredFds]);

  // Counts for search category pills
  const searchCounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { all: 0, stock: 0, mf: 0, fd: 0 };

    const stockCount = filteredStocks.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.company.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q)) ||
        (s.memberName && s.memberName.toLowerCase().includes(q))
    ).length;

    const mfCount = filteredMfs.filter(
      (mf) =>
        mf.name.toLowerCase().includes(q) ||
        mf.amc.toLowerCase().includes(q) ||
        mf.category.toLowerCase().includes(q) ||
        (mf.notes && mf.notes.toLowerCase().includes(q)) ||
        (mf.memberName && mf.memberName.toLowerCase().includes(q))
    ).length;

    const fdCount = filteredFds.filter(
      (fd) =>
        fd.bankName.toLowerCase().includes(q) ||
        (fd.accountNumber && fd.accountNumber.toLowerCase().includes(q)) ||
        (fd.notes && fd.notes.toLowerCase().includes(q)) ||
        (fd.memberName && fd.memberName.toLowerCase().includes(q))
    ).length;

    return {
      all: stockCount + mfCount + fdCount,
      stock: stockCount,
      mf: mfCount,
      fd: fdCount,
    };
  }, [searchQuery, filteredStocks, filteredMfs, filteredFds]);

  // Donut data: Stocks vs Mutual Funds vs Fixed Deposits
  const allocationData = [
    {
      label: 'Stocks (Equity)',
      value: summary.stockCurrentValue,
      color: '#2563eb', // Blue 600
      percent: summary.stockAllocationPct,
    },
    {
      label: 'Mutual Funds',
      value: summary.mfCurrentValue,
      color: '#10b981', // Emerald 500
      percent: summary.mfAllocationPct,
    },
    {
      label: 'Fixed Deposits (FD)',
      value: summary.fdCurrentValue,
      color: '#f59e0b', // Amber 500
      percent: summary.fdAllocationPct,
    },
  ];

  // Bar Chart comparison: Stocks, Mutual Funds, Fixed Deposits, Overall
  const compareItems = [
    {
      label: 'Stocks',
      invested: summary.stockInvested,
      current: summary.stockCurrentValue,
    },
    {
      label: 'Mutual Funds',
      invested: summary.mfInvested,
      current: summary.mfCurrentValue,
    },
    {
      label: 'Fixed Deposits',
      invested: summary.fdInvested,
      current: summary.fdCurrentValue,
    },
    {
      label: 'Overall Portfolio',
      invested: summary.totalInvested,
      current: summary.totalCurrentValue,
    },
  ];

  // All investments combined for top performers
  const allInvestments = useMemo(() => {
    const stockItems = filteredStocks.map((s) => ({
      name: s.name,
      type: 'Stock' as const,
      member: s.memberName,
      raw: s,
      ...getStockMetrics(s),
    }));

    const mfItems = filteredMfs.map((mf) => ({
      name: mf.name,
      type: 'Mutual Fund' as const,
      member: mf.memberName,
      raw: mf,
      ...getMutualFundMetrics(mf),
    }));

    const fdItems = filteredFds.map((fd) => {
      const metrics = getFixedDepositMetrics(fd);
      return {
        name: `${fd.bankName} FD`,
        type: 'FD' as const,
        member: fd.memberName,
        raw: fd,
        investedAmount: metrics.principalAmount,
        currentValue: metrics.currentValue,
        profitLoss: metrics.interestEarned,
        returnPercentage: metrics.returnPercentage,
      };
    });

    return [...stockItems, ...mfItems, ...fdItems].sort(
      (a, b) => b.returnPercentage - a.returnPercentage
    );
  }, [filteredStocks, filteredMfs, filteredFds]);

  const topGainersForPL = allInvestments.slice(0, 5).map((item) => ({
    label: item.name,
    profitLoss: item.profitLoss,
    returnPct: item.returnPercentage,
  }));

  const sampleSearchQueries = ['Reliance', 'HDFC', 'SBI', 'TCS', 'ICICI'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <TrendingUp className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-blue-200 border border-white/10">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Academic Investment Portfolio &bull; 4 Members
            </span>
            <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full text-xs font-semibold">
              <Landmark className="w-3.5 h-3.5 text-amber-300" /> Stocks + MFs + FDs
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Investment Portfolio Dashboard
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Record, track, and evaluate member-wise investments across Indian Equities, Mutual Funds, and Bank Fixed Deposits with automated ₹ INR valuations.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('entry-form')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 transition-all shadow-md shadow-black/10"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Add Investment Record</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600/80 hover:bg-blue-600 border border-blue-400/30 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Generate 11-Page Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* GLOBAL SEARCH BAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Global Portfolio Search
              </h2>
              <p className="text-xs text-slate-500">
                Instantly search any holding across Stocks, Mutual Funds, or Fixed Deposits by name, ticker, bank, or AMC
              </p>
            </div>
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchCategory('all');
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <X className="w-3.5 h-3.5" /> Clear Search
            </button>
          )}
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by investment name, company, sector, bank, or member (e.g., Reliance, HDFC, SBI, TCS)..."
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900 placeholder:text-slate-400 bg-slate-50/50 hover:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
              title="Clear text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggestion Chips */}
        {!searchQuery && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-500">
            <span className="font-medium text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Popular searches:
            </span>
            {sampleSearchQueries.map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-[11px] font-medium transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {/* INSTANT SEARCH RESULTS DISPLAY */}
        {searchQuery.trim().length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-3">
            {/* Filter Pills within Search */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700">
                Found {searchCounts.all} result{searchCounts.all === 1 ? '' : 's'} for &ldquo;{searchQuery}&rdquo;
              </span>

              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setSearchCategory('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    searchCategory === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({searchCounts.all})
                </button>
                <button
                  onClick={() => setSearchCategory('stock')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    searchCategory === 'stock'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Stocks ({searchCounts.stock})
                </button>
                <button
                  onClick={() => setSearchCategory('mf')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    searchCategory === 'mf'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  Mutual Funds ({searchCounts.mf})
                </button>
                <button
                  onClick={() => setSearchCategory('fd')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    searchCategory === 'fd'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  Fixed Deposits ({searchCounts.fd})
                </button>
              </div>
            </div>

            {/* Results Grid / List */}
            {searchResults.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">
                  No investments found matching &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Try checking the spelling, selecting &ldquo;All Members&rdquo; in the filter below, or add a new investment holding.
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100"
                  >
                    Clear Search
                  </button>
                  <button
                    onClick={() => setActiveTab('entry-form')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
                  >
                    + Add This Investment
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.map((item) => {
                  const isProfit = item.profitLoss >= 0;
                  const isStock = item.type === 'Stock';
                  const isMf = item.type === 'Mutual Fund';
                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      onClick={() => {
                        if (isStock) onViewStock(item.raw as Stock);
                        else if (isMf) onViewMf(item.raw as MutualFund);
                        else onViewFd(item.raw as FixedDeposit);
                      }}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        {/* Header badge & member */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isStock
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : isMf
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {item.type}
                          </span>

                          {item.member && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                              <User className="w-2.5 h-2.5 text-indigo-500" />
                              {item.member}
                            </span>
                          )}
                        </div>

                        {/* Title & subtitle */}
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>

                      {/* Values */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Invested:</span>
                          <span className="font-bold text-slate-800">{formatINR(item.investedAmount)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Current Worth:</span>
                          <span className="font-bold text-blue-700">{formatINR(item.currentValue)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Yield / Gain:</span>
                          <span
                            className={`font-bold inline-flex items-center gap-0.5 ${
                              isProfit ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isProfit ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {formatPercent(item.returnPercentage)}
                          </span>
                        </div>
                      </div>

                      {/* Action trigger footer */}
                      <div className="mt-2.5 pt-2 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="text-blue-600 group-hover:underline font-semibold flex items-center gap-1">
                          View Details &rarr;
                        </span>
                        <span className="text-slate-400">
                          {isProfit ? `+${formatINR(item.profitLoss)}` : formatINR(item.profitLoss)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MEMBER FILTER BAR */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">Filter Portfolio by Team Member</span>
            <span className="text-[11px] text-slate-500">
              Showing {selectedMember === 'all' ? 'Consolidated Team Portfolio (4 Members)' : `${selectedMember}'s Personal Holdings`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedMember('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedMember === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Members ({stocks.length + mutualFunds.length + fixedDeposits.length})
          </button>
          {uniqueMembers.map((m, idx) => {
            const count =
              stocks.filter((s) => s.memberName === m).length +
              mutualFunds.filter((mf) => mf.memberName === m).length +
              fixedDeposits.filter((fd) => fd.memberName === m).length;
            const isSel = selectedMember === m;
            return (
              <button
                key={`dashboard-member-${m}-${idx}`}
                onClick={() => setSelectedMember(m)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isSel
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'
                }`}
              >
                <User className="w-3 h-3" />
                <span>{m}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSel ? 'bg-indigo-800 text-white' : 'bg-indigo-200/70 text-indigo-800'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 PRIMARY METRIC CARDS (as requested in prompt) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Investment Card */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Investment</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {formatINR(summary.totalInvested)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Stocks: {formatINR(summary.stockInvested)}</span>
            <span>MFs: {formatINR(summary.mfInvested)}</span>
            <span>FDs: {formatINR(summary.fdInvested)}</span>
          </div>
        </div>

        {/* Current Portfolio Value Card */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Current Value</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700">
            {formatINR(summary.totalCurrentValue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Stocks: {formatINR(summary.stockCurrentValue)}</span>
            <span>MFs: {formatINR(summary.mfCurrentValue)}</span>
            <span>FDs: {formatINR(summary.fdCurrentValue)}</span>
          </div>
        </div>

        {/* Total Profit/Loss Card */}
        <div
          className={`rounded-2xl p-5 shadow-xs border transition-all ${
            isOverallProfit
              ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
              : 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Profit / Loss
            </span>
            <span
              className={`p-2 rounded-xl ${
                isOverallProfit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {isOverallProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            </span>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black ${
              isOverallProfit ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {isOverallProfit ? '+' : ''}
            {formatINR(summary.totalProfitLoss)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-semibold">
            <span className={summary.stockProfitLoss >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
              Stk: {summary.stockProfitLoss >= 0 ? '+' : ''}{formatINR(summary.stockProfitLoss)}
            </span>
            <span className={summary.mfProfitLoss >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
              MF: {summary.mfProfitLoss >= 0 ? '+' : ''}{formatINR(summary.mfProfitLoss)}
            </span>
            <span className="text-amber-700">
              FD: +{formatINR(summary.fdProfitLoss)}
            </span>
          </div>
        </div>

        {/* Overall Return % Card */}
        <div
          className={`rounded-2xl p-5 shadow-xs border transition-all ${
            isOverallProfit
              ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
              : 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Overall Return
            </span>
            <span
              className={`p-2 rounded-xl ${
                isOverallProfit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              <PieIcon className="w-4 h-4" />
            </span>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black ${
              isOverallProfit ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatPercent(summary.overallReturnPct)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">
              {summary.stockCount} Stk &bull; {summary.mfCount} MF &bull; {summary.fdCount} FD
            </span>
            <span className={isOverallProfit ? 'text-emerald-600' : 'text-rose-600'}>
              {isOverallProfit ? 'Positive Alpha' : 'Loss'}
            </span>
          </div>
        </div>
      </div>

      {/* 3 ASSET CLASS OVERVIEW CARDS: Stocks vs Mutual Funds vs Fixed Deposits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stocks Overview Card */}
        <div
          className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 cursor-pointer hover:border-blue-400 transition-all group"
          onClick={() => setActiveTab('stocks')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Stock Holdings
                </h3>
                <span className="text-xs text-slate-500 font-medium">{summary.stockCount} Active Stocks</span>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              {summary.stockAllocationPct.toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Invested:</span>
              <span className="font-bold text-slate-800">{formatINR(summary.stockInvested)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Current:</span>
              <span className="font-bold text-blue-700">{formatINR(summary.stockCurrentValue)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Returns:</span>
              <span
                className={`font-bold ${
                  summary.stockProfitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatPercent(summary.stockReturnPct)}
              </span>
            </div>
          </div>
        </div>

        {/* Mutual Funds Overview Card */}
        <div
          className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 cursor-pointer hover:border-emerald-400 transition-all group"
          onClick={() => setActiveTab('mutual-funds')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Mutual Funds
                </h3>
                <span className="text-xs text-slate-500 font-medium">{summary.mfCount} Active Schemes</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              {summary.mfAllocationPct.toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Invested:</span>
              <span className="font-bold text-slate-800">{formatINR(summary.mfInvested)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Current:</span>
              <span className="font-bold text-emerald-700">{formatINR(summary.mfCurrentValue)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Returns:</span>
              <span
                className={`font-bold ${
                  summary.mfProfitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatPercent(summary.mfReturnPct)}
              </span>
            </div>
          </div>
        </div>

        {/* Fixed Deposits Overview Card */}
        <div
          className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 cursor-pointer hover:border-amber-400 transition-all group"
          onClick={() => setActiveTab('fd')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  Fixed Deposits (FD)
                </h3>
                <span className="text-xs text-slate-500 font-medium">{summary.fdCount} Active FDs</span>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
              {summary.fdAllocationPct.toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Principal:</span>
              <span className="font-bold text-slate-800">{formatINR(summary.fdInvested)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Current:</span>
              <span className="font-bold text-amber-700">{formatINR(summary.fdCurrentValue)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Interest:</span>
              <span className="font-bold text-emerald-600">
                +{formatINR(summary.fdProfitLoss)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* VISUAL CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Stock vs Mutual Fund vs FD Allocation (Donut) */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Portfolio Asset Allocation</h3>
              <p className="text-xs text-slate-500">Stocks vs Mutual Funds vs FDs</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Current Values
            </span>
          </div>

          <div className="py-2">
            <DonutChart
              data={allocationData}
              centerText={formatINR(summary.totalCurrentValue)}
              centerSubtext="Total Portfolio"
            />
          </div>
        </div>

        {/* Chart 2: Invested vs Current Value Comparison */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Capital Invested vs Current Valuation</h3>
              <p className="text-xs text-slate-500">Comparative growth across portfolio segments</p>
            </div>
            <button
              onClick={() => setActiveTab('analysis')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Detailed Analysis &rarr;
            </button>
          </div>

          <CompareBarChart items={compareItems} height={220} />
        </div>
      </div>

      {/* TOP HOLDINGS & PROFIT/LOSS BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers Profit/Loss Visual */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top Performing Investments</h3>
              <p className="text-xs text-slate-500">Highest returns across all recorded assets</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Highest Returns
            </span>
          </div>

          <ProfitLossChart items={topGainersForPL} />
        </div>

        {/* Quick Holdings Preview List */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Holdings Quick View</h3>
              <p className="text-xs text-slate-500">Click any holding to inspect performance</p>
            </div>
            <span className="text-xs text-slate-400 font-medium">Top 5 items</span>
          </div>

          <div className="divide-y divide-slate-100">
            {allInvestments.slice(0, 5).map((item, idx) => {
              const isProfit = item.profitLoss >= 0;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (item.type === 'Stock') onViewStock(item.raw as Stock);
                    else if (item.type === 'Mutual Fund') onViewMf(item.raw as MutualFund);
                    else onViewFd(item.raw as FixedDeposit);
                  }}
                  className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        item.type === 'Stock'
                          ? 'bg-blue-600'
                          : item.type === 'Mutual Fund'
                          ? 'bg-emerald-600'
                          : 'bg-amber-500'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </h4>
                        {item.member && (
                          <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded-full font-semibold">
                            {item.member}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {item.type} &bull; Invested: {formatINR(item.investedAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">
                      {formatINR(item.currentValue)}
                    </p>
                    <span
                      className={`text-[11px] font-bold ${
                        isProfit ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isProfit ? '+' : ''}{formatPercent(item.returnPercentage)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => setActiveTab('stocks')}
              className="font-semibold text-blue-600 hover:underline"
            >
              Stocks ({stocks.length}) &rarr;
            </button>
            <button
              onClick={() => setActiveTab('mutual-funds')}
              className="font-semibold text-emerald-600 hover:underline"
            >
              Mutual Funds ({mutualFunds.length}) &rarr;
            </button>
            <button
              onClick={() => setActiveTab('fd')}
              className="font-semibold text-amber-600 hover:underline"
            >
              Fixed Deposits ({fixedDeposits.length}) &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
