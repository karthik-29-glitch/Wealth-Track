import React, { useState } from 'react';
import { X, TrendingUp, Layers, Landmark, Calendar, Shield, Edit3, ArrowUpRight, ArrowDownRight, User, Trash2 } from 'lucide-react';
import {
  Stock,
  MutualFund,
  FixedDeposit,
  getStockMetrics,
  getMutualFundMetrics,
  getFixedDepositMetrics,
  formatINR,
  formatPercent,
  formatReadableIndianDate,
} from '../types/portfolio';
import { RiskMeterGauge } from './Charts';

interface InvestmentDetailModalProps {
  item: Stock | MutualFund | FixedDeposit | null;
  type: 'stock' | 'mutual-fund' | 'fd';
  onClose: () => void;
  onEdit: (item: Stock | MutualFund | FixedDeposit, type: 'stock' | 'mutual-fund' | 'fd') => void;
  onDelete?: (id: string, type: 'stock' | 'mutual-fund' | 'fd') => void;
}

export const InvestmentDetailModal: React.FC<InvestmentDetailModalProps> = ({
  item,
  type,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!item) return null;

  const isStock = type === 'stock';
  const isMf = type === 'mutual-fund';
  const isFd = type === 'fd';

  const stock = isStock ? (item as Stock) : null;
  const mf = isMf ? (item as MutualFund) : null;
  const fd = isFd ? (item as FixedDeposit) : null;

  const stockMetrics = stock ? getStockMetrics(stock) : null;
  const mfMetrics = mf ? getMutualFundMetrics(mf) : null;
  const fdMetrics = fd ? getFixedDepositMetrics(fd) : null;

  const metrics = stockMetrics || mfMetrics || (fdMetrics ? {
    investedAmount: fdMetrics.principalAmount,
    currentValue: fdMetrics.currentValue,
    profitLoss: fdMetrics.interestEarned,
    returnPercentage: fdMetrics.returnPercentage,
  } : {
    investedAmount: 0,
    currentValue: 0,
    profitLoss: 0,
    returnPercentage: 0,
  });

  const isProfit = metrics.profitLoss >= 0;

  const getTitle = () => {
    if (isStock) return stock?.name;
    if (isMf) return mf?.name;
    return `${fd?.bankName} Fixed Deposit`;
  };

  const getSubtitle = () => {
    if (isStock) return `${stock?.company} • ${stock?.sector}`;
    if (isMf) return `${mf?.amc} • ${mf?.category}`;
    return `FD A/C: ${fd?.accountNumber || 'N/A'} • ${fd?.tenureMonths} Months tenure (${fd?.interestRate}% p.a.)`;
  };

  const purchaseOrDepositDate = isFd ? fd?.depositDate : (stock?.purchaseDate || mf?.purchaseDate || '');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                isStock
                  ? 'bg-blue-600/40 text-blue-300 border border-blue-500/40'
                  : isMf
                  ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-600/40 text-amber-300 border border-amber-500/40'
              }`}
            >
              {isStock ? 'Equity Stock' : isMf ? `Mutual Fund (${mf?.investmentType})` : 'Fixed Deposit (FD)'}
            </span>

            {/* Investor / Member Name Badge */}
            {item.memberName && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                <User className="w-3 h-3 text-indigo-300" />
                Investor: {item.memberName}
              </span>
            )}

            {item.isDemo && (
              <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                Demo Record
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold">{getTitle()}</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {getSubtitle()}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Value Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                {isFd ? 'Principal Deposited' : 'Invested Amount'}
              </span>
              <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                {formatINR(metrics.investedAmount)}
              </p>
              <span className="text-[11px] text-slate-400">
                {isStock
                  ? `${stock?.quantity} shares`
                  : isMf
                  ? `${mfMetrics?.units.toFixed(2)} units`
                  : `${fd?.interestRate}% interest`}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Current Valuation</span>
              <p className="text-base sm:text-lg font-bold text-blue-700 mt-1">
                {formatINR(metrics.currentValue)}
              </p>
              <span className="text-[11px] text-slate-400">
                {isStock
                  ? `@ ${formatINR(stock!.currentPrice)}/sh`
                  : isMf
                  ? `NAV ${formatINR(mf!.currentNav)}`
                  : `Matures: ${formatINR(fdMetrics?.estimatedMaturityAmount || 0)}`}
              </span>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isProfit ? 'bg-emerald-50/70 border-emerald-100' : 'bg-rose-50/70 border-rose-100'
              }`}
            >
              <span className="text-xs text-slate-500 font-medium">
                {isFd ? 'Accrued Interest' : 'Total Profit / Loss'}
              </span>
              <div className="flex items-center gap-1 mt-1">
                {isProfit ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <p className={`text-base sm:text-lg font-bold ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isProfit ? '+' : ''}{formatINR(metrics.profitLoss)}
                </p>
              </div>
              <span className={`text-[11px] font-semibold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatPercent(metrics.returnPercentage)}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                {isFd ? 'Deposit Date' : 'Purchase Date'}
              </span>
              <p className="text-sm sm:text-base font-bold text-slate-800 mt-1">
                {formatReadableIndianDate(purchaseOrDepositDate || '')}
              </p>
              <span className="text-[11px] text-slate-400">Indian DD-MM-YYYY</span>
            </div>
          </div>

          {/* Pricing & Units / FD Details */}
          <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              {isFd ? 'Fixed Deposit Contract Terms' : 'Transaction & Price Breakdown'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              {isStock ? (
                <>
                  <div>
                    <span className="text-slate-500">Buy Price:</span>
                    <p className="font-semibold text-slate-800 text-sm">{formatINR(stock!.buyPrice)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Current Market Price:</span>
                    <p className="font-semibold text-slate-800 text-sm">{formatINR(stock!.currentPrice)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Quantity (Shares):</span>
                    <p className="font-semibold text-slate-800 text-sm">{stock!.quantity}</p>
                  </div>
                </>
              ) : isMf ? (
                <>
                  <div>
                    <span className="text-slate-500">Purchase NAV:</span>
                    <p className="font-semibold text-slate-800 text-sm">{formatINR(mf!.purchaseNav)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Current NAV:</span>
                    <p className="font-semibold text-slate-800 text-sm">{formatINR(mf!.currentNav)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Allotted Units:</span>
                    <p className="font-semibold text-slate-800 text-sm">{mfMetrics?.units.toFixed(3)}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-slate-500">Bank / Institution:</span>
                    <p className="font-semibold text-slate-800 text-sm">{fd!.bankName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Interest Rate:</span>
                    <p className="font-semibold text-amber-700 text-sm">{fd!.interestRate}% p.a.</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Compounding:</span>
                    <p className="font-semibold text-slate-800 text-sm">{fd!.compoundingFrequency}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Tenure:</span>
                    <p className="font-semibold text-slate-800 text-sm">{fd!.tenureMonths} Months</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Maturity Date:</span>
                    <p className="font-semibold text-slate-800 text-sm">{formatReadableIndianDate(fd!.maturityDate)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Maturity Value:</span>
                    <p className="font-semibold text-emerald-700 text-sm">{formatINR(fdMetrics?.estimatedMaturityAmount || 0)}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Member & Risk Assessment */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Shield className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">Risk Assessment & Details</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Risk is classified as <strong className="text-slate-900">{item.riskLevel}</strong>.
                {isFd
                  ? ' Fixed deposits with scheduled commercial banks enjoy DICGC insurance guarantee up to ₹5 Lakhs per depositor.'
                  : ' Risk is calculated based on market volatility, asset class, and equity exposure.'}
              </p>
              {item.notes && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Notes &amp; Thesis:</span>
                  <p className="text-xs text-slate-700 italic">{item.notes}</p>
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <RiskMeterGauge level={item.riskLevel} />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(item, type);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-blue-700 bg-blue-100/70 hover:bg-blue-200 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit This {isStock ? 'Stock' : isMf ? 'Mutual Fund' : 'Fixed Deposit'}</span>
            </button>

            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-rose-700 bg-rose-100/70 hover:bg-rose-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete {isStock ? 'Stock' : isMf ? 'Fund' : 'FD'}</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Delete Confirmation Modal Overlay */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Delete {isStock ? 'Stock' : isMf ? 'Mutual Fund' : 'Fixed Deposit'}?
              </h3>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                Are you sure you want to permanently delete <strong>{getTitle()}</strong> from your portfolio? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDelete) {
                      onDelete(item.id, type);
                    }
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
