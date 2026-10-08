import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  FileText,
  Edit,
  CheckCircle2,
  TrendingUp,
  Layers,
  Landmark,
  Sparkles,
  Award,
  BookOpen,
  Calendar,
  Shield,
  Lightbulb,
  Target,
  Users,
  User,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toCanvas } from 'html-to-image';
import {
  Stock,
  MutualFund,
  FixedDeposit,
  MonthlyRecord,
  ScreenshotRecord,
  ReportSettings,
  PortfolioSummary,
  formatINR,
  formatPercent,
  formatReadableIndianDate,
  getStockMetrics,
  getMutualFundMetrics,
  getFixedDepositMetrics,
} from '../types/portfolio';
import { DonutChart, CompareBarChart, RiskMeterGauge, MonthlyGrowthChart } from './Charts';
import { exportFullPortfolioSummaryCSV } from '../utils/export';

interface ReportGeneratorProps {
  summary: PortfolioSummary;
  stocks: Stock[];
  mutualFunds: MutualFund[];
  fixedDeposits: FixedDeposit[];
  monthlyRecords: MonthlyRecord[];
  screenshots: ScreenshotRecord[];
  settings: ReportSettings;
  onUpdateSettings: (settings: ReportSettings) => void;
  members?: string[];
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  summary,
  stocks,
  mutualFunds,
  fixedDeposits,
  monthlyRecords,
  screenshots,
  settings,
  onUpdateSettings,
  members = ['Karthik S B', 'Jay kumar S B', 'Sangamesh V B', 'Vishalakshi'],
}) => {
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [studentName, setStudentName] = useState(settings.studentName);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [institution, setInstitution] = useState(settings.institution);
  const [projectTitle, setProjectTitle] = useState(settings.projectTitle);
  const [investmentPeriod, setInvestmentPeriod] = useState(settings.investmentPeriod);

  const uniqueMembers: string[] = useMemo(() => {
    return Array.from(new Set(members.map((m) => m.trim()).filter(Boolean)));
  }, [members]);

  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number; title: string } | null>(null);
  const [pdfNotification, setPdfNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const PAGE_TITLES = [
    'Cover Page & Academic Sign-off',
    'Executive Summary & Objectives',
    'Portfolio Asset Allocation',
    'Stock Holdings Valuation',
    'Mutual Fund Holdings',
    'Bank Fixed Deposits (FD)',
    'Comparative Performance & Returns',
    'Risk Assessment & Volatility',
    'Monthly Portfolio Progress',
    'Screenshots & Verification Records',
    'Observations & Academic Conclusion',
  ];

  // Top stock, MF, and FD for case studies
  const topStock = stocks[0] || null;
  const topStockMetrics = topStock ? getStockMetrics(topStock) : null;

  const topMf = mutualFunds[0] || null;
  const topMfMetrics = topMf ? getMutualFundMetrics(topMf) : null;

  const topFd = fixedDeposits[0] || null;
  const topFdMetrics = topFd ? getFixedDepositMetrics(topFd) : null;

  const handleSelectMember = (name: string) => {
    setStudentName(name);
    onUpdateSettings({
      ...settings,
      studentName: name,
    });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    onUpdateSettings({
      ...settings,
      studentName: studentName.trim() || 'Karthik S B',
      academicYear: academicYear.trim() || '2026',
      institution: institution.trim() || 'Academic Portfolio Project',
      projectTitle: projectTitle.trim() || 'Stock, Mutual Fund & Fixed Deposit Portfolio',
      investmentPeriod: investmentPeriod.trim() || 'From: August 2025 → Ongoing',
    });
    setIsEditingSettings(false);
  };

  // Direct client-side 11-page PDF file download (.pdf)
  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfNotification(null);
    setPdfProgress({ current: 0, total: 11, title: 'Preparing high-resolution 11-page document...' });

    try {
      const pageElements = document.querySelectorAll<HTMLElement>('.report-page');
      if (pageElements.length === 0) {
        throw new Error('No report pages found to generate PDF.');
      }

      const totalPages = pageElements.length;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const pageRatio = pdfWidth / pdfHeight;

      for (let i = 0; i < totalPages; i++) {
        const pageEl = pageElements[i];
        const pageTitle = PAGE_TITLES[i] || `Page ${i + 1}`;

        setPdfProgress({
          current: i + 1,
          total: totalPages,
          title: pageTitle,
        });

        // Small yield to let browser update progress UI
        await new Promise((r) => setTimeout(r, 80));

        const canvas = await toCanvas(pageEl, {
          pixelRatio: 2, // 2x scale for sharp typography & charts
          backgroundColor: '#ffffff',
          cacheBust: true,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const canvasRatio = canvas.width / canvas.height;

        let renderWidth = pdfWidth;
        let renderHeight = pdfHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (canvasRatio > pageRatio) {
          renderWidth = pdfWidth;
          renderHeight = pdfWidth / canvasRatio;
          offsetY = (pdfHeight - renderHeight) / 2;
        } else {
          renderHeight = pdfHeight;
          renderWidth = pdfHeight * canvasRatio;
          offsetX = (pdfWidth - renderWidth) / 2;
        }

        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderWidth, renderHeight, undefined, 'FAST');
      }

      const safeStudentName = (settings.studentName || 'Student').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Portfolio_Report_${safeStudentName}.pdf`;

      pdf.save(filename);
      setIsGeneratingPdf(false);
      setPdfProgress(null);
      setPdfNotification({
        type: 'success',
        message: `Successfully generated and downloaded ${filename}! Check your Downloads folder.`,
      });
    } catch (err: unknown) {
      console.error('PDF generation error:', err);
      setIsGeneratingPdf(false);
      setPdfProgress(null);
      setPdfNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Could not generate PDF. Please try again.',
      });
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('window.print() restricted in iframe, starting direct PDF download instead:', err);
      handleDownloadPdf();
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Bar - Hidden during Print */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 no-print space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">Academic Portfolio Report Generator</h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                11 Pages &bull; Stocks + MFs + FDs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Formatted according to academic and college finance project standards. Complete with student details, stock tables, mutual fund tables, and bank fixed deposits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsEditingSettings(!isEditingSettings)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Edit className="w-3.5 h-3.5 text-slate-600" />
              <span>Edit Title &amp; Details</span>
            </button>

            <button
              onClick={() => exportFullPortfolioSummaryCSV(stocks, mutualFunds, fixedDeposits, monthlyRecords)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              title="Open browser print preview dialog"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Browser Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF (11 Pages)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status / Success / Error Notification */}
        {pdfNotification && (
          <div
            className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 no-print ${
              pdfNotification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : pdfNotification.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {pdfNotification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{pdfNotification.message}</span>
            </div>
            <button
              onClick={() => setPdfNotification(null)}
              className="text-xs font-bold opacity-60 hover:opacity-100 px-1 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1-Click Author / Prepared By Selector */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-700">Select Name to Print (Prepared by):</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {uniqueMembers.map((m, idx) => {
              const isSelected = settings.studentName === m;
              return (
                <button
                  key={`report-member-${m}-${idx}`}
                  onClick={() => handleSelectMember(m)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* Student metadata inline editor */}
        {isEditingSettings && (
          <form
            onSubmit={handleSaveSettings}
            className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
          >
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Prepared By / Student Name (Only this name will be printed)
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Karthik S B"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Quick select:</span>
                {uniqueMembers.map((m, idx) => (
                  <button
                    key={`quick-member-${m}-${idx}`}
                    type="button"
                    onClick={() => setStudentName(m)}
                    className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Institution / Department</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Investment Period</label>
              <input
                type="text"
                value={investmentPeriod}
                onChange={(e) => setInvestmentPeriod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Project Subtitle / Heading</label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsEditingSettings(false)}
                className="px-4 py-1.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700"
              >
                Save Details
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================
          PRINTABLE 11-PAGE ACADEMIC REPORT CONTAINER
          ======================================================== */}
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* =====================================================
            PAGE 1: COVER PAGE
            ===================================================== */}
        <div className="report-page bg-white rounded-2xl p-10 sm:p-14 shadow-lg border border-slate-200 flex flex-col justify-between min-h-[900px] text-center relative overflow-hidden">
          {/* Top Decorative Header */}
          <div className="pt-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-blue-700 via-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 mb-6">
              <span className="text-4xl font-black">₹</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase leading-snug">
              STOCK, MUTUAL FUND &amp; FD<br />
              <span className="text-blue-700">INVESTMENT PORTFOLIO</span>
            </h1>

            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 via-emerald-500 to-amber-500 mx-auto my-4 rounded-full" />

            <p className="text-base sm:text-lg font-semibold text-slate-600 tracking-wide">
              {settings.projectTitle}
            </p>
          </div>

          {/* Center Graphic: 3 Asset Pillars */}
          <div className="py-8 my-auto">
            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto text-slate-700">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mb-2 shadow-xs">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <span className="font-extrabold text-sm tracking-wide">Stocks</span>
                <span className="text-xs text-slate-500">Direct Equities</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-2 shadow-xs">
                  <Layers className="w-8 h-8" />
                </div>
                <span className="font-extrabold text-sm tracking-wide">Mutual Funds</span>
                <span className="text-xs text-slate-500">SIP &amp; Lumpsum</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-2 shadow-xs">
                  <Landmark className="w-8 h-8" />
                </div>
                <span className="font-extrabold text-sm tracking-wide">Fixed Deposits</span>
                <span className="text-xs text-slate-500">Bank FDs (7%+ p.a.)</span>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 text-xs font-bold tracking-widest uppercase text-slate-500">
              <span>Plan</span>
              <span className="text-blue-500">&bull;</span>
              <span>Invest</span>
              <span className="text-emerald-500">&bull;</span>
              <span>Grow</span>
              <span className="text-amber-500">&bull;</span>
              <span>Secure</span>
            </div>
          </div>

          {/* Bottom Project Sign-off: Prepared by Selected Student Only */}
          <div className="border-t border-slate-200 pt-6 pb-2 text-slate-700">
            <div className="space-y-1.5 max-w-xl mx-auto">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Prepared by:
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {settings.studentName}
              </p>
              <p className="text-xs font-medium text-slate-500">{settings.institution}</p>
              <p className="text-xs font-bold text-blue-700">Year: {settings.academicYear}</p>
            </div>
          </div>
        </div>

        {/* =====================================================
            PAGE 2: INTRODUCTION
            ===================================================== */}
        <div className="report-page bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-slate-200 flex flex-col justify-between min-h-[900px]">
          <div>
            {/* Header banner */}
            <div className="flex items-center justify-between border-b-2 border-blue-600 pb-3 mb-8">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">1. Introduction</h2>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Page 1</span>
            </div>

            <div className="space-y-6 text-sm text-slate-700">
              {/* 1.1 Purpose */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  1.1 Purpose of the Collaborative Portfolio Project
                </h3>
                <p className="text-slate-600 leading-relaxed pl-4">
                  To record, track, and analyze personal investments in direct equity stocks, mutual funds, and bank fixed deposits (FDs), understand relative financial performance, evaluate compounding mechanics, and instill disciplined capital management for {settings.studentName}.
                </p>
              </div>

              {/* 1.2 Investment Objective */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  1.2 Investment Objectives
                </h3>
                <ul className="space-y-2 pl-6 list-disc text-slate-600">
                  <li>Grow long-term wealth through equity appreciation and systematic mutual fund compounding.</li>
                  <li>Incorporate fixed deposits as a zero-drawdown risk hedge to safeguard capital against market volatility.</li>
                  <li>Diversify across Indian industry sectors (IT, Banking, Energy, FMCG, Pharma) and credit profiles.</li>
                  <li>Enable collaborative analysis and member-wise accountability across a 4-person student group.</li>
                </ul>
              </div>

              {/* 1.3 Investment Period */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  1.3 Investment Period
                </h3>
                <p className="text-slate-600 pl-4 font-semibold">
                  &bull; {settings.investmentPeriod}
                </p>
              </div>

              {/* 1.4 Types of Investments */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  1.4 Three Core Investment Asset Classes Covered
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-4 pt-1">
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                    <strong className="text-blue-900 block font-bold mb-1">Stocks (Direct Equities):</strong>
                    <span className="text-xs text-slate-600">
                      Bluechip market leaders including Reliance Industries, TCS, HDFC Bank, Infosys, and ITC held in demat accounts.
                    </span>
                  </div>
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                    <strong className="text-emerald-900 block font-bold mb-1">Mutual Funds (SIP &amp; Lumpsum):</strong>
                    <span className="text-xs text-slate-600">
                      Large Cap, Mid Cap, and Dynamic Hybrid funds managed by premier fund houses (SBI, HDFC, ICICI Prudential).
                    </span>
                  </div>
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
                    <strong className="text-amber-900 block font-bold mb-1">Fixed Deposits (FDs):</strong>
                    <span className="text-xs text-slate-600">
                      Scheduled commercial bank fixed deposits (SBI, HDFC Bank) earning guaranteed 7.10% – 7.25% p.a. interest.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inspirational Quote Card */}
          <div className="mt-8 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center gap-4 text-amber-900">
            <Lightbulb className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm italic">
                &ldquo;Small steps in disciplined investing today create colossal compounding results tomorrow.&rdquo;
              </p>
              <span className="text-xs text-amber-700">Financial Planning &amp; Wealth Principle</span>
            </div>
          </div>
        </div>

        {/* =====================================================
            PAGE 3: PORTFOLIO SUMMARY
            ===================================================== */}
        <div className="report-page bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-slate-200 flex flex-col justify-between min-h-[900px]">
          <div>
            <div className="flex items-center justify-between border-b-2 border-blue-600 pb-3 mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">2. Portfolio Summary</h2>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Page 2</span>
            </div>

            {/* Category Summary Table: Stocks, Mutual Funds, Fixed Deposits, Total */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Investment (₹)</th>
                    <th className="py-3 px-4 text-right">Current Value (₹)</th>
                    <th className="py-3 px-4 text-right">Profit / Interest (₹)</th>
                    <th className="py-3 px-4 text-right">Return (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Stocks (Equities)</td>
                    <td className="py-3 px-4 text-right">{formatINR(summary.stockInvested)}</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-700">{formatINR(summary.stockCurrentValue)}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      {summary.stockProfitLoss >= 0 ? '+' : ''}{formatINR(summary.stockProfitLoss)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      {formatPercent(summary.stockReturnPct)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Mutual Funds</td>
                    <td className="py-3 px-4 text-right">{formatINR(summary.mfInvested)}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">{formatINR(summary.mfCurrentValue)}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      {summary.mfProfitLoss >= 0 ? '+' : ''}{formatINR(summary.mfProfitLoss)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      {formatPercent(summary.mfReturnPct)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Fixed Deposits (FD)</td>
                    <td className="py-3 px-4 text-right">{formatINR(summary.fdInvested)}</td>
                    <td className="py-3 px-4 text-right font-bold text-amber-700">{formatINR(summary.fdCurrentValue)}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      +{formatINR(summary.fdProfitLoss)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      {formatPercent(summary.fdReturnPct)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                    <td className="py-3 px-4 uppercase tracking-wider text-slate-900 font-black">Consolidated Total</td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">{formatINR(summary.totalInvested)}</td>
                    <td className="py-3 px-4 text-right font-black text-blue-700">{formatINR(summary.totalCurrentValue)}</td>
                    <td className="py-3 px-4 text-right font-black text-emerald-700">
                      {summary.totalProfitLoss >= 0 ? '+' : ''}{formatINR(summary.totalProfitLoss)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-700">
                      {formatPercent(summary.overallReturnPct)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Donut Allocation Diagram: 3 Asset Classes */}
            <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200 mb-6">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 text-center">
                Portfolio Allocation (Equities vs Mutual Funds vs Fixed Deposits)
              </h4>
              <DonutChart
                data={[
                  { label: 'Stocks', value: summary.stockCurrentValue, color: '#2563eb', percent: summary.stockAllocationPct },
                  { label: 'Mutual Funds', value: summary.mfCurrentValue, color: '#10b981', percent: summary.mfAllocationPct },
                  { label: 'Fixed Deposits', value: summary.fdCurrentValue, color: '#f59e0b', percent: summary.fdAllocationPct },
                ]}
                size={190}
                centerText={formatINR(summary.totalCurrentValue)}
                centerSubtext="Total Value"
              />
            </div>

            {/* Key Highlights */}
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Key Highlights</h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <strong>Total Capital Invested:</strong> {formatINR(summary.totalInvested)} across {summary.stockCount} Stocks, {summary.mfCount} Mutual Funds, and {summary.fdCount} Fixed Deposits.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <strong>Current Valuation:</strong> {formatINR(summary.totalCurrentValue)}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <strong>Total Net Profit &amp; Interest:</strong> +{formatINR(summary.totalProfitLoss)} ({formatPercent(summary.overallReturnPct)} overall return).
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* =====================================================
            PAGE 4: STOCK DETAILS
            ===================================================== */}
        <div className="report-page bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-slate-200 flex flex-col justify-between min-h-[900px]">
          <div>
            <div className="flex items-center justify-between border-b-2 border-blue-600 pb-3 mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">3. Stock Details</h2>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Page 3</span>
            </div>

            {/* Complete Stock Table with Member Name */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="py-2.5 px-3">Stock</th>
                    <th className="py-2.5 px-2">Investor / Member</th>
                    <th className="py-2.5 px-2 whitespace-nowrap">Buy Date</th>
                    <th className="py-2.5 px-2 text-right">Qty</th>
                    <th className="py-2.5 px-2 text-right">Buy (₹)</th>
                    <th className="py-2.5 px-2 text-right">Invested (₹)</th>
                    <th className="py-2.5 px-2 text-right">Current (₹)</th>
                    <th className="py-2.5 px-2 text-right">Value (₹)</th>
                    <th className="py-2.5 px-2 text-right">P/L (₹)</th>
                    <th className="py-2.5 px-2 text-right">Return (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                  {stocks.map((s) => {
                    const m = getStockMetrics(s);
                    return (
                      <tr key={s.id}>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{s.name}</td>
                        <td className="py-2.5 px-2 text-indigo-700 font-semibold">{s.memberName || 'Team'}</td>
                        <td className="py-2.5 px-2 whitespace-nowrap text-slate-600">{formatReadableIndianDate(s.purchaseDate)}</td>
                        <td className="py-2.5 px-2 text-right">{s.quantity}</td>
                        <td className="py-2.5 px-2 text-right">{s.buyPrice.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-2 text-right font-semibold">{m.investedAmount.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-2 text-right">{s.currentPrice.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-2 text-right font-bold text-blue-700">{m.currentValue.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-2 text-right font-semibold text-emerald-700">
                          {m.profitLoss >= 0 ? '+' : ''}{m.profitLoss.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-emerald-700">
                          {m.returnPercentage.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td colSpan={5} className="py-2.5 px-3 uppercase tracking-wider text-slate-900 font-black">Stock Total</td>
                    <td className="py-2.5 px-2 text-right font-black">{summary.stockInvested.toLocaleString('en-IN')}</td>
                    <td></td>
                    <td className="py-2.5 px-2 text-right font-black text-blue-700">{summary.stockCurrentValue.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2 text-right font-black text-emerald-700">
                      +{summary.stockProfitLoss.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-2 text-right font-black text-emerald-700">
                      {summary.stockReturnPct.toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Stock-wise Case Analysis */}
            {topStock && (
              <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-200">
                <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-3">
                  Stock Case Analysis: {topStock.name} (Investor: {topStock.memberName})
                </h4>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-blue-100">
                    <span className="font-semibold text-slate-500">&bull; Sector:</span>
                    <span className="col-span-2 font-medium text-slate-900">{topStock.sector}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-blue-100">
                    <span className="font-semibold text-slate-500">&bull; Selected Thesis:</span>
                    <span className="col-span-2 text-slate-800">{topStock.notes || 'Strong brand, consistent growth, and high market capitalization.'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-blue-100">
                    <span className="font-semibold text-slate-500">&bull; Purchase Details:</span>
                    <span className="col-span-2 font-medium text-slate-800">
                      {topStock.quantity} shares @ {formatINR(topStock.buyPrice)} on {formatReadableIndianDate(topStock.purchaseDate)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-blue-100">
                    <span className="font-semibold text-slate-500">&bull; Performance Yield:</span>
                    <span className="col-span-2 font-bold text-emerald-700">
                      +{formatINR(topStockMetrics?.profitLoss || 0)} ({topStockMetrics?.returnPercentage.toFixed(2)}% return)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1">
                    <span className="font-semibold text-slate-500">&bull; Risk Assessment:</span>
                    <span className="col-span-2 font-bold text-blue-700">{topStock.riskLevel} Risk</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            PAGE 5: MUTUAL FUND DETAILS
            ===================================================== */}
        <div className="report-page bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-slate-200 flex flex-col justify-between min-h-[900px]">
          <div>
            <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-3 mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">4. Mutual Fund Details</h2>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Page 4</span>
            </div>

            {/* Complete MF Table with Member Name */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="py-2.5 px-3">Fund Name</th>
                    <th className="py-2.5 px-2">Investor / Member</th>
                    <th className="py-2.5 px-2">Category</th>
                    <th className="py-2.5 px-2">AMC</th>
                    <th className="py-2.5 px-2 text-right">Invested (₹)</th>
                    <th className="py-2.5 px-2 text-right">Current Value (₹)</th>
                    <th className="py-2.5 px-2 text-right">P/L (₹)</th>
                    <th className="py-2.5 px-2 text-right">Return (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                  {mutualFunds.map((mf) => {
                    const m = getMutualFundMetrics(mf);
                    return (
                      <tr key={mf.id}>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{mf.name}</td>
                        <td className="py-2.5 px-2 text-indigo-700 font-semibold">{mf.memberName || 'Team'}</td>
                        <td className="py-2.5 px-2 text-slate-600">{mf.category}</td>
                        <td className="py-2.5 px-2 text-slate-600">{mf.amc}</td>
                        <td className="py-2.5 px-2 text-right font-semibold">{mf.amountInvested.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-2 text-right font-bold text-emerald-700">{m.currentValue.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-2 text-right font-semibold text-emerald-700">
                          +{m.profitLoss.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-emerald-700">
                          {m.returnPercentage.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td colSpan={4} className="py-2.5 px-3 uppercase tracking-wider text-slate-900 font-black">MF Total</td>
                    <td className="py-2.5 px-2 text-right font-black">{summary.mfInvested.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2 text-right font-black text-emerald-700">{summary.mfCurrentValue.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2 text-right font-black text-emerald-700">
                      +{summary.mfProfitLoss.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-2 text-right font-black text-emerald-700">
                      {summary.mfReturnPct.toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Fund-wise Case Analysis */}
            {topMf && (
              <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-200">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-3">
                  Mutual Fund Analysis: {topMf.name} (Investor: {topMf.memberName})
                </h4>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-emerald-100">
                    <span className="font-semibold text-slate-500">&bull; AMC:</span>
                    <span className="col-span-2 font-medium text-slate-900">{topMf.amc}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-emerald-100">
                    <span className="font-semibold text-slate-500">&bull; Category:</span>
                    <span className="col-span-2 text-slate-800">{topMf.category}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-emerald-100">
                    <span className="font-semibold text-slate-500">&bull; Amount Invested:</span>
                    <span className="col-span-2 font-bold text-slate-900">{formatINR(topMf.amountInvested)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-emerald-100">
                    <span className="font-semibold text-slate-500">&bull; Allotted Units:</span>
                    <span className="col-span-2 font-bold text-slate-900">{topMfMetrics?.units.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-emerald-100">
                    <span className="font-semibold text-slate-500">&bull; Profit / Loss:</span>
                    <span className="col-span-2 font-bold text-emerald-700">
                      +{formatINR(topMfMetrics?.profitLoss || 0)} ({topMfMetrics?.returnPercentage.toFixed(2)}% return)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1">
                    <span className="font-semibold text-slate-500">&bull; Observation:</span>
                    <span className="col-span-2 text-slate-800">Excellent compound growth with institutional risk diversification.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            PAGE 6: FIXED DEPOSIT DETAILS (NEW ASSET PILLAR)
            ===================================================== */}
        <div className="report-page bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-slate-200 flex flex-col justify-between min-h-[900px]">
          <div>
            <div className="flex items-center justify-between border-b-2 border-amber-500 pb-3 mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">5. Fixed Deposit (FD) Details</h2>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Page 5</span>
            </div>

            {/* Complete FD Table with Member Name */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="py-2.5 px-3">Bank / Institution</th>
                    <th className="py-2.5 px-2">Investor / Member</th>
                    <th className="py-2.5 px-2 whitespace-nowrap">Deposit Date</th>
                    <th className="py-2.5 px-2 text-right">Tenure</th>
                    <th className="py-2.5 px-2 text-right">Rate (% p.a.)</th>
                    <th className="py-2.5 px-2 text-right">Principal (₹)</th>
                    <th className="py-2.5 px-2 text-right">Current Value (₹)</th>
                    <th className="py-2.5 px-2 text-right">Accrued Interest (₹)</th>
                    <th className="py-2.5 px-2 text-right">Maturity Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                  {fixedDeposits.map((fd) => {
                    const m = getFixedDepositMetrics(fd);
                    return (
                      <tr key={fd.id}>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{fd.bankName}</td>
                        <td className="py-2.5 px-2 text-indigo-700 font-semibold">{fd.memberName || 'Team'}</td>
                        <td className="py-2.5 px-2 whitespace-nowrap text-slate-600">{formatReadableIndianDate(fd.depositDate)}</td>
                        <td className="py-2.5 px-2 text-right">{fd.tenureMonths} Mo</td>
                        <td className="py-2.5 px-2 text-right font-bold text-amber-700">{fd.interestRate}%</td>
                        <td className="py-2.5 px-2 text-right font-semibold">{fd.principalAmount.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-2 text-right font-bold text-amber-700">{m.currentValue.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-2 text-right font-bold text-emerald-700">
                          +{m.interestEarned.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-600">{formatReadableIndianDate(fd.maturityDate)}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td colSpan={5} className="py-2.5 px-3 uppercase tracking-wider text-slate-900 font-black">FD Total</td>
                    <td className="py-2.5 px-2 text-right font-black">{summary.fdInvested.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2 text-right font-black text-amber-700">{summary.fdCurrentValue.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2 text-right font-black text-emerald-700">
                      +{summary.fdProfitLoss.toLocaleString('en-IN')}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* FD Case Analysis */}
            {topFd && (
              <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-200">
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-3">
                  Fixed Deposit Analysis: {topFd.bankName} (Investor: {topFd.memberName})
                </h4>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-amber-100">
                    <span className="font-semibold text-slate-500">&bull; Principal Deposited:</span>
                    <span className="col-span-2 font-bold text-slate-900">{formatINR(topFd.principalAmount)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-amber-100">
                    <span className="font-semibold text-slate-500">&bull; Interest Rate &amp; Compounding:</span>
                    <span className="col-span-2 font-medium text-slate-800">
                      {topFd.interestRate}% p.a. ({topFd.compoundingFrequency} compounding)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-amber-100">
                    <span className="font-semibold text-slate-500">&bull; Expected Maturity Value:</span>
                    <span className="col-span-2 font-bold text-emerald-700">
                      {formatINR(topFdMetrics?.estimatedMaturityAmount || 0)} on {formatReadableIndianDate(topFd.maturityDate)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-amber-100">
                    <span className="font-semibold text-slate-500">&bull; Risk Classification:</span>
                    <span className="col-span-2 font-bold text-emerald-700">
                      Low Risk (Insured up to ₹5 Lakhs under RBI's DICGC guarantee scheme)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1">
                    <span className="font-semibold text-slate-500">&bull; Strategic Value:</span>
                    <span className="col-span-2 text-slate-800">
                      Provides guaranteed liquid capital and steady yield, protecting overall team portfolio health.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            PAGE 7: CHARTS & GRAPHS
            ===================================================== */}
        <div className="report-page bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-slate-200 flex flex-col justify-between min-h-[900px]">
          <div>
            <div className="flex items-center justify-between border-b-2 border-blue-600 pb-3 mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">6. Charts &amp; Graphs</h2>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Page 6</span>
            </div>

            {/* Visual Grid: 3 asset classes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Chart A: Investment Allocation Donut */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 text-center">
                  Asset Allocation (3 Pillars)
                </h4>
                <DonutChart
                  data={[
                    { label: 'Stocks', value: summary.stockCurrentValue, color: '#2563eb', percent: summary.stockAllocationPct },
                    { label: 'Mutual Funds', value: summary.mfCurrentValue, color: '#10b981', percent: summary.mfAllocationPct },
                    { label: 'Fixed Deposits', value: summary.fdCurrentValue, color: '#f59e0b', percent: summary.fdAllocationPct },
                  ]}
                  size={180}
                  centerText={formatINR(summary.totalCurrentValue)}
                  centerSubtext="Total Portfolio"
                />
              </div>

              {/* Chart B: Portfolio Growth Bar */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 text-center">
                  Valuation Comparison by Asset Class
                </h4>
                <CompareBarChart
                  items={[
                    { label: 'Stocks', invested: summary.stockInvested, current: summary.stockCurrentValue },
                    { label: 'Mutual Funds', invested: summary.mfInvested, current: summary.mfCurrentValue },
                    { label: 'Fixed Deposits', invested: summary.fdInvested, current: summary.fdCurrentValue },
                    { label: 'Total', invested: summary.totalInvested, current: summary.totalCurrentValue },
                  ]}
                  height={190}
                />
              </div>
            </div>

            {/* Trend Graphs: Monthly Growth */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 text-center">
                Portfolio Valuation Progression
              </h4>
              <MonthlyGrowthChart
                records={monthlyRecords.map((r) => ({
                  month: r.month,
                  value: r.portfolioValue,
                  added: r.investmentAdded,
                  profitLoss: r.profitLoss,
                }))}
                height={200}
              />
            </div>
          </div>
        </div>

        {/* =====================================================
            PAGE 8: PORTFOLIO ANALYSIS
            ===================================================== */}
        <div className="report-page bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-slate-200 flex flex-col justify-between min-h-[900px]">
          <div>
            <div className="flex items-center justify-between border-b-2 border-blue-600 pb-3 mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">7. Portfolio Analysis</h2>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Page 7</span>
            </div>

            {/* Split row: Allocation & Total Profit/Loss */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Asset Distribution</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">&bull; Stocks (Equities):</span>
                    <span className="font-bold text-slate-900">
                      {summary.stockAllocationPct.toFixed(1)}% ({formatINR(summary.stockCurrentValue)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">&bull; Mutual Funds:</span>
                    <span className="font-bold text-slate-900">
                      {summary.mfAllocationPct.toFixed(1)}% ({formatINR(summary.mfCurrentValue)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">&bull; Fixed Deposits (FDs):</span>
                    <span className="font-bold text-amber-700">
                      {summary.fdAllocationPct.toFixed(1)}% ({formatINR(summary.fdCurrentValue)})
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2">Total Net Profit &amp; Interest</h4>
                <div className="text-2xl font-black text-emerald-700">
                  +{formatINR(summary.totalProfitLoss)}
                </div>
                <div className="text-xs font-bold text-emerald-700 mt-1">
                  ({formatPercent(summary.overallReturnPct)} overall portfolio yield)
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Key Strategic Insights</h4>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Fixed deposits provide an unshakeable stability anchor, preventing portfolio drawdown during market volatility.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Mutual funds offer consistent compound growth through professional institutional asset allocation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Direct equities generate high upside alpha across premier IT, Banking, and Energy enterprises.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>The 4-member cooperative tracking structure fosters collaborative risk management and financial accountability.</span>
                </li>
              </ul>
            </div>

            {/* Risk Level Gauge & Goal Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50/70 p-5 rounded-xl border border-slate-200">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Portfolio Risk Rating</h4>
                <RiskMeterGauge level="Moderate" />
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5 text-blue-700">
                  <Target className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Academic Portfolio Objective</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {settings.goalStatement}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            PAGE 9: MONTHLY TRACKING
            ===================================================== */}
        <div className="report-page bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-slate-200 flex flex-col justify-between min-h-[900px]">
          <div>
            <div className="flex items-center justify-between border-b-2 border-blue-600 pb-3 mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">8. Monthly Tracking</h2>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Page 8</span>
            </div>

            {/* Monthly Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                    <th className="py-3 px-4">Month</th>
                    <th className="py-3 px-4 text-right">Investment Added (₹)</th>
                    <th className="py-3 px-4 text-right">Portfolio Value (₹)</th>
                    <th className="py-3 px-4 text-right">Profit / Loss (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {monthlyRecords.map((r) => (
                    <tr key={r.id}>
                      <td className="py-3 px-4 font-bold text-slate-900">{r.month}</td>
                      <td className="py-3 px-4 text-right">{r.investmentAdded.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-bold text-blue-700">{r.portfolioValue.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        +{r.profitLoss.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Monthly Portfolio Value Bar Chart */}
            <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 text-center">
                Monthly Portfolio Value Growth (₹)
              </h4>
              <div className="flex items-end justify-around gap-6 h-56 pt-6 pb-2 border-b border-slate-200">
                {monthlyRecords.map((m, idx) => {
                  const maxV = Math.max(...monthlyRecords.map((r) => r.portfolioValue), 350000);
                  const barH = Math.max(30, (m.portfolioValue / maxV) * 160);
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <span className="text-[11px] font-bold text-slate-800 mb-1.5">
                        {formatINR(m.portfolioValue, { decimals: 0 })}
                      </span>
                      <div
                        className="w-14 sm:w-20 bg-blue-600 rounded-t-lg transition-all"
                        style={{ height: `${barH}px` }}
                      />
                      <span className="text-xs font-semibold text-slate-700 mt-2">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            PAGE 10: SCREENSHOTS / INVESTMENT RECORDS
            ===================================================== */}
        <div className="report-page bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-slate-200 flex flex-col justify-between min-h-[900px]">
          <div>
            <div className="flex items-center justify-between border-b-2 border-blue-600 pb-3 mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">9. Screenshots &amp; Investment Records</h2>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Page 9</span>
            </div>

            <p className="text-xs text-slate-600 mb-5">
              Verified demat account holdings, mutual fund platform statements, and bank fixed deposit certificates attached for academic review and portfolio audit.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Demat Screen Visual Mock Card */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-slate-900 text-white p-3 text-xs font-bold flex justify-between items-center">
                  <span>Demat Account (Direct Stocks)</span>
                  <span className="text-[10px] text-blue-300 font-medium">Verified Broker</span>
                </div>
                <div className="bg-slate-950 p-4 text-white text-xs space-y-2">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Total Stock Valuation</span>
                    <span className="text-lg font-bold text-white">₹1,12,500</span>
                    <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">+₹12,500 (+12.50%)</span>
                  </div>
                  <div className="p-2 bg-slate-900/70 rounded flex justify-between">
                    <span>RELIANCE (5 Qty)</span>
                    <span className="text-emerald-400 font-semibold">₹14,750 (+5.36%)</span>
                  </div>
                  <div className="p-2 bg-slate-900/70 rounded flex justify-between">
                    <span>TCS (3 Qty)</span>
                    <span className="text-emerald-400 font-semibold">₹11,250 (+7.14%)</span>
                  </div>
                  <div className="p-2 bg-slate-900/70 rounded flex justify-between">
                    <span>HDFC BANK (4 Qty)</span>
                    <span className="text-emerald-400 font-semibold">₹6,880 (+7.50%)</span>
                  </div>
                </div>
              </div>

              {/* Bank FD & MF Screen Visual Mock Card */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-emerald-950 text-white p-3 text-xs font-bold flex justify-between items-center">
                  <span>Mutual Funds &amp; Bank Fixed Deposits</span>
                  <span className="text-[10px] text-emerald-300 font-medium">Bank &amp; MF Statement</span>
                </div>
                <div className="bg-slate-50 p-4 text-xs space-y-2">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-500 block">MF &amp; FD Combined Worth</span>
                    <span className="text-lg font-bold text-slate-900">₹2,55,900</span>
                    <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">+₹25,900 Accrued/Gain</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                    <span className="font-semibold text-slate-800">SBI Bluechip Fund</span>
                    <span className="text-emerald-600 font-bold">₹58,500 (+17.00%)</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                    <span className="font-semibold text-slate-800">State Bank of India (FD)</span>
                    <span className="text-amber-600 font-bold">₹52,700 (7.10% p.a.)</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                    <span className="font-semibold text-slate-800">HDFC Bank Limited (FD)</span>
                    <span className="text-amber-600 font-bold">₹32,200 (7.25% p.a.)</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center italic mt-6">
              (Screenshots and statements attached for academic project record and financial verification purposes)
            </p>
          </div>
        </div>

        {/* =====================================================
            PAGE 11: LEARNING, OBSERVATIONS & CONCLUSION
            ===================================================== */}
        <div className="report-page bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-slate-200 flex flex-col justify-between min-h-[900px]">
          <div>
            <div className="flex items-center justify-between border-b-2 border-blue-600 pb-3 mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">10. Learning, Observations &amp; Conclusion</h2>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Page 10</span>
            </div>

            {/* What I Learned */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Key Learnings
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700 pl-2">
                {settings.learningNotes.map((note, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0 mt-1.5"></span>
                    <p className="leading-relaxed">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* My Observations */}
            <div className="mb-4 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Team Observations
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700 pl-2">
                {settings.observations.map((obs, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0 mt-1.5"></span>
                    <p className="leading-relaxed">{obs}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Conclusion & Future Plans */}
            <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Future Investment Strategy
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Increase monthly systematic SIP contributions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Maintain emergency buffer in high-yield FDs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Analyze quarterly balance sheets and macroeconomic trends</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Harness multi-decade compound interest</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thank You & 4 Member Authors Stamp */}
          <div className="border-t border-slate-200 pt-6 text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-blue-900 italic tracking-tight">
              Thank You!
            </h2>
            <div className="flex items-center justify-center gap-4 text-xs font-bold tracking-widest uppercase text-slate-400">
              <span>Invest</span>
              <span className="text-blue-500">&bull;</span>
              <span>Learn</span>
              <span className="text-emerald-500">&bull;</span>
              <span>Grow</span>
              <span className="text-amber-500">&bull;</span>
              <span>Prosper</span>
            </div>

            {/* Student Sign-Off: Only Selected Student */}
            <div className="pt-3 max-w-xl mx-auto border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
              <div className="text-center sm:text-left">
                <span className="block font-bold text-slate-900 text-sm">
                  {settings.studentName}
                </span>
                <span className="text-[11px] text-slate-400">Prepared by &bull; {settings.institution}</span>
              </div>
              <div className="text-center sm:text-right">
                <span className="block font-semibold text-slate-700">Project Year: {settings.academicYear}</span>
                <span className="text-[11px] text-emerald-600 font-bold">Academic Portfolio Report</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Progress Modal during PDF Generation */}
      {isGeneratingPdf && pdfProgress && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-md w-full space-y-4 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Generating 11-Page Academic PDF
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {pdfProgress.current > 0
                  ? `Rendering Page ${pdfProgress.current} of ${pdfProgress.total}`
                  : 'Starting generation...'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((pdfProgress.current / pdfProgress.total) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                <span className="truncate max-w-[260px] text-slate-600 font-semibold">{pdfProgress.title}</span>
                <span>{Math.round((pdfProgress.current / pdfProgress.total) * 100)}%</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Capturing high-resolution A4 sheets with charts, valuation tables, and student verification details. The .pdf file will download to your device automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
