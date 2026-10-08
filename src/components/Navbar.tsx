import React, { useState } from 'react';
import {
  TrendingUp,
  LayoutDashboard,
  Layers,
  Landmark,
  PieChart,
  Calendar,
  Image as ImageIcon,
  FileText,
  PlusCircle,
  RotateCcw,
  Trash2,
  Download,
  Menu,
  X,
  AlertTriangle,
  Sparkles,
  Users,
} from 'lucide-react';
import { Stock, MutualFund, FixedDeposit, MonthlyRecord } from '../types/portfolio';
import { exportFullPortfolioSummaryCSV } from '../utils/export';

export type TabType =
  | 'dashboard'
  | 'stocks'
  | 'mutual-funds'
  | 'fd'
  | 'entry-form'
  | 'analysis'
  | 'monthly'
  | 'screenshots'
  | 'report';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isDemoActive: boolean;
  onResetDemo: () => void;
  onClearAll: () => void;
  stocks: Stock[];
  mutualFunds: MutualFund[];
  fixedDeposits: FixedDeposit[];
  monthlyRecords: MonthlyRecord[];
  teamMembers: string[];
  onOpenTeamModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDemoActive,
  onResetDemo,
  onClearAll,
  stocks,
  mutualFunds,
  fixedDeposits,
  monthlyRecords,
  teamMembers,
  onOpenTeamModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const navLinks: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'stocks', label: 'Stocks', icon: <TrendingUp className="w-4 h-4" />, badge: stocks.length },
    { id: 'mutual-funds', label: 'Mutual Funds', icon: <Layers className="w-4 h-4" />, badge: mutualFunds.length },
    { id: 'fd', label: 'Fixed Deposits (FD)', icon: <Landmark className="w-4 h-4 text-amber-600" />, badge: fixedDeposits.length },
    { id: 'entry-form', label: 'Add Investment', icon: <PlusCircle className="w-4 h-4 text-blue-600" /> },
    { id: 'analysis', label: 'Analysis', icon: <PieChart className="w-4 h-4" /> },
    { id: 'monthly', label: 'Monthly Tracking', icon: <Calendar className="w-4 h-4" /> },
    { id: 'screenshots', label: 'Screenshots / Records', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'report', label: 'Portfolio Report', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print">
        {/* Top brand header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <span className="text-xl font-black">₹</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  Stock, MF &amp; FD Portfolio
                </h1>
                {isDemoActive ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                    <Sparkles className="w-3 h-3 text-amber-600" /> Demo Data
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                    Active Portfolio
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Personal &amp; Team (4 Members) Investment Tracking, Analysis &amp; Academic Report
              </p>
            </div>
          </div>

          {/* Quick utility controls */}
          <div className="flex items-center gap-2">
            {/* Team Members Button */}
            {onOpenTeamModal && (
              <button
                onClick={onOpenTeamModal}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors border border-indigo-200"
                title="Manage 4 Team Members"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>4 Members ({teamMembers.length})</span>
              </button>
            )}

            <button
              onClick={() => exportFullPortfolioSummaryCSV(stocks, mutualFunds, fixedDeposits, monthlyRecords)}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              title="Export complete portfolio to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowConfirmReset(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
              title="Reset sample investments"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>

            <button
              onClick={() => setShowConfirmClear(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              title="Clear all investments to start fresh"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 transition-all shadow-sm shadow-blue-600/30"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Report</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 hidden md:block">
          <nav className="flex items-center space-x-1 border-t border-slate-100 pt-1 pb-1 overflow-x-auto">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                  {typeof link.badge === 'number' && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {link.icon}
                    <span>{link.label}</span>
                  </div>
                  {typeof link.badge === 'number' && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {onOpenTeamModal && (
                <button
                  onClick={() => {
                    onOpenTeamModal();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 px-3 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200"
                >
                  Manage 4 Members ({teamMembers.length})
                </button>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowConfirmReset(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 text-center py-2 px-3 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50"
                >
                  Reset Demo Data
                </button>
                <button
                  onClick={() => {
                    setShowConfirmClear(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 text-center py-2 px-3 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50"
                >
                  Clear All Data
                </button>
              </div>
              <button
                onClick={() => {
                  exportFullPortfolioSummaryCSV(stocks, mutualFunds, fixedDeposits, monthlyRecords);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100"
              >
                Export CSV File
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Demo Data Notice Banner */}
      {isDemoActive && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-blue-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 no-print">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>
                <strong>Sample Demo Mode Active:</strong> You are currently viewing sample stock, mutual fund, and fixed deposit investments.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('entry-form')}
                className="font-bold underline text-blue-700 hover:text-blue-900"
              >
                + Add Your Own Investment
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => setShowConfirmClear(true)}
                className="font-semibold text-rose-600 hover:text-rose-800"
              >
                Clear Sample Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Resetting */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reset to Demo Data?</h3>
            <p className="text-sm text-slate-600 mb-6">
              This will reload the authentic demo stocks (Reliance, TCS, HDFC Bank, etc.), mutual funds, and fixed deposits (SBI, HDFC) across all 4 team members.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetDemo();
                  setShowConfirmReset(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                Yes, Reset Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clearing */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Clear All Investment Records?</h3>
            <p className="text-sm text-slate-600 mb-6">
              This will remove all stored stocks, mutual funds, and fixed deposits so you can enter your genuine portfolio from scratch. You can always reload the demo records later.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setShowConfirmClear(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
