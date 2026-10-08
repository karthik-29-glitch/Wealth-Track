import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  User,
} from 'lucide-react';
import {
  MutualFund,
  getMutualFundMetrics,
  formatINR,
  formatPercent,
  formatIndianDate,
} from '../types/portfolio';
import { exportMutualFundsToCSV } from '../utils/export';

interface MutualFundTableProps {
  mutualFunds: MutualFund[];
  members?: string[];
  onAddMutualFund: () => void;
  onEditMutualFund: (mf: MutualFund) => void;
  onDeleteMutualFund: (id: string) => void;
  onDeleteAllMutualFunds?: () => void;
  onViewDetails: (mf: MutualFund) => void;
}

export const MutualFundTable: React.FC<MutualFundTableProps> = ({
  mutualFunds,
  members = [],
  onAddMutualFund,
  onEditMutualFund,
  onDeleteMutualFund,
  onDeleteAllMutualFunds,
  onViewDetails,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedAmc, setSelectedAmc] = useState('ALL');
  const [sortBy, setSortBy] = useState<'profitLoss' | 'returnPercentage' | 'amountInvested' | 'name'>('profitLoss');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [deleteIdConfirm, setDeleteIdConfirm] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  // Available unique categories and AMCs
  const categories = useMemo(() => {
    const set = new Set<string>();
    mutualFunds.forEach((m) => set.add(m.category));
    return Array.from(set);
  }, [mutualFunds]);

  const amcs = useMemo(() => {
    const set = new Set<string>();
    mutualFunds.forEach((m) => set.add(m.amc));
    return Array.from(set);
  }, [mutualFunds]);

  const uniqueMembers = useMemo(() => {
    return Array.from(new Set(members.map((m) => m.trim()).filter(Boolean)));
  }, [members]);

  // Filtered and sorted
  const processedFunds = useMemo(() => {
    return mutualFunds
      .filter((mf) => {
        const matchesSearch =
          mf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mf.amc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mf.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (mf.memberName && mf.memberName.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesMember = selectedMember === 'ALL' || mf.memberName === selectedMember;
        const matchesCategory = selectedCategory === 'ALL' || mf.category === selectedCategory;
        const matchesAmc = selectedAmc === 'ALL' || mf.amc === selectedAmc;
        return matchesSearch && matchesMember && matchesCategory && matchesAmc;
      })
      .sort((a, b) => {
        const mA = getMutualFundMetrics(a);
        const mB = getMutualFundMetrics(b);

        let diff = 0;
        if (sortBy === 'profitLoss') {
          diff = mA.profitLoss - mB.profitLoss;
        } else if (sortBy === 'returnPercentage') {
          diff = mA.returnPercentage - mB.returnPercentage;
        } else if (sortBy === 'amountInvested') {
          diff = mA.investedAmount - mB.investedAmount;
        } else if (sortBy === 'name') {
          diff = a.name.localeCompare(b.name);
        }

        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [mutualFunds, searchQuery, selectedMember, selectedCategory, selectedAmc, sortBy, sortOrder]);

  // Summary totals for table
  const summary = useMemo(() => {
    let totalInvested = 0;
    let totalCurrent = 0;
    mutualFunds.forEach((mf) => {
      const m = getMutualFundMetrics(mf);
      totalInvested += m.investedAmount;
      totalCurrent += m.currentValue;
    });
    const totalPL = totalCurrent - totalInvested;
    const returnPct = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;
    return { totalInvested, totalCurrent, totalPL, returnPct };
  }, [mutualFunds]);

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
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Layers className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">Mutual Fund Portfolio</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {mutualFunds.length} Funds
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Systematic investment plans (SIP) &amp; lumpsum mutual fund holdings with member tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {mutualFunds.length > 0 && onDeleteAllMutualFunds && (
              <button
                onClick={() => setShowDeleteAllConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                title="Delete all mutual funds from portfolio"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete All Funds ({mutualFunds.length})</span>
              </button>
            )}

            <button
              onClick={() => exportMutualFundsToCSV(mutualFunds)}
              disabled={mutualFunds.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onAddMutualFund}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Mutual Fund</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search fund, AMC, member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
            />
          </div>

          {/* Member Filter */}
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
                  <option key={`mf-member-${m}-${idx}`} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 bg-slate-50/50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs bg-transparent border-none focus:outline-hidden text-slate-700 truncate"
              >
                <option value="ALL">All Categories ({mutualFunds.length})</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 bg-slate-50/50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedAmc}
                onChange={(e) => setSelectedAmc(e.target.value)}
                className="w-full text-xs bg-transparent border-none focus:outline-hidden text-slate-700 truncate"
              >
                <option value="ALL">All AMCs</option>
                {amcs.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSort('profitLoss')}
              className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold border ${
                sortBy === 'profitLoss'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Sort P/L</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => toggleSort('returnPercentage')}
              className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold border ${
                sortBy === 'returnPercentage'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Sort Return%</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <th className="py-3.5 px-4">Fund Name</th>
                <th className="py-3.5 px-3">Investor / Member</th>
                <th className="py-3.5 px-3">AMC</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-2.5 text-center">Type</th>
                <th className="py-3.5 px-3 whitespace-nowrap">Buy Date</th>
                <th className="py-3.5 px-3 text-right">Invested</th>
                <th className="py-3.5 px-3 text-right">Buy NAV</th>
                <th className="py-3.5 px-3 text-right">Units</th>
                <th className="py-3.5 px-3 text-right">Current NAV</th>
                <th className="py-3.5 px-3 text-right">Current Value</th>
                <th className="py-3.5 px-3 text-right">Profit / Loss</th>
                <th className="py-3.5 px-3 text-right">Return %</th>
                <th className="py-3.5 px-3 text-center">Risk</th>
                <th className="py-3.5 px-4 text-center sticky right-0 bg-slate-50 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedFunds.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No mutual funds found</p>
                    <p className="text-xs mt-1">Click &quot;Add Mutual Fund&quot; to track your SIP or lumpsum investment.</p>
                  </td>
                </tr>
              ) : (
                processedFunds.map((fund) => {
                  const m = getMutualFundMetrics(fund);
                  const isProfit = m.profitLoss >= 0;

                  return (
                    <tr
                      key={fund.id}
                      className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                      onClick={() => onViewDetails(fund)}
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-1.5">
                          <span>{fund.name}</span>
                          {fund.isDemo && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                              Demo
                            </span>
                          )}
                        </div>
                        {fund.notes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]" title={fund.notes}>
                            {fund.notes}
                          </div>
                        )}
                      </td>

                      {/* Member Name */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                          <User className="w-3 h-3 text-blue-500" />
                          <span>{fund.memberName || 'General'}</span>
                        </span>
                      </td>

                      {/* AMC */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                        {fund.amc}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-700 font-medium">
                          {fund.category}
                        </span>
                      </td>

                      {/* Type: SIP / Lumpsum */}
                      <td className="py-3.5 px-2.5 text-center">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            fund.investmentType === 'SIP'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {fund.investmentType}
                        </span>
                      </td>

                      {/* Purchase Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 font-medium">
                        {formatIndianDate(fund.purchaseDate)}
                      </td>

                      {/* Invested Amount */}
                      <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                        {formatINR(fund.amountInvested)}
                      </td>

                      {/* Purchase NAV */}
                      <td className="py-3.5 px-3 text-right text-slate-700 font-medium">
                        ₹{fund.purchaseNav.toFixed(2)}
                      </td>

                      {/* Units */}
                      <td className="py-3.5 px-3 text-right font-semibold text-slate-800">
                        {m.units.toFixed(2)}
                      </td>

                      {/* Current NAV */}
                      <td className="py-3.5 px-3 text-right text-slate-700 font-medium">
                        ₹{fund.currentNav.toFixed(2)}
                      </td>

                      {/* Current Value */}
                      <td className="py-3.5 px-3 text-right font-bold text-emerald-700">
                        {formatINR(m.currentValue)}
                      </td>

                      {/* Profit/Loss */}
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`font-bold inline-block px-2 py-0.5 rounded-md ${
                            isProfit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isProfit ? '+' : ''}
                          {formatINR(m.profitLoss)}
                        </span>
                      </td>

                      {/* Return % */}
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`font-extrabold ${
                            isProfit ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {formatPercent(m.returnPercentage)}
                        </span>
                      </td>

                      {/* Risk */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            fund.riskLevel === 'Low'
                              ? 'bg-emerald-100 text-emerald-800'
                              : fund.riskLevel === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {fund.riskLevel}
                        </span>
                      </td>

                      {/* Actions: Sticky Right Column */}
                      <td
                        className="py-3.5 px-4 text-center whitespace-nowrap sticky right-0 bg-white group-hover:bg-emerald-50/90 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onViewDetails(fund)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-100/60 transition-colors"
                            title="View full details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditMutualFund(fund)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-100/60 transition-colors"
                            title="Edit mutual fund"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteIdConfirm(fund.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 transition-colors"
                            title="Delete this mutual fund"
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
            {processedFunds.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-300 text-slate-900 text-xs">
                  <td colSpan={6} className="py-3 px-4 uppercase tracking-wider text-slate-700">
                    Total Mutual Funds ({mutualFunds.length})
                  </td>
                  <td className="py-3 px-3 text-right font-black text-slate-900">
                    {formatINR(summary.totalInvested)}
                  </td>
                  <td colSpan={3}></td>
                  <td className="py-3 px-3 text-right font-black text-emerald-700">
                    {formatINR(summary.totalCurrent)}
                  </td>
                  <td className="py-3 px-3 text-right font-black">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        summary.totalPL >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {summary.totalPL >= 0 ? '+' : ''}
                      {formatINR(summary.totalPL)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-black">
                    <span
                      className={summary.totalPL >= 0 ? 'text-emerald-700' : 'text-rose-700'}
                    >
                      {formatPercent(summary.returnPct)}
                    </span>
                  </td>
                  <td></td>
                  <td className="sticky right-0 bg-slate-100/80 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Delete Single Fund Confirmation Modal */}
      {deleteIdConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Mutual Fund Record?</h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900">
                {mutualFunds.find((f) => f.id === deleteIdConfirm)?.name || 'this mutual fund'}
              </strong>{' '}
              from your portfolio? This action cannot be undone.
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
                  onDeleteMutualFund(deleteIdConfirm);
                  setDeleteIdConfirm(null);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Funds Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete All Mutual Funds?</h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Are you sure you want to delete all <strong className="text-slate-900">{mutualFunds.length} mutual fund records</strong>? This will remove all your mutual fund holdings from tracking and reports.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteAllMutualFunds) {
                    onDeleteAllMutualFunds();
                  }
                  setShowDeleteAllConfirm(false);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
              >
                Delete All {mutualFunds.length} Funds
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
