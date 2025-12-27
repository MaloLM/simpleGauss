
import React from 'react';
import { XIcon, MousePointer2Icon, LayersIcon } from 'lucide-react';
import { Theme, Language } from '../types';
import { translations } from '../translations';

interface CanvasSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  language: Language;
  showGrid: boolean;
  setShowGrid: (val: boolean) => void;
  showAxes: boolean;
  setShowAxes: (val: boolean) => void;
  showXValues: boolean;
  setShowXValues: (val: boolean) => void;
  showYValues: boolean;
  setShowYValues: (val: boolean) => void;
  handleSize: number;
  setHandleSize: (val: number) => void;
  curveOpacity: number;
  setCurveOpacity: (val: number) => void;
}

const CanvasSettingsModal: React.FC<CanvasSettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  language,
  showGrid,
  setShowGrid,
  showAxes,
  setShowAxes,
  showXValues,
  setShowXValues,
  showYValues,
  setShowYValues,
  handleSize,
  setHandleSize,
  curveOpacity,
  setCurveOpacity,
}) => {
  if (!isOpen) return null;

  const t = translations[language];

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden transition-all scale-in-center duration-300 ${
          theme === 'dark' 
            ? 'bg-slate-900 border-white/10 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-xl font-bold tracking-tight">{t.settingsIcon}</h3>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'
            }`}
          >
            <XIcon size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Sliders Section */}
          <div className="space-y-6">
            {/* Handle Size Slider */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                    <MousePointer2Icon size={16} />
                  </div>
                  <label className="text-xs font-black uppercase tracking-widest opacity-60">
                    {t.interactionNodes}
                  </label>
                </div>
                <span className="text-[10px] font-black px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md">
                  {(handleSize * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.25"
                step="0.01"
                value={handleSize}
                onChange={(e) => setHandleSize(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700/30 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[8px] font-bold opacity-30 uppercase tracking-widest">
                <span>{t.precise}</span>
                <span>{t.large}</span>
              </div>
            </section>

            {/* Curve Opacity Slider */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                    <LayersIcon size={16} />
                  </div>
                  <label className="text-xs font-black uppercase tracking-widest opacity-60">
                    {t.visualDensity}
                  </label>
                </div>
                <span className="text-[10px] font-black px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md">
                  {(curveOpacity * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.6"
                step="0.01"
                value={curveOpacity}
                onChange={(e) => setCurveOpacity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700/30 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[8px] font-bold opacity-30 uppercase tracking-widest">
                <span>{t.transparent}</span>
                <span>{t.solid}</span>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 cursor-pointer group hover:bg-white/10 transition-all">
              <span className="text-sm font-bold uppercase tracking-widest opacity-70">{t.showGrid}</span>
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 cursor-pointer group hover:bg-white/10 transition-all">
              <span className="text-sm font-bold uppercase tracking-widest opacity-70">{t.showAxes}</span>
              <input
                type="checkbox"
                checked={showAxes}
                onChange={(e) => setShowAxes(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 cursor-pointer group hover:bg-white/10 transition-all">
              <span className="text-sm font-bold uppercase tracking-widest opacity-70">{t.showXValues}</span>
              <input
                type="checkbox"
                checked={showXValues}
                onChange={(e) => setShowXValues(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 cursor-pointer group hover:bg-white/10 transition-all">
              <span className="text-sm font-bold uppercase tracking-widest opacity-70">{t.showYValues}</span>
              <input
                type="checkbox"
                checked={showYValues}
                onChange={(e) => setShowYValues(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CanvasSettingsModal;
