
import React from 'react';
import { GaussianCurve, Theme, Language } from '../types';
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
  curves: GaussianCurve[];
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  onAddCurve: () => void;
  onDeleteCurve: (id: string) => void;
  onUpdateCurve: (id: string, updates: Partial<GaussianCurve>) => void;
  onSettingsToggle: () => void;
  onExport: () => void;
  language: Language;
}

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
  const isLimitReached = curves.length >= 15;

  return (
    <aside 
      className={`fixed right-0 top-0 h-screen w-80 overflow-y-auto border-l flex flex-col p-6 transition-transform duration-500 ease-in-out z-50 shadow-2xl ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } ${
        isDark 
          ? 'bg-slate-950 border-slate-800 text-slate-100 shadow-black/50' 
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-200'
      }`}
    >
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
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-blue-400' : 'hover:bg-slate-100 text-slate-600'}`}
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
      <div className="flex-1 space-y-8">
        {/* Section Header with Integrated Add Button */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.constructionSet}</h3>
            <span className={`text-[10px] opacity-40 font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.activeCount(curves.length)}
            </span>
          </div>
          <button
            onClick={onAddCurve}
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
        </div>

        {isLimitReached && (
          <div className={`p-3 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
            <InfoIcon size={14} className="shrink-0" />
            <p className="text-[10px] font-bold uppercase tracking-tight leading-tight">{t.limitReached}</p>
          </div>
        )}

        {/* Curves List */}
        <div className="space-y-4">
          {curves.map(curve => (
            <div key={curve.id} className={`group p-4 rounded-2xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
              <div className="flex items-center justify-between mb-3">
                <input
                  type="text"
                  value={curve.name}
                  onChange={(e) => onUpdateCurve(curve.id, { name: e.target.value })}
                  className="bg-transparent border-none focus:ring-0 font-bold text-sm w-full p-0"
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

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-500 tracking-tighter">{t.mean} (μ)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={curve.mean.toFixed(2)}
                    onChange={(e) => onUpdateCurve(curve.id, { mean: parseFloat(e.target.value) })}
                    className={`w-full px-2 py-1 rounded-lg border text-xs mono font-bold outline-none focus:border-blue-500/50 transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-500 tracking-tighter">{t.stdDev} (σ)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={curve.sigma.toFixed(2)}
                    onChange={(e) => onUpdateCurve(curve.id, { sigma: Math.max(0.1, parseFloat(e.target.value)) })}
                    className={`w-full px-2 py-1 rounded-lg border text-xs mono font-bold outline-none focus:border-blue-500/50 transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-500 tracking-tighter">{t.peak} (Amp)</label>
                  <div className="flex items-center gap-2">
                     <input
                      type="range"
                      min="0.1"
                      max="1.5"
                      step="0.05"
                      value={curve.amplitude}
                      onChange={(e) => onUpdateCurve(curve.id, { amplitude: parseFloat(e.target.value) })}
                      className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-[10px] mono text-slate-500 font-bold min-w-[30px]">{curve.amplitude.toFixed(2)}</span>
                  </div>
                </div>
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
                onClick={onAddCurve}
                className="text-xs font-black uppercase text-blue-500 hover:text-blue-400 underline underline-offset-4"
              >
                {t.createFirst}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Tip */}
      <div className={`mt-8 pt-8 border-t min-w-0 ${isDark ? 'border-slate-800/50' : 'border-slate-100'}`}>
        <p className="text-[10px] text-slate-500 text-center px-4 leading-relaxed font-medium">
          <span className="text-blue-500 font-bold">{t.proTip.split(':')[0]}:</span> {t.proTip.split(':')[1]}
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
