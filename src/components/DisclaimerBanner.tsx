import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-50/90 border-y border-amber-200 text-amber-900 px-4 py-2.5 text-xs sm:text-[13px] flex items-center justify-between gap-3 shadow-xs no-print">
      <div className="max-w-7xl mx-auto flex items-center gap-2.5 w-full">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="font-normal text-amber-800 leading-relaxed">
          <strong className="font-semibold text-amber-950">Important Financial Disclaimer:</strong>{' '}
          This application is for personal record keeping, portfolio tracking and educational purposes only.
          It does not provide financial advice or recommendations to buy or sell any investment.
        </p>
      </div>
    </div>
  );
};

export const FooterDisclaimer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white py-6 px-4 no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Stock & Mutual Fund Investment Portfolio &bull; Academic & Personal Tracker</span>
        </div>
        <p className="text-center md:text-right max-w-xl text-[11px] text-slate-400">
          Amounts formatted in Indian Rupee (₹) &bull; Dates in Indian DD-MM-YYYY format &bull; All data stays private in your browser localStorage.
        </p>
      </div>
    </footer>
  );
};
