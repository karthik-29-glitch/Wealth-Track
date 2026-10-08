/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Stock,
  MutualFund,
  FixedDeposit,
  MonthlyRecord,
  ScreenshotRecord,
  ReportSettings,
  calculatePortfolioSummary,
} from './types/portfolio';
import {
  loadStoredData,
  saveStocks,
  saveMutualFunds,
  saveFixedDeposits,
  saveTeamMembers,
  saveMonthlyRecords,
  saveScreenshots,
  saveReportSettings,
  saveDemoActive,
  resetToDemoData,
  clearAllPortfolioData,
  sanitizeMembers,
} from './utils/storage';
import {
  INITIAL_STOCKS,
  INITIAL_MUTUAL_FUNDS,
  INITIAL_FIXED_DEPOSITS,
  DEFAULT_MEMBERS,
  INITIAL_MONTHLY_RECORDS,
  INITIAL_SCREENSHOTS,
  INITIAL_REPORT_SETTINGS,
} from './data/initialData';
import { Navbar, TabType } from './components/Navbar';
import { DisclaimerBanner, FooterDisclaimer } from './components/DisclaimerBanner';
import { Dashboard } from './components/Dashboard';
import { StockTable } from './components/StockTable';
import { MutualFundTable } from './components/MutualFundTable';
import { FixedDepositTable } from './components/FixedDepositTable';
import { InvestmentForm } from './components/InvestmentForm';
import { PortfolioAnalysis } from './components/PortfolioAnalysis';
import { MonthlyTracking } from './components/MonthlyTracking';
import { ScreenshotGallery } from './components/ScreenshotGallery';
import { ReportGenerator } from './components/ReportGenerator';
import { InvestmentDetailModal } from './components/InvestmentDetailModal';
import { Users, User, X, Check, Plus, Trash2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Stored state
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [teamMembers, setTeamMembers] = useState<string[]>(DEFAULT_MEMBERS);
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>([]);
  const [screenshots, setScreenshots] = useState<ScreenshotRecord[]>([]);
  const [reportSettings, setReportSettings] = useState<ReportSettings>(INITIAL_REPORT_SETTINGS);
  const [isDemoActive, setIsDemoActive] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Editing state for InvestmentForm
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [editingMf, setEditingMf] = useState<MutualFund | null>(null);
  const [editingFd, setEditingFd] = useState<FixedDeposit | null>(null);

  // Manage 4 Members Modal state
  const [showTeamModal, setShowTeamModal] = useState<boolean>(false);
  const [tempMembers, setTempMembers] = useState<string[]>(DEFAULT_MEMBERS);

  // Detail Modal state
  const [detailModal, setDetailModal] = useState<{
    item: Stock | MutualFund | FixedDeposit;
    type: 'stock' | 'mutual-fund' | 'fd';
  } | null>(null);

  // Load data on mount from localStorage
  useEffect(() => {
    const data = loadStoredData();
    const cleanMembers = sanitizeMembers(data.teamMembers || DEFAULT_MEMBERS);
    setStocks(data.stocks);
    setMutualFunds(data.mutualFunds);
    setFixedDeposits(data.fixedDeposits || INITIAL_FIXED_DEPOSITS);
    setTeamMembers(cleanMembers);
    setTempMembers(cleanMembers);
    setMonthlyRecords(data.monthlyRecords);
    setScreenshots(data.screenshots);
    setReportSettings(data.reportSettings);
    setIsDemoActive(data.isDemoActive);
    setIsLoaded(true);
  }, []);

  // Summary recalculation whenever stocks, mutual funds, or FDs change
  const summary = useMemo(() => {
    return calculatePortfolioSummary(stocks, mutualFunds, fixedDeposits);
  }, [stocks, mutualFunds, fixedDeposits]);

  // Stock handlers
  const handleSaveStock = (stock: Stock) => {
    const exists = stocks.some((s) => s.id === stock.id);
    let updated: Stock[];
    if (exists) {
      updated = stocks.map((s) => (s.id === stock.id ? stock : s));
    } else {
      updated = [stock, ...stocks];
    }
    setStocks(updated);
    saveStocks(updated);
    setEditingStock(null);
    setIsDemoActive(false);
    saveDemoActive(false);
    setActiveTab('stocks');
  };

  const handleDeleteStock = (id: string) => {
    const updated = stocks.filter((s) => s.id !== id);
    setStocks(updated);
    saveStocks(updated);
  };

  // Mutual Fund handlers
  const handleSaveMutualFund = (mf: MutualFund) => {
    const exists = mutualFunds.some((m) => m.id === mf.id);
    let updated: MutualFund[];
    if (exists) {
      updated = mutualFunds.map((m) => (m.id === mf.id ? mf : m));
    } else {
      updated = [mf, ...mutualFunds];
    }
    setMutualFunds(updated);
    saveMutualFunds(updated);
    setEditingMf(null);
    setIsDemoActive(false);
    saveDemoActive(false);
    setActiveTab('mutual-funds');
  };

  const handleDeleteMutualFund = (id: string) => {
    const updated = mutualFunds.filter((m) => m.id !== id);
    setMutualFunds(updated);
    saveMutualFunds(updated);
  };

  // Fixed Deposit handlers
  const handleSaveFixedDeposit = (fd: FixedDeposit) => {
    const exists = fixedDeposits.some((f) => f.id === fd.id);
    let updated: FixedDeposit[];
    if (exists) {
      updated = fixedDeposits.map((f) => (f.id === fd.id ? fd : f));
    } else {
      updated = [fd, ...fixedDeposits];
    }
    setFixedDeposits(updated);
    saveFixedDeposits(updated);
    setEditingFd(null);
    setIsDemoActive(false);
    saveDemoActive(false);
    setActiveTab('fd');
  };

  const handleDeleteFixedDeposit = (id: string) => {
    const updated = fixedDeposits.filter((f) => f.id !== id);
    setFixedDeposits(updated);
    saveFixedDeposits(updated);
  };

  // Monthly Tracking handlers
  const handleAddMonthly = (rec: MonthlyRecord) => {
    const updated = [...monthlyRecords, rec];
    setMonthlyRecords(updated);
    saveMonthlyRecords(updated);
  };

  const handleUpdateMonthly = (rec: MonthlyRecord) => {
    const updated = monthlyRecords.map((m) => (m.id === rec.id ? rec : m));
    setMonthlyRecords(updated);
    saveMonthlyRecords(updated);
  };

  const handleDeleteMonthly = (id: string) => {
    const updated = monthlyRecords.filter((m) => m.id !== id);
    setMonthlyRecords(updated);
    saveMonthlyRecords(updated);
  };

  // Screenshot handlers
  const handleAddScreenshot = (rec: ScreenshotRecord) => {
    const updated = [rec, ...screenshots];
    setScreenshots(updated);
    saveScreenshots(updated);
  };

  const handleDeleteScreenshot = (id: string) => {
    const updated = screenshots.filter((s) => s.id !== id);
    setScreenshots(updated);
    saveScreenshots(updated);
  };

  // Settings handler
  const handleUpdateSettings = (settings: ReportSettings) => {
    setReportSettings(settings);
    saveReportSettings(settings);
  };

  // Save Team Members handler
  const handleSaveTeamMembers = () => {
    const finalMembers = sanitizeMembers(tempMembers);
    setTeamMembers(finalMembers);
    setTempMembers(finalMembers);
    saveTeamMembers(finalMembers);

    // Also sync with reportSettings.teamMembers
    const updatedSettings: ReportSettings = {
      ...reportSettings,
      teamMembers: finalMembers,
      studentName: finalMembers[0] || reportSettings.studentName,
    };
    setReportSettings(updatedSettings);
    saveReportSettings(updatedSettings);

    setShowTeamModal(false);
  };

  // Reset & Clear handlers
  const handleResetDemo = () => {
    resetToDemoData();
    setStocks(INITIAL_STOCKS);
    setMutualFunds(INITIAL_MUTUAL_FUNDS);
    setFixedDeposits(INITIAL_FIXED_DEPOSITS);
    setTeamMembers(DEFAULT_MEMBERS);
    setTempMembers(DEFAULT_MEMBERS);
    setMonthlyRecords(INITIAL_MONTHLY_RECORDS);
    setScreenshots(INITIAL_SCREENSHOTS);
    setReportSettings(INITIAL_REPORT_SETTINGS);
    setIsDemoActive(true);
    setEditingStock(null);
    setEditingMf(null);
    setEditingFd(null);
  };

  const handleClearAll = () => {
    clearAllPortfolioData();
    setStocks([]);
    setMutualFunds([]);
    setFixedDeposits([]);
    setMonthlyRecords([]);
    setScreenshots([]);
    setIsDemoActive(false);
    setEditingStock(null);
    setEditingMf(null);
    setEditingFd(null);
  };

  // Edit triggers
  const handleEditStock = (stock: Stock) => {
    setEditingStock(stock);
    setEditingMf(null);
    setEditingFd(null);
    setActiveTab('entry-form');
  };

  const handleEditMutualFund = (mf: MutualFund) => {
    setEditingMf(mf);
    setEditingStock(null);
    setEditingFd(null);
    setActiveTab('entry-form');
  };

  const handleEditFixedDeposit = (fd: FixedDeposit) => {
    setEditingFd(fd);
    setEditingStock(null);
    setEditingMf(null);
    setActiveTab('entry-form');
  };

  const handleOpenAddForm = () => {
    setEditingStock(null);
    setEditingMf(null);
    setEditingFd(null);
    setActiveTab('entry-form');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading Investment Portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Financial Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'entry-form') {
            setEditingStock(null);
            setEditingMf(null);
            setEditingFd(null);
          }
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isDemoActive={isDemoActive}
        onResetDemo={handleResetDemo}
        onClearAll={handleClearAll}
        stocks={stocks}
        mutualFunds={mutualFunds}
        fixedDeposits={fixedDeposits}
        monthlyRecords={monthlyRecords}
        teamMembers={teamMembers}
        onOpenTeamModal={() => {
          setTempMembers([...teamMembers]);
          setShowTeamModal(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            summary={summary}
            stocks={stocks}
            mutualFunds={mutualFunds}
            fixedDeposits={fixedDeposits}
            members={teamMembers}
            isDemoActive={isDemoActive}
            setActiveTab={setActiveTab}
            onViewStock={(s) => setDetailModal({ item: s, type: 'stock' })}
            onViewMf={(m) => setDetailModal({ item: m, type: 'mutual-fund' })}
            onViewFd={(fd) => setDetailModal({ item: fd, type: 'fd' })}
          />
        )}

        {activeTab === 'stocks' && (
          <StockTable
            stocks={stocks}
            members={teamMembers}
            onAddStock={handleOpenAddForm}
            onEditStock={handleEditStock}
            onDeleteStock={handleDeleteStock}
            onViewDetails={(s) => setDetailModal({ item: s, type: 'stock' })}
          />
        )}

        {activeTab === 'mutual-funds' && (
          <MutualFundTable
            mutualFunds={mutualFunds}
            members={teamMembers}
            onAddMutualFund={handleOpenAddForm}
            onEditMutualFund={handleEditMutualFund}
            onDeleteMutualFund={handleDeleteMutualFund}
            onViewDetails={(mf) => setDetailModal({ item: mf, type: 'mutual-fund' })}
          />
        )}

        {activeTab === 'fd' && (
          <FixedDepositTable
            fixedDeposits={fixedDeposits}
            members={teamMembers}
            onAddFixedDeposit={handleOpenAddForm}
            onEditFixedDeposit={handleEditFixedDeposit}
            onDeleteFixedDeposit={handleDeleteFixedDeposit}
            onViewDetails={(fd) => setDetailModal({ item: fd, type: 'fd' })}
          />
        )}

        {activeTab === 'entry-form' && (
          <InvestmentForm
            initialStock={editingStock}
            initialMf={editingMf}
            initialFd={editingFd}
            members={teamMembers}
            mode={editingStock || editingMf || editingFd ? 'edit' : 'add'}
            onSaveStock={handleSaveStock}
            onSaveMutualFund={handleSaveMutualFund}
            onSaveFixedDeposit={handleSaveFixedDeposit}
            onDelete={(id, type) => {
              if (type === 'stock') handleDeleteStock(id);
              else if (type === 'mutual-fund') handleDeleteMutualFund(id);
              else handleDeleteFixedDeposit(id);
              setEditingStock(null);
              setEditingMf(null);
              setEditingFd(null);
              setActiveTab(type === 'stock' ? 'stocks' : type === 'mutual-fund' ? 'mutual-funds' : 'fd');
            }}
            onCancel={() => {
              setEditingStock(null);
              setEditingMf(null);
              setEditingFd(null);
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'analysis' && (
          <PortfolioAnalysis
            summary={summary}
            stocks={stocks}
            mutualFunds={mutualFunds}
            fixedDeposits={fixedDeposits}
            monthlyRecords={monthlyRecords}
            members={teamMembers}
          />
        )}

        {activeTab === 'monthly' && (
          <MonthlyTracking
            records={monthlyRecords}
            onAddRecord={handleAddMonthly}
            onUpdateRecord={handleUpdateMonthly}
            onDeleteRecord={handleDeleteMonthly}
          />
        )}

        {activeTab === 'screenshots' && (
          <ScreenshotGallery
            screenshots={screenshots}
            stocks={stocks}
            mutualFunds={mutualFunds}
            onAddScreenshot={handleAddScreenshot}
            onDeleteScreenshot={handleDeleteScreenshot}
          />
        )}

        {activeTab === 'report' && (
          <ReportGenerator
            summary={summary}
            stocks={stocks}
            mutualFunds={mutualFunds}
            fixedDeposits={fixedDeposits}
            monthlyRecords={monthlyRecords}
            screenshots={screenshots}
            settings={reportSettings}
            onUpdateSettings={handleUpdateSettings}
            members={teamMembers}
          />
        )}
      </main>

      {/* 4 Team Members Configuration Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-indigo-900 text-white p-6 relative">
              <button
                onClick={() => setShowTeamModal(false)}
                className="absolute top-5 right-5 text-indigo-300 hover:text-white p-1 rounded-lg hover:bg-indigo-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Users className="w-4 h-4" /> Team Configuration
              </div>
              <h3 className="text-xl font-bold">Manage 4 Team Members</h3>
              <p className="text-indigo-200 text-xs mt-1">
                Enter your project teammates' names. Each investment can then be attributed directly to its respective investor.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3">
                {tempMembers.map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        const updated = [...tempMembers];
                        updated[idx] = e.target.value;
                        setTempMembers(updated);
                      }}
                      placeholder={`Member ${idx + 1} Name`}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                    />
                    {tempMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setTempMembers(tempMembers.filter((_, i) => i !== idx));
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {tempMembers.length < 6 && (
                <button
                  type="button"
                  onClick={() => setTempMembers([...tempMembers, ''])}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 py-1"
                >
                  <Plus className="w-4 h-4" /> Add Another Member
                </button>
              )}

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
                <strong>Note:</strong> These member names will appear on the <strong>Cover Page</strong> of the generated 11-page report and in the investor selection dropdown when adding new Stocks, Mutual Funds, and Fixed Deposits.
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowTeamModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTeamMembers}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
              >
                <Check className="w-4 h-4" />
                <span>Save 4 Members</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Investment Details Lightbox Modal */}
      {detailModal && (
        <InvestmentDetailModal
          item={detailModal.item}
          type={detailModal.type}
          onClose={() => setDetailModal(null)}
          onEdit={(item, type) => {
            setDetailModal(null);
            if (type === 'stock') handleEditStock(item as Stock);
            else if (type === 'mutual-fund') handleEditMutualFund(item as MutualFund);
            else handleEditFixedDeposit(item as FixedDeposit);
          }}
        />
      )}

      {/* Bottom Footer & Compliance */}
      <FooterDisclaimer />
    </div>
  );
}
