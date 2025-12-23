
import React, { useState, useEffect } from 'react';
import { GaussianCurve, Theme, ExportSettings, Language } from '../types';
import { translations } from '../translations';
import { XIcon, CheckCircle2Icon, CircleIcon } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (settings: ExportSettings) => void;
  curves: GaussianCurve[];
  theme: Theme;
  currentTitle: string;
  language: Language;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onConfirm, curves, theme, currentTitle, language }) => {
  const t = translations[language];
  
  const [settings, setSettings] = useState<ExportSettings>({
    showTitle: true,
    title: currentTitle,
    showLegend: true,
    showScales: true,
    selectedCurveIds: curves.filter(c => c.isVisible).map(c => c.id),
  });

  useEffect(() => {
    if (isOpen) {
      setSettings({
        showTitle: true,
        title: currentTitle,
        showLegend: true,
        showScales: true,
        selectedCurveIds: curves.filter(c => c.isVisible).map(c => c.id),
      });
    }
  }, [isOpen, curves, currentTitle]);

  if (!isOpen) return null;

  const toggleCurve = (id: string) => {
    setSettings(prev => ({
      ...prev,
      selectedCurveIds: prev.selectedCurveIds.includes(id)
        ? prev.selectedCurveIds.filter(cid => cid !== id)
        : [...prev.selectedCurveIds, id]
    }));
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-900'}`}>
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-black uppercase tracking-tight">{t.exportTitle}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <XIcon size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Title Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-blue-500">{t.docTitle}</label>
              <button 
                onClick={() => setSettings(s => ({ ...s, showTitle: !s.showTitle }))}
                className={`text-[10px] font-bold px-2 py-1 rounded ${settings.showTitle ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                {settings.showTitle ? t.visible : t.hidden}
              </button>
            </div>
            <input
              type="text"
              disabled={!settings.showTitle}
              value={settings.title}
              onChange={(e) => setSettings(s => ({ ...s, title: e.target.value }))}
              className={`w-full text-2xl font-black bg-transparent border-b-2 outline-none py-2 transition-opacity ${!settings.showTitle ? 'opacity-30' : 'opacity-100'} ${isDark ? 'border-white/10 focus:border-blue-500' : 'border-slate-200 focus:border-blue-500'}`}
              placeholder="..."
            />
          </section>

          {/* Visibility Toggles */}
          <section className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setSettings(s => ({ ...s, showLegend: !s.showLegend }))}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${settings.showLegend ? 'bg-blue-600/10 border-blue-500/50' : 'bg-transparent border-white/5 opacity-50'}`}
            >
              <span className="text-sm font-bold uppercase tracking-wider">{t.includeLegend}</span>
              {settings.showLegend ? <CheckCircle2Icon size={18} /> : <CircleIcon size={18} />}
            </button>
            <button 
              onClick={() => setSettings(s => ({ ...s, showScales: !s.showScales }))}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${settings.showScales ? 'bg-blue-600/10 border-blue-500/50' : 'bg-transparent border-white/5 opacity-50'}`}
            >
              <span className="text-sm font-bold uppercase tracking-wider">{t.showScales}</span>
              {settings.showScales ? <CheckCircle2Icon size={18} /> : <CircleIcon size={18} />}
            </button>
          </section>

          {/* Curve Selection */}
          <section className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-blue-500">{t.individualCurves}</label>
            <div className="grid grid-cols-2 gap-2">
              {curves.map(curve => (
                <button
                  key={curve.id}
                  onClick={() => toggleCurve(curve.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${settings.selectedCurveIds.includes(curve.id) ? 'bg-white/5 border-white/20' : 'bg-transparent border-transparent opacity-40'}`}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: curve.color }} />
                  <span className="text-xs font-bold truncate text-left">{curve.name}</span>
                  {settings.selectedCurveIds.includes(curve.id) && <CheckCircle2Icon size={14} className="ml-auto text-blue-500 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 bg-black/20 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-colors"
          >
            {t.cancel}
          </button>
          <button 
            onClick={() => onConfirm(settings)}
            disabled={settings.selectedCurveIds.length === 0}
            className="flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest text-xs bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {t.download}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
