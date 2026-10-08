import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  Calendar,
  ExternalLink,
  Tag,
  Eye,
  X,
  FileCheck,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { ScreenshotRecord, formatIndianDate, Stock, MutualFund, formatINR } from '../types/portfolio';

interface ScreenshotGalleryProps {
  screenshots: ScreenshotRecord[];
  stocks: Stock[];
  mutualFunds: MutualFund[];
  onAddScreenshot: (record: ScreenshotRecord) => void;
  onDeleteScreenshot: (id: string) => void;
}

export const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({
  screenshots,
  stocks,
  mutualFunds,
  onAddScreenshot,
  onDeleteScreenshot,
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState<{ title: string; src: string; notes?: string } | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ScreenshotRecord['category']>('Stock Portfolio');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [imageData, setImageData] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result as string);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a title for this record.');
      return;
    }
    if (!imageData) {
      setErrorMsg('Please upload an image screenshot.');
      return;
    }

    const record: ScreenshotRecord = {
      id: `screen-${Date.now()}`,
      title: title.trim(),
      category,
      date,
      imageData,
      notes: notes.trim(),
      isDemo: false,
    };

    onAddScreenshot(record);
    setShowUploadModal(false);
    setTitle('');
    setImageData('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <ImageIcon className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">Screenshots &amp; Investment Records</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                Verified Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Upload verified screenshots from your demat broker (Zerodha Kite, Groww, AngelOne) and mutual fund portals for report documentation.
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm shadow-purple-500/20 transition-all self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Screenshot</span>
          </button>
        </div>

        {/* Categories breakdown pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-500">Record Categories:</span>
          {['Stock Portfolio', 'Mutual Fund Portfolio', 'Broker Account', 'Investment Statement'].map((cat) => (
            <span key={cat} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Grid of Screenshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pre-seeded Interactive Demat Account Visual Mock (like page 8 in image) */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold">Demat Account (Direct Stocks)</span>
            </div>
            <span className="text-[10px] font-semibold bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30">
              Kite / Demat App
            </span>
          </div>

          {/* Demat Screen Replica */}
          <div className="p-4 bg-slate-950 text-white font-sans flex-1">
            <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 mb-3">
              <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                <span>Holdings Total Value</span>
                <span className="text-emerald-400 font-bold">+6.97%</span>
              </div>
              <div className="text-xl font-black text-white">₹1,12,500</div>
              <div className="text-xs text-emerald-400 font-semibold mt-0.5">+₹2,760 (Total P&amp;L)</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div>
                  <span className="font-bold text-white block">RELIANCE</span>
                  <span className="text-[10px] text-slate-400">Qty: 5 &bull; Avg: ₹2,800</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white block">₹14,750</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">+5.36%</span>
                </div>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div>
                  <span className="font-bold text-white block">TCS</span>
                  <span className="text-[10px] text-slate-400">Qty: 3 &bull; Avg: ₹3,500</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white block">₹11,250</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">+7.14%</span>
                </div>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div>
                  <span className="font-bold text-white block">HDFC BANK</span>
                  <span className="text-[10px] text-slate-400">Qty: 4 &bull; Avg: ₹1,600</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white block">₹6,880</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">+7.50%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Demat holdings snapshot for documentation</span>
            <span className="font-semibold text-slate-700">Page 8 Record</span>
          </div>
        </div>

        {/* Pre-seeded Interactive Mutual Fund Invested Visual Mock (like page 8 in image) */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-emerald-950 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold">Mutual Funds Invested (Portfolio)</span>
            </div>
            <span className="text-[10px] font-semibold bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
              Groww / MF Central
            </span>
          </div>

          {/* MF Screen Replica */}
          <div className="p-4 bg-slate-50 flex-1">
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs mb-3">
              <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1">
                <span>Total Current Value</span>
                <span className="text-emerald-600 font-bold">+14.00%</span>
              </div>
              <div className="text-xl font-black text-slate-900">₹1,71,000</div>
              <div className="text-xs text-emerald-600 font-semibold mt-0.5">+₹21,000 (Gains)</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
                <div>
                  <span className="font-bold text-slate-900 block">SBI Bluechip Fund</span>
                  <span className="text-[10px] text-slate-500">Invested: ₹50,000 &bull; SIP</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">₹58,500</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">+17.00%</span>
                </div>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
                <div>
                  <span className="font-bold text-slate-900 block">HDFC Midcap Fund</span>
                  <span className="text-[10px] text-slate-500">Invested: ₹50,000 &bull; SIP</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">₹57,000</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">+14.00%</span>
                </div>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
                <div>
                  <span className="font-bold text-slate-900 block">ICICI Balanced Adv.</span>
                  <span className="text-[10px] text-slate-500">Invested: ₹50,000 &bull; Lump</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">₹56,500</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">+13.00%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Mutual fund holdings snapshot for documentation</span>
            <span className="font-semibold text-emerald-700">Page 8 Record</span>
          </div>
        </div>

        {/* User uploaded screenshots */}
        {screenshots
          .filter((s) => s.imageData)
          .map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col group"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 truncate max-w-[200px]" title={item.title}>
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {item.category} &bull; {formatIndianDate(item.date)}
                  </span>
                </div>

                <button
                  onClick={() => onDeleteScreenshot(item.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete screenshot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div
                className="relative bg-slate-100 h-48 cursor-pointer overflow-hidden flex items-center justify-center"
                onClick={() => setPreviewModalImage({ title: item.title, src: item.imageData, notes: item.notes })}
              >
                <img
                  src={item.imageData}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 text-xs font-semibold backdrop-blur-xs">
                    <Eye className="w-3.5 h-3.5" /> Preview Full
                  </span>
                </div>
              </div>

              {item.notes && (
                <div className="p-3 bg-slate-50 text-[11px] text-slate-600 border-t border-slate-100 italic">
                  {item.notes}
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Upload Investment Screenshot / Statement</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs">{errorMsg}</div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Record Title / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zerodha Kite Demat Holdings, MF Central Statement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Stock Portfolio">Stock Portfolio</option>
                    <option value="Mutual Fund Portfolio">Mutual Fund Portfolio</option>
                    <option value="Broker Account">Broker Account</option>
                    <option value="Investment Statement">Investment Statement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Record Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>

              {imageData && (
                <div className="mt-2 border rounded-lg p-2 max-h-40 overflow-hidden flex justify-center bg-slate-50">
                  <img src={imageData} alt="Preview" className="max-h-36 object-contain rounded" />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Additional Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Account balance ₹2.83 Lakhs as on October 2025"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewModalImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setPreviewModalImage(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{previewModalImage.title}</h3>
                {previewModalImage.notes && (
                  <p className="text-xs text-slate-400 mt-0.5">{previewModalImage.notes}</p>
                )}
              </div>
              <button
                onClick={() => setPreviewModalImage(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 bg-slate-950 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={previewModalImage.src}
                alt={previewModalImage.title}
                className="max-h-[70vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
