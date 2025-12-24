import React from 'react';
import { MonitorIcon } from 'lucide-react';
import { translations } from '../translations';
import { Language, Theme } from '../types';

interface MobilePreventionProps {
  language: Language;
  theme: Theme;
}

const MobilePrevention: React.FC<MobilePreventionProps> = ({ language, theme }) => {
  const t = translations[language];
  
  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 text-center transition-colors duration-500 ${
      theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className={`mb-8 p-6 rounded-3xl ${
        theme === 'dark' ? 'bg-slate-800 border border-white/10' : 'bg-white border border-slate-200'
      } shadow-2xl`}>
        <MonitorIcon size={48} className="text-blue-500" />
      </div>
      <h1 className="text-2xl font-bold mb-4 max-w-xs">
        {t.mobilePrevention}
      </h1>
      <p className={`text-sm uppercase tracking-[0.2em] font-black opacity-40 ${
        theme === 'dark' ? 'text-white' : 'text-slate-900'
      }`}>
        Simple Gauss
      </p>
    </div>
  );
};

export default MobilePrevention;
