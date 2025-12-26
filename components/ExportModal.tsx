
import React, { useState, useEffect, useRef } from 'react';
import { AnyCurve, Theme, ExportSettings, Language } from '../types';
import { translations } from '../translations';
import { XIcon, CheckCircle2Icon, CircleIcon, PaletteIcon } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (settings: ExportSettings) => void;
  curves: AnyCurve[];
  theme: Theme;
  currentTitle: string;
  initialSettings: ExportSettings | null;
  language: Language;
}

const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  curves, 
  theme, 
  currentTitle, 
  initialSettings,
  language 
}) => {
  const t = translations[language];
  
  const [settings, setSettings] = useState<ExportSettings>({
    showTitle: true,
    title: currentTitle,
    showLegend: true,
    showScales: true,
    showGrid: true,
    showAxes: true,
    showXValues: true,
    showYValues: true,
    selectedCurveIds: curves.filter(c => c.isVisible).map(c => c.id),
    backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc',
  });

  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && initialSettings) {
      setSettings(initialSettings);
    }
  }, [isOpen, initialSettings]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

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

          {/* Visibility Toggles Grid */}
          <section className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setSettings(s => ({ ...s, showLegend: !s.showLegend }))}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${settings.showLegend ? 'bg-blue-600/10 border-blue-500/50' : 'bg-transparent border-white/5 opacity-50'}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">{t.includeLegend}</span>
              {settings.showLegend ? <CheckCircle2Icon size={16} /> : <CircleIcon size={16} />}
            </button>
            <button 
              onClick={() => setSettings(s => ({ ...s, showScales: !s.showScales }))}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${settings.showScales ? 'bg-blue-600/10 border-blue-500/50' : 'bg-transparent border-white/5 opacity-50'}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">{t.showScales}</span>
              {settings.showScales ? <CheckCircle2Icon size={16} /> : <CircleIcon size={16} />}
            </button>
            <button 
              onClick={() => setSettings(s => ({ ...s, showGrid: !s.showGrid }))}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${settings.showGrid ? 'bg-blue-600/10 border-blue-500/50' : 'bg-transparent border-white/5 opacity-50'}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">{t.showGrid}</span>
              {settings.showGrid ? <CheckCircle2Icon size={16} /> : <CircleIcon size={16} />}
            </button>
            <button 
              onClick={() => setSettings(s => ({ ...s, showAxes: !s.showAxes }))}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${settings.showAxes ? 'bg-blue-600/10 border-blue-500/50' : 'bg-transparent border-white/5 opacity-50'}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">{t.showAxes}</span>
              {settings.showAxes ? <CheckCircle2Icon size={16} /> : <CircleIcon size={16} />}
            </button>
            <button 
              onClick={() => setSettings(s => ({ ...s, showXValues: !s.showXValues }))}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${settings.showXValues ? 'bg-blue-600/10 border-blue-500/50' : 'bg-transparent border-white/5 opacity-50'}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">{t.showXValues}</span>
              {settings.showXValues ? <CheckCircle2Icon size={16} /> : <CircleIcon size={16} />}
            </button>
            <button 
              onClick={() => setSettings(s => ({ ...s, showYValues: !s.showYValues }))}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${settings.showYValues ? 'bg-blue-600/10 border-blue-500/50' : 'bg-transparent border-white/5 opacity-50'}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">{t.showYValues}</span>
              {settings.showYValues ? <CheckCircle2Icon size={16} /> : <CircleIcon size={16} />}
            </button>
          </section>

          {/* Background Color Selection */}
          <section className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-blue-500">{t.backgroundColor}</label>
            <div className="relative" ref={colorPickerRef}>
              {showColorPicker && (
                <div className="absolute z-50 bottom-full mb-4 p-4 rounded-3xl shadow-2xl border animate-in fade-in slide-in-from-bottom-2 duration-200 bg-slate-900 border-white/10 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0">
                  <HexColorPicker 
                    color={settings.backgroundColor} 
                    onChange={(color) => setSettings(s => ({ ...s, backgroundColor: color }))} 
                  />
                  <div className="mt-4 flex gap-2">
                    <input 
                      type="text"
                      value={settings.backgroundColor}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^#[0-9A-F]{0,6}$/i.test(val)) {
                          setSettings(s => ({ ...s, backgroundColor: val }));
                        }
                      }}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold mono uppercase outline-none focus:border-blue-500 transition-colors"
                    />
                    <button 
                      onClick={() => setShowColorPicker(false)}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
              
              <div className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-10 h-10 rounded-xl shadow-inner border border-white/10 shrink-0 transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: settings.backgroundColor }}
                />
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs opacity-40 font-black">#</span>
                  <input 
                    type="text"
                    value={settings.backgroundColor.replace('#', '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^[0-9A-F]{0,6}$/i.test(val)) {
                        setSettings(s => ({ ...s, backgroundColor: `#${val}` }));
                      }
                    }}
                    className="w-full bg-transparent text-sm font-bold mono uppercase outline-none focus:text-blue-500 transition-colors"
                    placeholder="FFFFFF"
                  />
                </div>
                <button 
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className={`p-2 rounded-lg transition-colors ${showColorPicker ? 'bg-blue-500/20 text-blue-500' : 'hover:bg-white/5 opacity-40'}`}
                >
                  <PaletteIcon size={18} />
                </button>
              </div>
            </div>
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
