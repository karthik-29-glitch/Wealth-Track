import React, { useState, useMemo } from 'react';
import {
  Landmark,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  Calendar,
  User,
  ShieldCheck,
} from 'lucide-react';
import {
  FixedDeposit,
  getFixedDepositMetrics,
  formatINR,
  formatPercent,
  formatIndianDate,
} from '../types/portfolio';
import { exportFixedDepositsToCSV } from '../utils/export';

interface FixedDepositTableProps {
  fixedDeposits: FixedDeposit[];
  members: string[];
  onAddFixedDeposit: () => void;
  onEditFixedDeposit: (fd: FixedDeposit) => void;
  onDeleteFixedDeposit: (id: string) => void;
  onDeleteAllFixedDeposits?: () => void;
  onViewDetails: (fd: FixedDeposit) => void;
}

export const FixedDepositTable: React.FC<FixedDepositTableProps> = ({
  fixedDeposits,
  members,
  onAddFixedDeposit,
  onEditFixedDeposit,
  onDeleteFixedDeposit,
  onDeleteAllFixedDeposits,
  onViewDetails,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState('ALL');
  const [selectedBank, setSelectedBank] = useState('ALL');
  const [sortBy, setSortBy] = useState<'currentValue' | 'interestRate' | 'principalAmount' | 'bankName'>('currentValue');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [deleteIdConfirm, setDeleteIdConfirm] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  // Unique banks list
  const banks = useMemo(() => {
    const set = new Set<string>();
    fixedDeposits.forEach((fd) => set.add(fd.bankName));
    return Array.from(set);
  }, [fixedDeposits]);

  const uniqueMembers = useMemo(() => {
    return Array.from(new Set(members.map((m) => m.trim()).filter(Boolean)));
  }, [members]);

  // Filter & sort
  const processedFDs = useMemo(() => {
    return fixedDeposits
      .filter((fd) => {
        const matchesSearch =
          fd.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (fd.accountNumber && fd.accountNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (fd.memberName && fd.memberName.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesMember = selectedMember === 'ALL' || fd.memberName === selectedMember;
        const matchesBank = selectedBank === 'ALL' || fd.bankName === selectedBank;
        return matchesSearch && matchesMember && matchesBank;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'currentValue') {
          diff = a.currentValue - b.currentValue;
        } else if (sortBy === 'principalAmount') {
          diff = a.principalAmount - b.principalAmount;
        } else if (sortBy === 'interestRate') {
          diff = a.interestRate - b.interestRate;
        } else if (sortBy === 'bankName') {
          diff = a.bankName.localeCompare(b.bankName);
        }
        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [fixedDeposits, searchQuery, selectedMember, selectedBank, sortBy, sortOrder]);

  // Totals
  const summary = useMemo(() => {
    let totalInvested = 0;
    let totalCurrent = 0;
    fixedDeposits.forEach((fd) => {
      totalInvested += fd.principalAmount;
      totalCurrent += fd.currentValue;
    });
    const totalProfit = totalCurrent - totalInvested;
    const returnPct = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
    return { totalInvested, totalCurrent, totalProfit, returnPct };
  }, [fixedDeposits]);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Landmark className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">Fixed Deposit (FD) Portfolio</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {fixedDeposits.length} Term Deposits
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Guaranteed capital preservation instruments across bank term deposits &amp; post office schemes with member tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {fixedDeposits.length > 0 && onDeleteAllFixedDeposits && (
              <button
                onClick={() => setShowDeleteAllConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                title="Delete all fixed deposits from portfolio"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete All FDs ({fixedDeposits.length})</span>
              </button>
            )}

            <button
              onClick={() => exportFixedDepositsToCSV(fixedDeposits)}
              disabled={fixedDeposits.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onAddFixedDeposit}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Fixed Deposit</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4 border-t border-slate-100">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by bank name, FD number, or member name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-50/50"
            />
          </div>

          {/* Filter by Member */}
          <div>
            <div className="flex items-center gap-1.5 bg-slate-50/50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full text-xs bg-transparent border-none focus:outline-hidden text-slate-700 truncate"
              >
                <option value="ALL">All Members ({uniqueMembers.length})</option>
                {uniqueMembers.map((m, idx) => (
                  <option key={`fd-member-${m}-${idx}`} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter by Bank */}
          <div>
            <div className="flex items-center gap-1.5 bg-slate-50/50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full text-xs bg-transparent border-none focus:outline-hidden text-slate-700 truncate"
              >
                <option value="ALL">All Banks ({banks.length})</option>
                {banks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSort('currentValue')}
              className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold border ${
                sortBy === 'currentValue'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Sort Value</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => toggleSort('interestRate')}
              className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold border ${
                sortBy === 'interestRate'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Sort Rate%</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main FD Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <th className="py-3.5 px-4">Bank / Institution</th>
                <th className="py-3.5 px-3">Investor / Member</th>
                <th className="py-3.5 px-3">FD / Account No.</th>
                <th className="py-3.5 px-3 whitespace-nowrap">Deposit Date</th>
                <th className="py-3.5 px-3 whitespace-nowrap">Maturity Date</th>
                <th className="py-3.5 px-3 text-right">Principal (₹)</th>
                <th className="py-3.5 px-3 text-right">Interest Rate</th>
                <th className="py-3.5 px-3 text-center">Tenure</th>
                <th className="py-3.5 px-3 text-right">Current / Maturity Value (₹)</th>
                <th className="py-3.5 px-3 text-right">Interest Earned (₹)</th>
                <th className="py-3.5 px-3 text-right">Return %</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedFDs.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No Fixed Deposit records found</p>
                    <p className="text-xs mt-1">Click &quot;Add Fixed Deposit&quot; to track safe return bank deposits.</p>
                  </td>
                </tr>
              ) : (
                processedFDs.map((fd) => {
                  const m = getFixedDepositMetrics(fd);
                  const isProfit = m.profitLoss >= 0;

                  return (
                    <tr
                      key={fd.id}
                      className="hover:bg-amber-50/40 transition-colors group cursor-pointer"
                      onClick={() => onViewDetails(fd)}
                    >
                      {/* Bank Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-amber-700 flex items-center gap-1.5">
                          <span>{fd.bankName}</span>
                          {fd.isDemo && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                              Demo
                            </span>
                          )}
                        </div>
                        {fd.notes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]" title={fd.notes}>
                            {fd.notes}
                          </div>
                        )}
                      </td>

                      {/* Member Name */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                          <User className="w-3 h-3 text-blue-500" />
                          <span>{fd.memberName || 'General'}</span>
                        </span>
                      </td>

                      {/* Account Number */}
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                        {fd.accountNumber || '-'}
                      </td>

                      {/* Deposit Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 font-medium">
                        {formatIndianDate(fd.depositDate)}
                      </td>

                      {/* Maturity Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 font-medium">
                        {formatIndianDate(fd.maturityDate)}
                      </td>

                      {/* Principal Amount */}
                      <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                        {formatINR(fd.principalAmount)}
                      </td>

                      {/* Interest Rate */}
                      <td className="py-3.5 px-3 text-right font-bold text-amber-700">
                        {fd.interestRate.toFixed(2)}% p.a.
                      </td>

                      {/* Tenure */}
                      <td className="py-3.5 px-3 text-center text-slate-600 font-medium">
                        {fd.tenureMonths} Mos
                      </td>

                      {/* Current Value */}
                      <td className="py-3.5 px-3 text-right font-bold text-amber-900">
                        {formatINR(m.currentValue)}
                      </td>

                      {/* Interest Earned */}
                      <td className="py-3.5 px-3 text-right">
                        <span className="font-bold inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                          +{formatINR(m.profitLoss)}
                        </span>
                      </td>

                      {/* Return % */}
                      <td className="py-3.5 px-3 text-right font-extrabold text-emerald-700">
                        {formatPercent(m.returnPercentage)}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onViewDetails(fd)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditFixedDeposit(fd)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit FD"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteIdConfirm(fd.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete FD"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Total Row */}
            {processedFDs.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-300 text-slate-900 text-xs">
                  <td colSpan={5} className="py-3 px-4 uppercase tracking-wider text-slate-700">
                    Total Fixed Deposits ({fixedDeposits.length})
                  </td>
                  <td className="py-3 px-3 text-right font-black text-slate-900">
                    {formatINR(summary.totalInvested)}
                  </td>
                  <td colSpan={2}></td>
                  <td className="py-3 px-3 text-right font-black text-amber-900">
                    {formatINR(summary.totalCurrent)}
                  </td>
                  <td className="py-3 px-3 text-right font-black">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      +{formatINR(summary.totalProfit)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-black text-emerald-700">
                    {formatPercent(summary.returnPct)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteIdConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Fixed Deposit Record?</h3>
            <p className="text-xs text-slate-600 mb-5">
              Are you sure you want to permanently delete this fixed deposit record?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteIdConfirm(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteFixedDeposit(deleteIdConfirm);
                  setDeleteIdConfirm(null);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
