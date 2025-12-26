
import React, { useState, useRef, useEffect } from 'react';
import { AnyCurve, Theme, Language, CurveKind } from '../types';
import { COLORS } from '../constants';
import { translations } from '../translations';
import { 
  PlusIcon, 
  Trash2Icon, 
  EyeIcon, 
  EyeOffIcon, 
  LockIcon, 
  UnlockIcon,
  DownloadIcon,
  SettingsIcon,
  PanelLeftCloseIcon,
  InfoIcon
} from 'lucide-react';

interface SidebarProps {
  curves: AnyCurve[];
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  onAddCurve: (type: CurveKind) => void;
  onDeleteCurve: (id: string) => void;
  onUpdateCurve: (id: string, updates: Partial<AnyCurve>) => void;
  onSettingsToggle: () => void;
  onExport: () => void;
  language: Language;
}

const NumericInput = ({ 
  value, 
  onChange, 
  className,
  min
}: { 
  value: number, 
  onChange: (val: number) => void, 
  className: string,
  min?: number
}) => {
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    // Only update local value if it's not currently being edited 
    // or if the external value changed significantly
    if (parseFloat(localValue) !== value) {
      setLocalValue(value.toString());
    }
  }, [value]);

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => {
        const s = e.target.value;
        setLocalValue(s);
        const val = parseFloat(s);
        if (!isNaN(val)) {
          onChange(min !== undefined ? Math.max(min, val) : val);
        }
      }}
      onBlur={() => {
        // On blur, reset to the actual value to clean up any invalid strings
        setLocalValue(value.toString());
      }}
      className={className}
    />
  );
};

