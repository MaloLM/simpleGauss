
import React from 'react';
import { AppSettings, Theme } from '../types';
import { translations } from '../translations';
import { XIcon, SunIcon, MoonIcon, MousePointer2Icon, LayersIcon, LanguagesIcon } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  if (!isOpen) return null;

  const t = translations[settings.language];
  const isDark = settings.theme === 'dark';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-900'}`}>
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-black uppercase tracking-tight">{t.settings}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <XIcon size={20} />
          </button>
        </div>

        <div className="p-8 space-y-10">
          {/* Appearance Toggle */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                {isDark ? <MoonIcon size={16} /> : <SunIcon size={16} />}
              </div>
              <label className="text-xs font-black uppercase tracking-widest opacity-60">{t.appearance}</label>
            </div>
            <div className={`flex p-1 rounded-2xl ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
              <button 
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${!isDark ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <SunIcon size={16} /> {t.light}
              </button>
              <button 
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${isDark ? 'bg-slate-800 shadow-lg text-blue-400' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <MoonIcon size={16} /> {t.dark}
              </button>
            </div>
          </section>

          {/* Language Toggle */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                <LanguagesIcon size={16} />
              </div>
              <label className="text-xs font-black uppercase tracking-widest opacity-60">{t.language}</label>
            </div>
            <div className={`flex p-1 rounded-2xl ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
              <button 
                onClick={() => onUpdateSettings({ language: 'en' })}
                className={`flex-1 flex items-center justify-center py-2 rounded-xl font-bold text-sm transition-all ${settings.language === 'en' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                English
              </button>
              <button 
                onClick={() => onUpdateSettings({ language: 'fr' })}
                className={`flex-1 flex items-center justify-center py-2 rounded-xl font-bold text-sm transition-all ${settings.language === 'fr' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Français
              </button>
            </div>
          </section>

          {/* Handle Size Slider */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                  <MousePointer2Icon size={16} />
                </div>
                <label className="text-xs font-black uppercase tracking-widest opacity-60">{t.interactionNodes}</label>
              </div>
              <span className="text-[10px] font-black px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md">{(settings.handleSize * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.25"
              step="0.01"
              value={settings.handleSize}
              onChange={(e) => onUpdateSettings({ handleSize: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-700/30 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[8px] font-bold opacity-30 uppercase tracking-widest">
              <span>{t.precise}</span>
              <span>{t.large}</span>
            </div>
          </section>

          {/* Curve Opacity Slider */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                  <LayersIcon size={16} />
                </div>
                <label className="text-xs font-black uppercase tracking-widest opacity-60">{t.visualDensity}</label>
              </div>
              <span className="text-[10px] font-black px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md">{(settings.curveOpacity * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.6"
              step="0.01"
              value={settings.curveOpacity}
              onChange={(e) => onUpdateSettings({ curveOpacity: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-700/30 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[8px] font-bold opacity-30 uppercase tracking-widest">
              <span>{t.transparent}</span>
              <span>{t.solid}</span>
            </div>
          </section>
        </div>

        <div className="p-6 bg-black/20 text-center">
          <button 
            onClick={onClose}
            className={`px-12 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
          >
            {t.savePrefs}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
