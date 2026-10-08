import React, { useState, useMemo } from 'react';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Target,
  CheckCircle2,
  Lightbulb,
  ArrowUpRight,
  Layers,
  Landmark,
  User,
  Users,
} from 'lucide-react';
import {
  Stock,
  MutualFund,
  FixedDeposit,
  MonthlyRecord,
  PortfolioSummary,
  formatINR,
  formatPercent,
  getStockMetrics,
  getMutualFundMetrics,
  getFixedDepositMetrics,
} from '../types/portfolio';
import { DonutChart, CompareBarChart, ProfitLossChart, RiskMeterGauge, MonthlyGrowthChart } from './Charts';

interface PortfolioAnalysisProps {
  summary: PortfolioSummary;
  stocks: Stock[];
  mutualFunds: MutualFund[];
  fixedDeposits: FixedDeposit[];
  monthlyRecords: MonthlyRecord[];
  members: string[];
}

export const PortfolioAnalysis: React.FC<PortfolioAnalysisProps> = ({
  summary,
  stocks,
  mutualFunds,
  fixedDeposits,
  monthlyRecords,
  members,
}) => {
  const [analysisView, setAnalysisView] = useState<'asset' | 'member'>('asset');

  // Sector allocation for stocks
  const sectorMap = new Map<string, number>();
  stocks.forEach((s) => {
    const m = getStockMetrics(s);
    sectorMap.set(s.sector, (sectorMap.get(s.sector) || 0) + m.currentValue);
  });
  const sectorList = Array.from(sectorMap.entries())
    .map(([sector, value]) => ({
      sector,
      value,
      percent: summary.stockCurrentValue > 0 ? (value / summary.stockCurrentValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Asset class donut data: 3 assets
  const assetClassData = [
    {
      label: 'Stocks (Direct Equities)',
      value: summary.stockCurrentValue,
      color: '#2563eb', // Blue
      percent: summary.stockAllocationPct,
    },
    {
      label: 'Mutual Funds',
      value: summary.mfCurrentValue,
      color: '#10b981', // Emerald
      percent: summary.mfAllocationPct,
    },
    {
      label: 'Fixed Deposits (FD)',
      value: summary.fdCurrentValue,
      color: '#f59e0b', // Amber
      percent: summary.fdAllocationPct,
    },
  ];

  // Member-wise allocation donut data
  const memberColorPalette = ['#6366f1', '#06b6d4', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];
  const uniqueMembers = React.useMemo(() => {
    return Array.from(new Set(members.map((m) => m.trim()).filter(Boolean)));
  }, [members]);

  const memberWiseData = uniqueMembers.map((member, idx) => {
    const memberStocks = stocks.filter((s) => s.memberName === member);
    const memberMfs = mutualFunds.filter((m) => m.memberName === member);
    const memberFds = fixedDeposits.filter((f) => f.memberName === member);

    const stockVal = memberStocks.reduce((sum, s) => sum + getStockMetrics(s).currentValue, 0);
    const mfVal = memberMfs.reduce((sum, m) => sum + getMutualFundMetrics(m).currentValue, 0);
    const fdVal = memberFds.reduce((sum, f) => sum + getFixedDepositMetrics(f).currentValue, 0);
    const totalVal = stockVal + mfVal + fdVal;
    const percent = summary.totalCurrentValue > 0 ? (totalVal / summary.totalCurrentValue) * 100 : 0;

    return {
      label: member,
      value: totalVal,
      color: memberColorPalette[idx % memberColorPalette.length],
      percent,
      stockCount: memberStocks.length,
      mfCount: memberMfs.length,
      fdCount: memberFds.length,
    };
  });

  // Investment vs Current comparison: 3 assets + total
  const compareItems = [
    { label: 'Direct Stocks', invested: summary.stockInvested, current: summary.stockCurrentValue },
    { label: 'Mutual Funds', invested: summary.mfInvested, current: summary.mfCurrentValue },
    { label: 'Fixed Deposits', invested: summary.fdInvested, current: summary.fdCurrentValue },
    { label: 'Combined Total', invested: summary.totalInvested, current: summary.totalCurrentValue },
  ];

  // Profit/Loss across all holdings
  const combinedHoldings = [
    ...stocks.map((s) => ({
      name: s.name,
      ...getStockMetrics(s),
    })),
    ...mutualFunds.map((mf) => ({
      name: mf.name,
      ...getMutualFundMetrics(mf),
    })),
    ...fixedDeposits.map((fd) => {
      const metrics = getFixedDepositMetrics(fd);
      return {
        name: `${fd.bankName} FD`,
        investedAmount: metrics.principalAmount,
        currentValue: metrics.currentValue,
        profitLoss: metrics.interestEarned,
        returnPercentage: metrics.returnPercentage,
      };
    }),
  ].sort((a, b) => b.profitLoss - a.profitLoss);

  const plBarData = combinedHoldings.slice(0, 8).map((h) => ({
    label: h.name,
    profitLoss: h.profitLoss,
    returnPct: h.returnPercentage,
  }));

  // Overall risk profile calculation based on stock, MF, and FD risks
  const highRiskCount =
    stocks.filter((s) => s.riskLevel === 'High').length +
    mutualFunds.filter((m) => m.riskLevel === 'High').length;
  const totalCount = stocks.length + mutualFunds.length + fixedDeposits.length;
  const highRiskRatio = totalCount > 0 ? highRiskCount / totalCount : 0;
  const assessedRisk: 'Low' | 'Moderate' | 'High' =
    highRiskRatio > 0.4 ? 'High' : highRiskRatio > 0.15 ? 'Moderate' : 'Low';

  // Monthly growth points
  const growthPoints = monthlyRecords.map((r) => ({
    month: r.month,
    value: r.portfolioValue,
    added: r.investmentAdded,
    profitLoss: r.profitLoss,
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <PieChart className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">Portfolio Comprehensive Analysis</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Deep dive into asset allocation across Equities, Mutual Funds &amp; FDs, plus member contribution analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-100">
              Stocks: {summary.stockAllocationPct.toFixed(1)}%
            </span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
              MFs: {summary.mfAllocationPct.toFixed(1)}%
            </span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-100">
              FDs: {summary.fdAllocationPct.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Primary KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Total Capital Outlay</span>
          <p className="text-lg font-bold text-slate-900 mt-1">{formatINR(summary.totalInvested)}</p>
          <span className="text-[11px] text-slate-400">Initial principal</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Current Portfolio Value</span>
          <p className="text-lg font-bold text-blue-700 mt-1">{formatINR(summary.totalCurrentValue)}</p>
          <span className="text-[11px] text-slate-400">Total worth</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Net Returns / Gain</span>
          <p
            className={`text-lg font-bold mt-1 ${
              summary.totalProfitLoss >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {summary.totalProfitLoss >= 0 ? '+' : ''}
            {formatINR(summary.totalProfitLoss)}
          </p>
          <span className="text-[11px] text-slate-400">Net unrealized &amp; accrued</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Overall Return (ROI)</span>
          <p
            className={`text-lg font-bold mt-1 ${
              summary.overallReturnPct >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatPercent(summary.overallReturnPct)}
          </p>
          <span className="text-[11px] text-slate-400">Cumulative return %</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-xs text-slate-500 font-semibold block">Holdings Diversification</span>
          <p className="text-lg font-bold text-indigo-700 mt-1">
            {summary.stockCount + summary.mfCount + summary.fdCount} Assets
          </p>
          <span className="text-[11px] text-slate-400">
            {summary.stockCount} Stk &bull; {summary.mfCount} MF &bull; {summary.fdCount} FD
          </span>
        </div>
      </div>

      {/* ALLOCATION CHARTS: ASSET CLASS & TEAM MEMBERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Class Allocation Donut */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Asset Class Allocation</h3>
              <p className="text-xs text-slate-500">Equities vs Mutual Funds vs Fixed Deposits</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              3 Classes
            </span>
          </div>

          <div className="py-2">
            <DonutChart
              data={assetClassData}
              centerText={formatINR(summary.totalCurrentValue)}
              centerSubtext="Total Portfolio"
            />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-blue-50/50 rounded-lg">
              <span className="text-slate-500 block">Stocks (Eq.)</span>
              <span className="font-bold text-blue-700">{formatINR(summary.stockCurrentValue)}</span>
            </div>
            <div className="p-2 bg-emerald-50/50 rounded-lg">
              <span className="text-slate-500 block">Mutual Funds</span>
              <span className="font-bold text-emerald-700">{formatINR(summary.mfCurrentValue)}</span>
            </div>
            <div className="p-2 bg-amber-50/50 rounded-lg">
              <span className="text-slate-500 block">Fixed Deposits</span>
              <span className="font-bold text-amber-700">{formatINR(summary.fdCurrentValue)}</span>
            </div>
          </div>
        </div>

        {/* Member-Wise Contribution Donut */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Team Member Allocation (4 Members)</h3>
              <p className="text-xs text-slate-500">Portfolio value distribution by member</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              Member Share
            </span>
          </div>

          <div className="py-2">
            <DonutChart
              data={memberWiseData}
              centerText={`${members.length} Members`}
              centerSubtext="Team Portfolio"
            />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            {memberWiseData.map((m, idx) => (
              <div key={idx} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">{m.label}</span>
                  <span className="text-[10px] text-slate-400 block">
                    {m.stockCount} Stk &bull; {m.mfCount} MF &bull; {m.fdCount} FD
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-indigo-700">{formatINR(m.value)}</span>
                  <span className="text-[10px] text-slate-500 block">{m.percent.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BAR CHART & SECTOR ALLOCATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invested vs Current Comparison */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Capital Invested vs Current Valuation</h3>
              <p className="text-xs text-slate-500">Growth per asset class segment</p>
            </div>
          </div>
          <CompareBarChart items={compareItems} height={230} />
        </div>

        {/* Sector Allocation for Direct Equities */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Equity Sector Diversification</h3>
              <p className="text-xs text-slate-500">Distribution of stock capital by industry sector</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {sectorList.length} Sectors
            </span>
          </div>

          {sectorList.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No stock sectors to display
            </div>
          ) : (
            <div className="space-y-3">
              {sectorList.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{item.sector}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{formatINR(item.value)}</span>
                      <span className="font-bold text-blue-700">{item.percent.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(item.percent, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TOP HOLDINGS PROFIT/LOSS BREAKDOWN */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Profit / Loss Distribution Across Holdings</h3>
            <p className="text-xs text-slate-500">Ranked by absolute rupee profit and percentage yield</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">Top 8 holdings</span>
        </div>

        <ProfitLossChart items={plBarData} />
      </div>

      {/* MONTHLY GROWTH TIMELINE CHART */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Portfolio Growth Over Time (Monthly Tracking)</h3>
            <p className="text-xs text-slate-500">Cumulative portfolio valuation trend</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {monthlyRecords.length} Monthly Milestones
          </span>
        </div>

        <MonthlyGrowthChart records={growthPoints} height={240} />
      </div>

      {/* RISK PROFILE & STRATEGIC RECOMMENDATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk profile gauge */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Portfolio Risk Profile</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Aggregate volatility rating derived from individual asset weights, sector concentration, and bank FD safety.
            </p>
          </div>

          <div className="py-2 flex flex-col items-center">
            <RiskMeterGauge level={assessedRisk} />
            <p className="text-xs font-bold text-slate-800 mt-3">
              Current Assessed Stance: <span className="text-blue-700">{assessedRisk} Risk</span>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Fixed deposits act as a capital preservation anchor, counterbalancing market equity volatility.
          </div>
        </div>

        {/* Strategic observations & insights */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Strategic Portfolio Observations</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Balanced Asset Allocation:</strong> Portfolio holds{' '}
                {summary.stockAllocationPct.toFixed(1)}% Direct Equities,{' '}
                {summary.mfAllocationPct.toFixed(1)}% Mutual Funds, and{' '}
                {summary.fdAllocationPct.toFixed(1)}% Fixed Deposits. This 3-pillar structure combines high growth with downside security.
              </div>
            </div>

            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Risk Mitigation via Fixed Deposits:</strong> With ₹
                {formatINR(summary.fdCurrentValue)} safely parked in scheduled commercial bank FDs yielding 7%+ p.a., the team ensures liquidity and steady cash accrual.
              </div>
            </div>

            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Team Collaboration (4 Members):</strong> All 4 members (
                {members.join(', ')}) actively maintain and monitor their designated allocations for collegiate teamwork.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