const Sidebar: React.FC<SidebarProps> = ({ 
  curves, 
  theme, 
  isOpen,
  onClose,
  onAddCurve, 
  onDeleteCurve, 
  onUpdateCurve,
  onSettingsToggle,
  onExport,
  language
}) => {
  const t = translations[language];
  const isDark = theme === 'dark';
  const isLimitReached = curves.length >= 12;
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAddDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside 
      className={`h-screen overflow-y-auto border-l flex flex-col transition-all duration-500 ease-in-out shrink-0 relative ${
        isOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'
      } ${
        isDark 
          ? 'bg-slate-950 border-slate-800 text-slate-100 shadow-2xl shadow-black/50' 
          : 'bg-white border-slate-200 text-slate-900 shadow-2xl shadow-slate-200'
      }`}
    >
      {/* 
          Inner container with fixed width (w-80 = 320px) to prevent 
          content from squishing/reflowing during the width transition.
      */}
      <div className={`w-80 p-6 transition-opacity duration-300 ${isOpen ? 'opacity-100 delay-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              title={t.collapse}
            >
              <PanelLeftCloseIcon size={18} />
            </button>
            <h2 className="text-xl font-bold tracking-tight">{t.inspector}</h2>
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={onSettingsToggle}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              title={t.settingsIcon}
            >
              <SettingsIcon size={18} />
            </button>
            <button 
              onClick={onExport}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              title={t.exportIcon}
            >
              <DownloadIcon size={18} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.constructionSet}</h3>
              <span className={`text-[10px] opacity-40 font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.activeCount(curves.length)}
              </span>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
                disabled={isLimitReached}
                className={`flex items-center gap-1 px-3 py-1.5 text-white text-[10px] font-black uppercase tracking-wider rounded-full transition-all shadow-lg active:scale-90 ${
                  isLimitReached 
                    ? 'bg-slate-700 cursor-not-allowed opacity-50 shadow-none' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                }`}
                title={isLimitReached ? t.limitReached : t.new}
              >
                <PlusIcon size={12} strokeWidth={4} />
                <span>{t.new}</span>
              </button>

              {isAddDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-40 rounded-xl shadow-2xl z-50 py-2 border animate-in fade-in slide-in-from-top-2 duration-200 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <button
                    onClick={() => {
                      onAddCurve('gaussian');
                      setIsAddDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                      isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {t.gaussian}
                  </button>
                    <button
                      onClick={() => {
                        onAddCurve('linear');
                        setIsAddDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                        isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.linear}
                    </button>
                    <button
                      onClick={() => {
                        onAddCurve('quadratic');
                        setIsAddDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                        isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.quadratic}
                    </button>
                  </div>
                )}
            </div>
          </div>

          {isLimitReached && (
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
              <InfoIcon size={14} className="shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-tight leading-tight">{t.limitReached}</p>
            </div>
          )}

          <div className="space-y-4">
            {curves.map(curve => (
              <div key={curve.id} className={`group p-4 rounded-2xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="text"
                    value={curve.name}
                    onChange={(e) => onUpdateCurve(curve.id, { name: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 font-bold text-sm w-full p-0 outline-none"
                  />
                  <div className="flex gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onUpdateCurve(curve.id, { isVisible: !curve.isVisible })} 
                      className={`p-1 transition-colors ${curve.isVisible ? 'hover:text-blue-500' : 'text-blue-500'}`}
                    >
                      {curve.isVisible ? <EyeIcon size={14} /> : <EyeOffIcon size={14} />}
                    </button>
                    <button 
                      onClick={() => onUpdateCurve(curve.id, { isLocked: !curve.isLocked })} 
                      className={`p-1 transition-colors ${curve.isLocked ? 'text-amber-500' : 'hover:text-amber-500'}`}
                    >
                      {curve.isLocked ? <LockIcon size={14} /> : <UnlockIcon size={14} />}
                    </button>
                    <button onClick={() => onDeleteCurve(curve.id)} className="p-1 hover:text-red-500">
                      <Trash2Icon size={14} />
                    </button>
                  </div>
                </div>

                {curve.type === 'gaussian' && (
                  <>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-slate-500 tracking-tighter">{t.mean} (μ)</label>
                        <NumericInput
                          value={curve.mean}
                          onChange={(val) => onUpdateCurve(curve.id, { mean: val })}
                          className={`w-full px-2 py-1 rounded-lg border text-xs mono font-bold outline-none focus:border-blue-500/50 transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-slate-500 tracking-tighter">{t.stdDev} (σ)</label>
                        <NumericInput
                          value={curve.sigma}
                          min={0.05}
                          onChange={(val) => onUpdateCurve(curve.id, { sigma: val })}
                          className={`w-full px-2 py-1 rounded-lg border text-xs mono font-bold outline-none focus:border-blue-500/50 transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1 mb-4">
                      <label className="text-[9px] uppercase font-black text-slate-500 tracking-tighter">{t.peak} (Amp)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0.01"
                          max="5"
                          step="0.05"
                          value={curve.amplitude}
                          onChange={(e) => onUpdateCurve(curve.id, { amplitude: parseFloat(e.target.value) })}
                          className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <span className="text-[10px] mono text-slate-500 font-bold min-w-[30px]">{curve.amplitude.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}

                {curve.type === 'linear' && (
                  <>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-slate-500 tracking-tighter">{t.slope} (a)</label>
                        <NumericInput
                          value={curve.slope}
                          onChange={(val) => onUpdateCurve(curve.id, { slope: val })}
                          className={`w-full px-2 py-1 rounded-lg border text-xs mono font-bold outline-none focus:border-blue-500/50 transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-slate-500 tracking-tighter">{t.intercept} (b)</label>
                        <NumericInput
                          value={curve.intercept}
                          onChange={(val) => onUpdateCurve(curve.id, { intercept: val })}
                          className={`w-full px-2 py-1 rounded-lg border text-xs mono font-bold outline-none focus:border-blue-500/50 transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                        />
                      </div>
                    </div>
                  </>
                )}

                {curve.type === 'quadratic' && (
                  <>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-slate-500 tracking-tighter">{t.curvature} (a)</label>
                        <NumericInput
                          value={curve.a}
                          onChange={(val) => onUpdateCurve(curve.id, { a: val })}
                          className={`w-full px-2 py-1 rounded-lg border text-xs mono font-bold outline-none focus:border-blue-500/50 transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-slate-500 tracking-tighter">{t.vertexX} (h)</label>
                        <NumericInput
                          value={curve.h}
                          onChange={(val) => onUpdateCurve(curve.id, { h: val })}
                          className={`w-full px-2 py-1 rounded-lg border text-xs mono font-bold outline-none focus:border-blue-500/50 transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-slate-500 tracking-tighter">{t.vertexY} (k)</label>
                        <NumericInput
                          value={curve.k}
                          onChange={(val) => onUpdateCurve(curve.id, { k: val })}
                          className={`w-full px-2 py-1 rounded-lg border text-xs mono font-bold outline-none focus:border-blue-500/50 transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end">
                  <div className="flex flex-wrap gap-1 max-w-[60px] justify-end">
                    {COLORS.slice(0, 6).map(color => (
                      <button
                        key={color}
                        onClick={() => onUpdateCurve(curve.id, { color })}
                        className={`w-3 h-3 rounded-full transition-all active:scale-75 ${
                          curve.color === color 
                            ? 'ring-2 ring-blue-500 ring-offset-2 ' + (isDark ? 'ring-offset-slate-900' : 'ring-offset-white') 
                            : 'hover:scale-125'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {curves.length === 0 && (
              <div className={`text-center py-12 rounded-3xl border-2 border-dashed ${isDark ? 'border-slate-800 text-slate-600' : 'border-slate-100 text-slate-400'}`}>
                <p className="text-sm italic mb-4">{t.noCurves}</p>
                <button
                  onClick={() => onAddCurve('gaussian')}
                  className="text-xs font-black uppercase text-blue-500 hover:text-blue-400 underline underline-offset-4"
                >
                  {t.createFirst}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={`mt-8 pt-8 border-t min-w-0 ${isDark ? 'border-slate-800/50' : 'border-slate-100'}`}>
          <p className="text-[10px] text-slate-500 text-center px-4 leading-relaxed font-medium">
            <span className="text-blue-500 font-bold">{t.proTip.split(':')[0]}:</span> {t.proTip.split(':')[1]}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
