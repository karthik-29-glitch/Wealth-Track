import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingUp,
  Layers,
  Landmark,
  Save,
  RotateCcw,
  Trash2,
  CheckCircle,
  User,
  ShieldAlert,
  Calculator,
  ChevronDown,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  Stock,
  MutualFund,
  FixedDeposit,
  RiskLevel,
  formatINR,
  formatPercent,
  getStockMetrics,
  getMutualFundMetrics,
  getFixedDepositMetrics,
} from '../types/portfolio';
import { COMMON_SECTORS, COMMON_AMCS, COMMON_CATEGORIES, COMMON_BANKS } from '../data/initialData';
import { getSchemesForAmc, FundCatalogItem } from '../data/fundCatalog';

interface InvestmentFormProps {
  initialStock?: Stock | null;
  initialMf?: MutualFund | null;
  initialFd?: FixedDeposit | null;
  members: string[];
  mode?: 'add' | 'edit';
  onSaveStock: (stock: Stock) => void;
  onSaveMutualFund: (mf: MutualFund) => void;
  onSaveFixedDeposit: (fd: FixedDeposit) => void;
  onDelete?: (id: string, type: 'stock' | 'mutual-fund' | 'fixed-deposit') => void;
  onCancel?: () => void;
}

export const InvestmentForm: React.FC<InvestmentFormProps> = ({
  initialStock,
  initialMf,
  initialFd,
  members,
  mode = 'add',
  onSaveStock,
  onSaveMutualFund,
  onSaveFixedDeposit,
  onDelete,
  onCancel,
}) => {
  const [formType, setFormType] = useState<'stock' | 'mutual-fund' | 'fixed-deposit'>(
    initialFd ? 'fixed-deposit' : initialMf ? 'mutual-fund' : 'stock'
  );

  // Common Investor / Member
  const [selectedMember, setSelectedMember] = useState<string>(
    initialStock?.memberName || initialMf?.memberName || initialFd?.memberName || members[0] || 'Karthik S B'
  );
  const [customMemberInput, setCustomMemberInput] = useState<string>('');
  const [isCustomMember, setIsCustomMember] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const uniqueMembers = useMemo(() => {
    return Array.from(new Set(members.map((m) => m.trim()).filter(Boolean)));
  }, [members]);

  // Stock State
  const [stockName, setStockName] = useState(initialStock?.name || '');
  const [stockCompany, setStockCompany] = useState(initialStock?.company || '');
  const [stockSector, setStockSector] = useState(initialStock?.sector || 'IT / Technology');
  const [stockDate, setStockDate] = useState(initialStock?.purchaseDate || new Date().toISOString().slice(0, 10));
  const [stockQty, setStockQty] = useState<string>(initialStock ? String(initialStock.quantity) : '10');
  const [stockBuyPrice, setStockBuyPrice] = useState<string>(initialStock ? String(initialStock.buyPrice) : '1500');
  const [stockCurrentPrice, setStockCurrentPrice] = useState<string>(initialStock ? String(initialStock.currentPrice) : '1650');
  const [stockRisk, setStockRisk] = useState<RiskLevel>(initialStock?.riskLevel || 'Medium');
  const [stockNotes, setStockNotes] = useState(initialStock?.notes || '');

  // Mutual Fund State
  const [mfName, setMfName] = useState(initialMf?.name || '');
  const [mfAmc, setMfAmc] = useState(initialMf?.amc || 'SBI Mutual Fund');
  const [mfCategory, setMfCategory] = useState(initialMf?.category || 'Equity (Large Cap)');
  const [mfType, setMfType] = useState<'SIP' | 'Lumpsum'>(initialMf?.investmentType || 'SIP');
  const [mfDate, setMfDate] = useState(initialMf?.purchaseDate || new Date().toISOString().slice(0, 10));
  const [mfInvested, setMfInvested] = useState<string>(initialMf ? String(initialMf.amountInvested) : '50000');
  const [mfPurchaseNav, setMfPurchaseNav] = useState<string>(initialMf ? String(initialMf.purchaseNav) : '35.00');
  const [mfCurrentNav, setMfCurrentNav] = useState<string>(initialMf ? String(initialMf.currentNav) : '40.25');
  const [mfRisk, setMfRisk] = useState<RiskLevel>(initialMf?.riskLevel || 'Medium');
  const [mfNotes, setMfNotes] = useState(initialMf?.notes || '');
  const [showMfDropdown, setShowMfDropdown] = useState<boolean>(false);
  const mfDropdownRef = useRef<HTMLDivElement>(null);

  // Available schemes for selected AMC, filtered by what user typed
  const availableMfSchemes = useMemo(() => {
    return getSchemesForAmc(mfAmc, mfName);
  }, [mfAmc, mfName]);

  // All schemes for selected AMC (for full browse and popular chips)
  const allAmcSchemes = useMemo(() => {
    return getSchemesForAmc(mfAmc);
  }, [mfAmc]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mfDropdownRef.current && !mfDropdownRef.current.contains(event.target as Node)) {
        setShowMfDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectScheme = (scheme: FundCatalogItem) => {
    setMfName(scheme.name);
    setMfCategory(scheme.category);
    setMfRisk(scheme.riskLevel);
    setMfPurchaseNav(scheme.suggestedPurchaseNav.toFixed(2));
    setMfCurrentNav(scheme.suggestedCurrentNav.toFixed(2));
    if (!mfNotes || mfNotes.includes('Core equity') || mfNotes.includes('holding')) {
      setMfNotes(scheme.notes || '');
    }
    setShowMfDropdown(false);
  };

  // Fixed Deposit State
  const [fdBank, setFdBank] = useState(initialFd?.bankName || 'State Bank of India (SBI)');
  const [fdAccountNo, setFdAccountNo] = useState(initialFd?.accountNumber || '');
  const [fdDepositDate, setFdDepositDate] = useState(initialFd?.depositDate || new Date().toISOString().slice(0, 10));
  const [fdMaturityDate, setFdMaturityDate] = useState(
    initialFd?.maturityDate ||
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [fdPrincipal, setFdPrincipal] = useState<string>(initialFd ? String(initialFd.principalAmount) : '50000');
  const [fdRate, setFdRate] = useState<string>(initialFd ? String(initialFd.interestRate) : '7.10');
  const [fdFrequency, setFdFrequency] = useState<'Quarterly' | 'Annually' | 'Monthly' | 'Simple'>(
    initialFd?.compoundingFrequency || 'Quarterly'
  );
  const [fdTenure, setFdTenure] = useState<string>(initialFd ? String(initialFd.tenureMonths) : '12');
  const [fdCurrentVal, setFdCurrentVal] = useState<string>(initialFd ? String(initialFd.currentValue) : '53645');
  const [fdRisk, setFdRisk] = useState<RiskLevel>(initialFd?.riskLevel || 'Low');
  const [fdNotes, setFdNotes] = useState(initialFd?.notes || '');

  // Feedback & Validation
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    if (initialStock) {
      setFormType('stock');
      setSelectedMember(initialStock.memberName || members[0] || 'Karthik S B');
      setStockName(initialStock.name);
      setStockCompany(initialStock.company);
      setStockSector(initialStock.sector);
      setStockDate(initialStock.purchaseDate);
      setStockQty(String(initialStock.quantity));
      setStockBuyPrice(String(initialStock.buyPrice));
      setStockCurrentPrice(String(initialStock.currentPrice));
      setStockRisk(initialStock.riskLevel);
      setStockNotes(initialStock.notes || '');
    } else if (initialMf) {
      setFormType('mutual-fund');
      setSelectedMember(initialMf.memberName || members[0] || 'Karthik S B');
      setMfName(initialMf.name);
      setMfAmc(initialMf.amc);
      setMfCategory(initialMf.category);
      setMfType(initialMf.investmentType);
      setMfDate(initialMf.purchaseDate);
      setMfInvested(String(initialMf.amountInvested));
      setMfPurchaseNav(String(initialMf.purchaseNav));
      setMfCurrentNav(String(initialMf.currentNav));
      setMfRisk(initialMf.riskLevel);
      setMfNotes(initialMf.notes || '');
    } else if (initialFd) {
      setFormType('fixed-deposit');
      setSelectedMember(initialFd.memberName || members[0] || 'Karthik S B');
      setFdBank(initialFd.bankName);
      setFdAccountNo(initialFd.accountNumber || '');
      setFdDepositDate(initialFd.depositDate);
      setFdMaturityDate(initialFd.maturityDate);
      setFdPrincipal(String(initialFd.principalAmount));
      setFdRate(String(initialFd.interestRate));
      setFdFrequency(initialFd.compoundingFrequency);
      setFdTenure(String(initialFd.tenureMonths));
      setFdCurrentVal(String(initialFd.currentValue));
      setFdRisk(initialFd.riskLevel);
      setFdNotes(initialFd.notes || '');
    }
  }, [initialStock, initialMf, initialFd, members]);

  // Live calculations for Stock
  const numQty = parseFloat(stockQty) || 0;
  const numBuyPrice = parseFloat(stockBuyPrice) || 0;
  const numCurrentPrice = parseFloat(stockCurrentPrice) || 0;
  const stockInvested = numQty * numBuyPrice;
  const stockValue = numQty * numCurrentPrice;
  const stockPL = stockValue - stockInvested;
  const stockReturn = stockInvested > 0 ? (stockPL / stockInvested) * 100 : 0;

  // Live calculations for MF
  const numMfInvested = parseFloat(mfInvested) || 0;
  const numPurchaseNav = parseFloat(mfPurchaseNav) || 0;
  const numCurrentNav = parseFloat(mfCurrentNav) || 0;
  const mfUnits = numPurchaseNav > 0 ? numMfInvested / numPurchaseNav : 0;
  const mfValue = mfUnits * numCurrentNav;
  const mfPL = mfValue - numMfInvested;
  const mfReturn = numMfInvested > 0 ? (mfPL / numMfInvested) * 100 : 0;

  // Live calculations for FD
  const numFdPrincipal = parseFloat(fdPrincipal) || 0;
  const numFdRate = parseFloat(fdRate) || 0;
  const numFdTenure = parseFloat(fdTenure) || 0;
  const numFdCurrentVal = parseFloat(fdCurrentVal) || 0;
  const fdPL = numFdCurrentVal - numFdPrincipal;
  const fdReturn = numFdPrincipal > 0 ? (fdPL / numFdPrincipal) * 100 : 0;

  // Helper to auto-calculate FD Maturity/Accrued Value
  const handleAutoCalcFD = () => {
    if (numFdPrincipal <= 0 || numFdRate <= 0 || numFdTenure <= 0) return;
    const r = numFdRate / 100;
    const t = numFdTenure / 12; // years
    let n = 4; // quarterly default
    if (fdFrequency === 'Monthly') n = 12;
    else if (fdFrequency === 'Annually') n = 1;
    else if (fdFrequency === 'Simple') {
      const maturity = numFdPrincipal + numFdPrincipal * r * t;
      setFdCurrentVal(maturity.toFixed(0));
      return;
    }
    const maturity = numFdPrincipal * Math.pow(1 + r / n, n * t);
    setFdCurrentVal(maturity.toFixed(0));
  };

  const getEffectiveMemberName = () => {
    if (isCustomMember && customMemberInput.trim()) {
      return customMemberInput.trim();
    }
    return selectedMember || members[0] || 'Karthik S B';
  };

  const handleClear = () => {
    if (formType === 'stock') {
      setStockName('');
      setStockCompany('');
      setStockSector('IT / Technology');
      setStockQty('');
      setStockBuyPrice('');
      setStockCurrentPrice('');
      setStockRisk('Medium');
      setStockNotes('');
    } else if (formType === 'mutual-fund') {
      setMfName('');
      setMfAmc('SBI Mutual Fund');
      setMfCategory('Equity (Large Cap)');
      setMfType('SIP');
      setMfInvested('');
      setMfPurchaseNav('');
      setMfCurrentNav('');
      setMfRisk('Medium');
      setMfNotes('');
    } else {
      setFdBank('State Bank of India (SBI)');
      setFdAccountNo('');
      setFdPrincipal('');
      setFdRate('7.10');
      setFdTenure('12');
      setFdCurrentVal('');
      setFdNotes('');
    }
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const memberName = getEffectiveMemberName();

    if (formType === 'stock') {
      if (!stockName.trim()) {
        setErrorMessage('Please enter the stock name/ticker.');
        return;
      }
      if (numQty <= 0) {
        setErrorMessage('Quantity must be greater than zero.');
        return;
      }
      if (numBuyPrice <= 0 || numCurrentPrice <= 0) {
        setErrorMessage('Buy price and current price must be valid positive numbers.');
        return;
      }

      const stockData: Stock = {
        id: initialStock?.id || `stock-${Date.now()}`,
        name: stockName.trim(),
        company: stockCompany.trim() || stockName.trim(),
        sector: stockSector,
        purchaseDate: stockDate,
        quantity: numQty,
        buyPrice: numBuyPrice,
        currentPrice: numCurrentPrice,
        riskLevel: stockRisk,
        memberName,
        notes: stockNotes.trim(),
        isDemo: false,
      };

      onSaveStock(stockData);
      setSuccessMessage(`Stock "${stockData.name}" saved for ${memberName}!`);
    } else if (formType === 'mutual-fund') {
      if (!mfName.trim()) {
        setErrorMessage('Please enter the Mutual Fund name.');
        return;
      }
      if (numMfInvested <= 0) {
        setErrorMessage('Amount invested must be greater than zero.');
        return;
      }
      if (numPurchaseNav <= 0 || numCurrentNav <= 0) {
        setErrorMessage('Purchase NAV and Current NAV must be positive numbers.');
        return;
      }

      const mfData: MutualFund = {
        id: initialMf?.id || `mf-${Date.now()}`,
        name: mfName.trim(),
        amc: mfAmc.trim(),
        category: mfCategory,
        investmentType: mfType,
        purchaseDate: mfDate,
        amountInvested: numMfInvested,
        purchaseNav: numPurchaseNav,
        currentNav: numCurrentNav,
        riskLevel: mfRisk,
        memberName,
        notes: mfNotes.trim(),
        isDemo: false,
      };

      onSaveMutualFund(mfData);
      setSuccessMessage(`Mutual Fund "${mfData.name}" saved for ${memberName}!`);
    } else {
      // Fixed Deposit
      if (!fdBank.trim()) {
        setErrorMessage('Please enter the Bank name.');
        return;
      }
      if (numFdPrincipal <= 0) {
        setErrorMessage('Principal amount must be greater than zero.');
        return;
      }
      if (numFdRate <= 0) {
        setErrorMessage('Interest rate must be greater than zero.');
        return;
      }

      const fdData: FixedDeposit = {
        id: initialFd?.id || `fd-${Date.now()}`,
        bankName: fdBank.trim(),
        accountNumber: fdAccountNo.trim() || undefined,
        depositDate: fdDepositDate,
        maturityDate: fdMaturityDate,
        principalAmount: numFdPrincipal,
        interestRate: numFdRate,
        compoundingFrequency: fdFrequency,
        tenureMonths: numFdTenure,
        currentValue: numFdCurrentVal > 0 ? numFdCurrentVal : numFdPrincipal,
        riskLevel: fdRisk,
        memberName,
        notes: fdNotes.trim(),
        isDemo: false,
      };

      onSaveFixedDeposit(fdData);
      setSuccessMessage(`Fixed Deposit at "${fdData.bankName}" saved for ${memberName}!`);
    }

    setTimeout(() => setSuccessMessage(''), 4000);
    if (!initialStock && !initialMf && !initialFd) {
      handleClear();
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header with Type Toggle */}
      <div className="bg-slate-900 text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {mode === 'edit' ? 'Edit Investment Record' : 'Add Investment Record'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Select team member first, then enter Stocks, Mutual Funds, or Fixed Deposits.
            </p>
          </div>

          {/* 3-Way Toggle Pill */}
          {!initialStock && !initialMf && !initialFd && (
            <div className="inline-flex p-1 bg-slate-800 rounded-xl border border-slate-700 overflow-x-auto">
              <button
                type="button"
                onClick={() => setFormType('stock')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  formType === 'stock'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Stock (Equity)</span>
              </button>
              <button
                type="button"
                onClick={() => setFormType('mutual-fund')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  formType === 'mutual-fund'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Mutual Fund</span>
              </button>
              <button
                type="button"
                onClick={() => setFormType('fixed-deposit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  formType === 'fixed-deposit'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Fixed Deposit (FD)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* STEP 1: SELECT INVESTOR / TEAM MEMBER (Prompt requirement: "add the name before enter there investments") */}
        <div className="bg-blue-50/70 border-2 border-blue-200/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              1
            </span>
            <label className="text-xs sm:text-sm font-bold text-blue-950 uppercase tracking-wider">
              Select Investor / Team Member Name <span className="text-rose-500">*</span>
            </label>
          </div>
          <p className="text-xs text-slate-600 mb-3 pl-8">
            Choose which of the 4 team members this investment belongs to:
          </p>

          <div className="pl-8 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Quick 4 Member Radio/Pill buttons */}
            <div className="flex flex-wrap gap-2 flex-1">
              {uniqueMembers.map((m, idx) => {
                const isSelected = !isCustomMember && selectedMember === m;
                return (
                  <button
                    key={`inv-member-${m}-${idx}`}
                    type="button"
                    onClick={() => {
                      setIsCustomMember(false);
                      setSelectedMember(m);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{m}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setIsCustomMember(true)}
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isCustomMember
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-dashed border-slate-300 hover:bg-slate-50'
                }`}
              >
                + Custom Name
              </button>
            </div>

            {isCustomMember && (
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Enter custom member name..."
                  value={customMemberInput}
                  onChange={(e) => setCustomMemberInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-blue-300 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: INVESTMENT DETAILS */}
        <div className="flex items-center gap-2 pt-2">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            2
          </span>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {formType === 'stock'
              ? 'Stock (Equity) Details'
              : formType === 'mutual-fund'
              ? 'Mutual Fund Details'
              : 'Fixed Deposit (FD) Details'}
          </h3>
        </div>

        {formType === 'stock' ? (
          /* STOCK FIELDS */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Stock Name / Ticker <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reliance Ind., TCS, Infosys"
                  value={stockName}
                  onChange={(e) => setStockName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Company Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Reliance Industries Limited"
                  value={stockCompany}
                  onChange={(e) => setStockCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sector / Industry
                </label>
                <select
                  value={stockSector}
                  onChange={(e) => setStockSector(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {COMMON_SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Purchase Date (DD-MM-YYYY)
                </label>
                <input
                  type="date"
                  required
                  value={stockDate}
                  onChange={(e) => setStockDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quantity (Shares) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  required
                  placeholder="e.g. 5"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Buy Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  placeholder="e.g. 2800"
                  value={stockBuyPrice}
                  onChange={(e) => setStockBuyPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  placeholder="e.g. 2950"
                  value={stockCurrentPrice}
                  onChange={(e) => setStockCurrentPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Risk & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Risk Level
                </label>
                <div className="flex gap-2">
                  {(['Low', 'Medium', 'High'] as RiskLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setStockRisk(lvl)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                        stockRisk === lvl
                          ? lvl === 'Low'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : lvl === 'Medium'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Investment Notes / Rationale
                </label>
                <input
                  type="text"
                  placeholder="e.g. Long-term bluechip holding, consistent dividend payer"
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Stock Live Metrics */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">
                Live Calculated Metrics (Stock)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Invested Amount:</span>
                  <p className="text-base font-bold text-slate-900">{formatINR(stockInvested)}</p>
                  <span className="text-[10px] text-slate-400">Qty × Buy Price</span>
                </div>
                <div>
                  <span className="text-slate-500">Current Value:</span>
                  <p className="text-base font-bold text-blue-700">{formatINR(stockValue)}</p>
                  <span className="text-[10px] text-slate-400">Qty × Current Price</span>
                </div>
                <div>
                  <span className="text-slate-500">Profit / Loss:</span>
                  <p className={`text-base font-bold ${stockPL >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {stockPL >= 0 ? '+' : ''}{formatINR(stockPL)}
                  </p>
                  <span className="text-[10px] text-slate-400">Current - Invested</span>
                </div>
                <div>
                  <span className="text-slate-500">Return %:</span>
                  <p className={`text-base font-bold ${stockReturn >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formatPercent(stockReturn)}
                  </p>
                  <span className="text-[10px] text-slate-400">(P/L ÷ Invested) × 100</span>
                </div>
              </div>
            </div>
          </div>
        ) : formType === 'mutual-fund' ? (
          /* MUTUAL FUND FIELDS */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* AMC (Fund House) first or alongside */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  AMC (Fund House)
                </label>
                <select
                  value={mfAmc}
                  onChange={(e) => {
                    const newAmc = e.target.value;
                    setMfAmc(newAmc);
                    setShowMfDropdown(true);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  {COMMON_AMCS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fund Name with Interactive Scheme Dropdown */}
              <div ref={mfDropdownRef} className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Fund Name <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMfDropdown((prev) => !prev)}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{showMfDropdown ? 'Hide List' : `Browse ${mfAmc} (${allAmcSchemes.length})`}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={`Type or click to choose from ${mfAmc} schemes...`}
                    value={mfName}
                    onFocus={() => setShowMfDropdown(true)}
                    onClick={() => setShowMfDropdown(true)}
                    onChange={(e) => {
                      setMfName(e.target.value);
                      setShowMfDropdown(true);
                    }}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMfDropdown((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
                    title="Toggle fund list"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showMfDropdown ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>
                </div>

                {/* Dropdown panel with all fund schemes */}
                {showMfDropdown && (
                  <div className="absolute z-30 left-0 right-0 mt-1 max-h-72 overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-200 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2.5 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700 sticky top-0 border-b border-slate-200 z-10">
                      <span className="flex items-center gap-1.5 text-emerald-800">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        {mfAmc} Schemes ({availableMfSchemes.length} available)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowMfDropdown(false)}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-200"
                      >
                        ✕ Close
                      </button>
                    </div>

                    {availableMfSchemes.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-xs text-slate-600 font-medium">
                          No predefined fund matching &ldquo;{mfName}&rdquo;
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          You can keep your custom name, or view all {mfAmc} funds.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setMfName('');
                            setShowMfDropdown(true);
                          }}
                          className="mt-2 text-xs font-bold text-emerald-600 hover:underline"
                        >
                          Show all {allAmcSchemes.length} {mfAmc} funds
                        </button>
                      </div>
                    ) : (
                      availableMfSchemes.map((scheme, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectScheme(scheme);
                          }}
                          className="w-full p-2.5 hover:bg-emerald-50 text-left transition-colors flex flex-col justify-between group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 leading-tight">
                              {scheme.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold whitespace-nowrap shrink-0">
                              {scheme.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                            <span>NAV: ₹{scheme.suggestedCurrentNav.toFixed(2)}</span>
                            <span>•</span>
                            <span>
                              Risk: <strong className={scheme.riskLevel === 'High' ? 'text-rose-600' : scheme.riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}>{scheme.riskLevel}</strong>
                            </span>
                            {scheme.notes && (
                              <>
                                <span>•</span>
                                <span className="truncate text-slate-400 text-[10px] max-w-[200px]">{scheme.notes}</span>
                              </>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Popular 1-Click Quick Chips */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Click to fill:
                  </span>
                  {allAmcSchemes.slice(0, 5).map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectScheme(s)}
                      className="px-2 py-0.5 text-[11px] rounded-md bg-emerald-50/90 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors font-medium truncate max-w-[210px]"
                      title={`Click to fill ${s.name} (${s.category})`}
                    >
                      {s.name.replace(' - Direct Plan (G)', '').replace(' - Direct (G)', '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={mfCategory}
                  onChange={(e) => setMfCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  {COMMON_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Investment Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMfType('SIP')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                      mfType === 'SIP'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    SIP (Monthly)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMfType('Lumpsum')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                      mfType === 'Lumpsum'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Lumpsum (One-time)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Purchase Date (DD-MM-YYYY)
                </label>
                <input
                  type="date"
                  required
                  value={mfDate}
                  onChange={(e) => setMfDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Amount Invested (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="e.g. 50000"
                  value={mfInvested}
                  onChange={(e) => setMfInvested(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Purchase NAV (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  required
                  placeholder="e.g. 32.50"
                  value={mfPurchaseNav}
                  onChange={(e) => setMfPurchaseNav(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current NAV (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  required
                  placeholder="e.g. 38.01"
                  value={mfCurrentNav}
                  onChange={(e) => setMfCurrentNav(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>

            {/* Risk & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Risk Level
                </label>
                <div className="flex gap-2">
                  {(['Low', 'Medium', 'High'] as RiskLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setMfRisk(lvl)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                        mfRisk === lvl
                          ? lvl === 'Low'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : lvl === 'Medium'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Investment Notes / Strategy
                </label>
                <input
                  type="text"
                  placeholder="e.g. Core equity large-cap fund for steady wealth compounding"
                  value={mfNotes}
                  onChange={(e) => setMfNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>

            {/* MF Live Metrics */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3">
                Live Calculated Metrics (Mutual Fund)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Calculated Units:</span>
                  <p className="text-base font-bold text-slate-900">{mfUnits.toFixed(3)}</p>
                  <span className="text-[10px] text-slate-400">Invested ÷ Purchase NAV</span>
                </div>
                <div>
                  <span className="text-slate-500">Current Value:</span>
                  <p className="text-base font-bold text-emerald-700">{formatINR(mfValue)}</p>
                  <span className="text-[10px] text-slate-400">Units × Current NAV</span>
                </div>
                <div>
                  <span className="text-slate-500">Profit / Loss:</span>
                  <p className={`text-base font-bold ${mfPL >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {mfPL >= 0 ? '+' : ''}{formatINR(mfPL)}
                  </p>
                  <span className="text-[10px] text-slate-400">Current - Invested</span>
                </div>
                <div>
                  <span className="text-slate-500">Return %:</span>
                  <p className={`text-base font-bold ${mfReturn >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formatPercent(mfReturn)}
                  </p>
                  <span className="text-[10px] text-slate-400">(P/L ÷ Invested) × 100</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* FIXED DEPOSIT FIELDS */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bank / Financial Institution <span className="text-rose-500">*</span>
                </label>
                <select
                  value={fdBank}
                  onChange={(e) => setFdBank(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                >
                  {COMMON_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Account / FD Receipt Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. FD-SBI-89211 or Receipt No."
                  value={fdAccountNo}
                  onChange={(e) => setFdAccountNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Deposit Date (DD-MM-YYYY)
                </label>
                <input
                  type="date"
                  required
                  value={fdDepositDate}
                  onChange={(e) => setFdDepositDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Maturity Date (DD-MM-YYYY)
                </label>
                <input
                  type="date"
                  required
                  value={fdMaturityDate}
                  onChange={(e) => setFdMaturityDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Principal Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="100"
                  step="any"
                  required
                  placeholder="e.g. 50000"
                  value={fdPrincipal}
                  onChange={(e) => setFdPrincipal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Interest Rate (% p.a.) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.01"
                  required
                  placeholder="e.g. 7.10"
                  value={fdRate}
                  onChange={(e) => setFdRate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tenure (Months)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 12"
                  value={fdTenure}
                  onChange={(e) => setFdTenure(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Compounding Frequency
                </label>
                <select
                  value={fdFrequency}
                  onChange={(e) => setFdFrequency(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                >
                  <option value="Quarterly">Quarterly Compounding</option>
                  <option value="Annually">Annual Compounding</option>
                  <option value="Monthly">Monthly Compounding</option>
                  <option value="Simple">Simple Interest</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Current / Maturity Value (₹) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoCalcFD}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Auto Calculate from Rate</span>
                  </button>
                </div>
                <input
                  type="number"
                  min="100"
                  step="any"
                  required
                  placeholder="e.g. 53645"
                  value={fdCurrentVal}
                  onChange={(e) => setFdCurrentVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>
            </div>

            {/* Risk & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Risk Level
                </label>
                <div className="flex gap-2">
                  {(['Low', 'Medium', 'High'] as RiskLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFdRisk(lvl)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                        fdRisk === lvl
                          ? lvl === 'Low'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : lvl === 'Medium'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Notes / Terms
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior citizen rate, quarterly interest payout or cumulative"
                  value={fdNotes}
                  onChange={(e) => setFdNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>
            </div>

            {/* FD Live Metrics */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-3">
                Live Calculated Metrics (Fixed Deposit)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Principal Deposit:</span>
                  <p className="text-base font-bold text-slate-900">{formatINR(numFdPrincipal)}</p>
                  <span className="text-[10px] text-slate-400">{fdRate}% p.a.</span>
                </div>
                <div>
                  <span className="text-slate-500">Current / Maturity:</span>
                  <p className="text-base font-bold text-amber-800">{formatINR(numFdCurrentVal)}</p>
                  <span className="text-[10px] text-slate-400">{fdTenure} Months tenure</span>
                </div>
                <div>
                  <span className="text-slate-500">Interest Earned:</span>
                  <p className="text-base font-bold text-emerald-700">
                    +{formatINR(Math.max(0, fdPL))}
                  </p>
                  <span className="text-[10px] text-slate-400">Guaranteed Return</span>
                </div>
                <div>
                  <span className="text-slate-500">Return %:</span>
                  <p className="text-base font-bold text-emerald-700">
                    {formatPercent(Math.max(0, fdReturn))}
                  </p>
                  <span className="text-[10px] text-slate-400">(Gain ÷ Principal) × 100</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons: SAVE, CLEAR, DELETE, CANCEL */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>SAVE INVESTMENT</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>CLEAR</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'edit' && onDelete && (initialStock || initialMf || initialFd) && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>DELETE</span>
              </button>
            )}

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Delete Investment Record?
              </h3>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                Are you sure you want to permanently delete this investment from your portfolio? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = initialStock ? initialStock.id : initialMf ? initialMf.id : initialFd!.id;
                    const type = initialStock ? 'stock' : initialMf ? 'mutual-fund' : 'fixed-deposit';
                    setShowDeleteModal(false);
                    if (onDelete) {
                      onDelete(id, type);
                    }
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
