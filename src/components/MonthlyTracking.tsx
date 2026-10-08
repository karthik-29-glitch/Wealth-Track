import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Edit,
  TrendingUp,
  Download,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';
import { MonthlyRecord, formatINR } from '../types/portfolio';
import { MonthlyGrowthChart } from './Charts';
import { exportMonthlyTrackingToCSV } from '../utils/export';

interface MonthlyTrackingProps {
  records: MonthlyRecord[];
  onAddRecord: (record: MonthlyRecord) => void;
  onUpdateRecord: (record: MonthlyRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const MonthlyTracking: React.FC<MonthlyTrackingProps> = ({
  records,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [month, setMonth] = useState('');
  const [investmentAdded, setInvestmentAdded] = useState('');
  const [portfolioValue, setPortfolioValue] = useState('');
  const [profitLoss, setProfitLoss] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setMonth('');
    setInvestmentAdded('50000');
    setPortfolioValue('280000');
    setProfitLoss('15000');
    setNotes('');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (rec: MonthlyRecord) => {
    setEditingId(rec.id);
    setMonth(rec.month);
    setInvestmentAdded(String(rec.investmentAdded));
    setPortfolioValue(String(rec.portfolioValue));
    setProfitLoss(String(rec.profitLoss));
    setNotes(rec.notes || '');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!month.trim()) {
      setErrorMsg('Please enter a month (e.g. Nov-2025).');
      return;
    }
    const valAdded = parseFloat(investmentAdded);
    const valPort = parseFloat(portfolioValue);
    const valPL = parseFloat(profitLoss);

    if (isNaN(valAdded) || isNaN(valPort) || isNaN(valPL)) {
      setErrorMsg('Please enter valid numeric amounts.');
      return;
    }

    const newRecord: MonthlyRecord = {
      id: editingId || `month-${Date.now()}`,
      month: month.trim(),
      investmentAdded: valAdded,
      portfolioValue: valPort,
      profitLoss: valPL,
      notes: notes.trim(),
      isDemo: false,
    };

    if (editingId) {
      onUpdateRecord(newRecord);
    } else {
      onAddRecord(newRecord);
    }
    setShowModal(false);
  };

  // Monthly growth points
  const growthPoints = records.map((r) => ({
    month: r.month,
    value: r.portfolioValue,
    added: r.investmentAdded,
    profitLoss: r.profitLoss,
  }));

  const totalAdded = records.reduce((acc, r) => acc + r.investmentAdded, 0);
  const latestValue = records.length > 0 ? records[records.length - 1].portfolioValue : 0;
  const latestPL = records.length > 0 ? records[records.length - 1].profitLoss : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Calendar className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">Monthly Portfolio Tracking</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {records.length} Months Tracked
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Track your regular savings, fresh capital additions, and monthly portfolio growth milestones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportMonthlyTrackingToCSV(records)}
              disabled={records.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Month Record</span>
            </button>
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500">Cumulative Fresh Capital Added</span>
            <p className="text-base font-bold text-slate-900 mt-0.5">{formatINR(totalAdded)}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500">Latest Recorded Portfolio Value</span>
            <p className="text-base font-bold text-blue-700 mt-0.5">{formatINR(latestValue)}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500">Latest Recorded Profit / Loss</span>
            <p
              className={`text-base font-bold mt-0.5 ${
                latestPL >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {latestPL >= 0 ? '+' : ''}
              {formatINR(latestPL)}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Growth Line Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly Portfolio Growth Trend</h3>
            <p className="text-xs text-slate-500">Valuation progression over time (in ₹)</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            Compounding Curve
          </span>
        </div>
        <MonthlyGrowthChart records={growthPoints} height={240} />
      </div>

      {/* Monthly Records Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Monthly Records Log</h3>
          <span className="text-xs text-slate-400">All amounts in Indian Rupee (₹)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <th className="py-3.5 px-6">Month</th>
                <th className="py-3.5 px-4 text-right">Investment Added (₹)</th>
                <th className="py-3.5 px-4 text-right">Portfolio Value (₹)</th>
                <th className="py-3.5 px-4 text-right">Profit / Loss (₹)</th>
                <th className="py-3.5 px-6">Notes / Observations</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No monthly records entered yet. Click &quot;Add Month Record&quot; to start.
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const isProfit = r.profitLoss >= 0;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        {r.month}
                        {r.isDemo && (
                          <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            Demo
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                        {formatINR(r.investmentAdded)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-blue-700">
                        {formatINR(r.portfolioValue)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-bold inline-block px-2 py-0.5 rounded ${
                            isProfit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isProfit ? '+' : ''}
                          {formatINR(r.profitLoss)}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 italic max-w-xs truncate" title={r.notes}>
                        {r.notes || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete monthly tracking record for ${r.month}?`)) {
                                onDeleteRecord(r.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete record"
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
          </table>
        </div>
      </div>

      {/* Add / Edit Month Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingId ? 'Edit Monthly Record' : 'Add Monthly Record'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your monthly portfolio snapshot and incremental capital additions.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs">{errorMsg}</div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Month Identifier (e.g. Aug-2025, Sep-2025)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aug-2025"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Investment Added This Month (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 50000"
                  value={investmentAdded}
                  onChange={(e) => setInvestmentAdded(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Total Portfolio Value at Month End (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 260000"
                  value={portfolioValue}
                  onChange={(e) => setPortfolioValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Cumulative Profit / Loss (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 10000"
                  value={profitLoss}
                  onChange={(e) => setProfitLoss(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Notes / Observations (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly SIP executed; market rally in IT stocks"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
