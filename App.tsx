
import React, { useState, useCallback, useEffect } from 'react';
import { GaussianCurve, Theme, ViewBox, ExportSettings, AppSettings } from './types';
import { DEFAULT_VIEW_BOX, COLORS, INITIAL_CURVES } from './constants';
import ConstructionCanvas from './components/ConstructionCanvas';
import Sidebar from './components/Sidebar';
import ExportModal from './components/ExportModal';
import SettingsModal from './components/SettingsModal';
import { translations } from './translations';
import { PanelLeftOpenIcon, PanelLeftCloseIcon, RefreshCcwIcon } from 'lucide-react';

const App: React.FC = () => {
  const [curves, setCurves] = useState<GaussianCurve[]>(INITIAL_CURVES);
  const [title, setTitle] = useState('Distribution Model - 01');
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeExportSettings, setActiveExportSettings] = useState<ExportSettings | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showXValues, setShowXValues] = useState(true);
  const [showYValues, setShowYValues] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  
  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme: 'dark',
    handleSize: 0.1,
    curveOpacity: 0.12,
    language: 'en'
  });

  const t = translations[appSettings.language];

  const updateAppSettings = useCallback((updates: Partial<AppSettings>) => {
    setAppSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const addCurve = useCallback(() => {
    if (curves.length >= 15) return;
    const newId = Math.random().toString(36).substr(2, 9);
    const newCurve: GaussianCurve = {
      id: newId,
      name: appSettings.language === 'en' ? `Curve ${curves.length + 1}` : `Courbe ${curves.length + 1}`,
      mean: (Math.random() - 0.5) * 6 + panOffset.x,
      sigma: 0.8 + Math.random() * 0.4,
      amplitude: 0.6 + Math.random() * 0.4,
      color: COLORS[curves.length % COLORS.length],
      isVisible: true,
      isLocked: false,
    };
    setCurves(prev => [...prev, newCurve]);
  }, [curves.length, panOffset.x, appSettings.language]);

  const deleteCurve = useCallback((id: string) => {
    setCurves(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateCurve = useCallback((id: string, updates: Partial<GaussianCurve>) => {
    setCurves(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const resetView = useCallback(() => {
    setPanOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!isExporting || !activeExportSettings) return;

    const capture = async () => {
      // ENSURE we target the unique canvas SVG ID to avoid capturing UI icons
      const svgElement = document.getElementById('main-canvas-svg') as unknown as SVGElement | null;
      if (!svgElement) {
        setIsExporting(false);
        return;
      }

      // Small delay to ensure state-driven visibility changes (like handles disappearing) are reflected
      await new Promise(r => setTimeout(r, 200));

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const svgSize = svgElement.getBoundingClientRect();
      
      const scale = 4; // High resolution scale for clear output
      canvas.width = svgSize.width * scale;
      canvas.height = svgSize.height * scale;
      
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        if (ctx) {
          const isDark = appSettings.theme === 'dark';
          const bgColor = isDark ? '#0f172a' : '#f8fafc';
          const primaryTextColor = isDark ? '#ffffff' : '#0f172a';
          const secondaryTextColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(15, 23, 42, 0.5)';
          const legendBgColor = isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)';

          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          if (activeExportSettings.showTitle) {
            let baseFontSize = 80 * scale;
            const maxTitleWidth = canvas.width * 0.85;
            // Slightly less bold title font weight (800 instead of 900)
            ctx.font = `800 ${baseFontSize}px Inter, sans-serif`;
            let textWidth = ctx.measureText(activeExportSettings.title).width;
            while (textWidth > maxTitleWidth && baseFontSize > 20 * scale) {
              baseFontSize -= 2 * scale;
              ctx.font = `800 ${baseFontSize}px Inter, sans-serif`;
              textWidth = ctx.measureText(activeExportSettings.title).width;
            }
            ctx.fillStyle = primaryTextColor;
            ctx.textBaseline = 'top';
            ctx.fillText(activeExportSettings.title, 48 * scale, 48 * scale);
          }
          
          if (activeExportSettings.showLegend) {
            const legendCurves = curves.filter(c => activeExportSettings.selectedCurveIds.includes(c.id));
            const legendX = 48 * scale;
            let legendY = canvas.height - (48 * scale);
            const itemHeight = 36 * scale;
            const boxPadding = 12 * scale;
            const boxWidth = 180 * scale;

            legendCurves.reverse().forEach((curve) => {
              ctx.fillStyle = legendBgColor;
              const bx = legendX - boxPadding;
              const by = legendY - itemHeight + boxPadding;
              const bw = boxWidth;
              const bh = itemHeight;
              const radius = 8 * scale;
              
              ctx.beginPath();
              ctx.moveTo(bx + radius, by);
              ctx.lineTo(bx + bw - radius, by);
              ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + radius);
              ctx.lineTo(bx + bw, by + bh - radius);
              ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - radius, by + bh);
              ctx.lineTo(bx + radius, by + bh);
              ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - radius);
              ctx.lineTo(bx, by + radius);
              ctx.quadraticCurveTo(bx, by, bx + radius, by);
              ctx.closePath();
              ctx.fill();

              ctx.beginPath();
              ctx.arc(legendX + (8 * scale), legendY - (10 * scale), 6 * scale, 0, Math.PI * 2);
              ctx.fillStyle = curve.color;
              ctx.fill();

              ctx.fillStyle = secondaryTextColor;
              ctx.font = `900 ${10 * scale}px Inter, sans-serif`;
              ctx.fillText(curve.name.toUpperCase(), legendX + (24 * scale), legendY - (22 * scale));

              ctx.fillStyle = primaryTextColor;
              ctx.font = `bold ${12 * scale}px JetBrains Mono, monospace`;
              ctx.fillText(`μ:${curve.mean.toFixed(1)} σ:${curve.sigma.toFixed(1)}`, legendX + (24 * scale), legendY - (8 * scale));

              legendY -= (itemHeight + 8 * scale);
            });
          }
          
          const pngUrl = canvas.toDataURL('image/png', 1.0);
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `${activeExportSettings.title.toLowerCase().replace(/\s+/g, '-')}.png`;
          downloadLink.click();
        }
        URL.revokeObjectURL(url);
        setIsExporting(false);
        setActiveExportSettings(null);
      };
      img.src = url;
    };

    capture();
  }, [isExporting, appSettings.theme, activeExportSettings, curves]);

  const handleStartExport = (settings: ExportSettings) => {
    setIsExportModalOpen(false);
    setActiveExportSettings(settings);
    setIsExporting(true);
  };

  const displayCurves = isExporting && activeExportSettings
    ? curves.filter(c => activeExportSettings.selectedCurveIds.includes(c.id))
    : curves;

  const theme = appSettings.theme;

  return (
    <div className={`fixed inset-0 flex transition-colors duration-500 overflow-hidden ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <main className="relative flex-1 flex flex-col overflow-hidden h-full">
        {/* Header Overlay */}
        <header className="absolute top-0 left-0 w-full p-8 md:p-12 z-10 pointer-events-none flex justify-between items-start">
          <div className="flex flex-col gap-1 pointer-events-auto max-w-lg">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              // Slightly less bold title weight: font-extrabold instead of font-black
              className={`text-3xl md:text-4xl font-extrabold bg-transparent border-none focus:ring-0 w-full p-0 outline-none transition-colors ${theme === 'dark' ? 'text-white/90' : 'text-slate-900/90'}`}
            />
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em]">{t.appSubtitle}</p>
          </div>
          
          <div className="flex gap-3 pointer-events-auto items-center">
            <button 
              onClick={resetView}
              className={`p-3 rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 ${
                panOffset.x === 0 && panOffset.y === 0 ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
              } ${theme === 'dark' ? 'bg-slate-800 text-white border border-white/10' : 'bg-white text-slate-900 border border-slate-200'}`}
              title={t.reset}
            >
              <RefreshCcwIcon size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">{t.reset}</span>
            </button>
            
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-3 rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 ${theme === 'dark' ? 'bg-slate-800 text-white border border-white/10' : 'bg-white text-slate-900 border border-slate-200'}`}
              title={isSidebarOpen ? t.collapse : t.open}
            >
              {isSidebarOpen ? <PanelLeftCloseIcon size={20} /> : <PanelLeftOpenIcon size={20} />}
            </button>
          </div>
        </header>

        {/* Chart View */}
        <ConstructionCanvas 
          curves={displayCurves} 
          viewBox={DEFAULT_VIEW_BOX} 
          theme={theme}
          isExporting={isExporting}
          showScalesInExport={activeExportSettings?.showScales}
          onUpdateCurve={updateCurve}
          panOffset={panOffset}
          onPan={setPanOffset}
          handleSize={appSettings.handleSize}
          curveOpacity={appSettings.curveOpacity}
          language={appSettings.language}
          showXValues={isExporting ? !!activeExportSettings?.showXValues : showXValues}
          showYValues={isExporting ? !!activeExportSettings?.showYValues : showYValues}
          showGrid={isExporting ? !!activeExportSettings?.showGrid : showGrid}
          showAxes={isExporting ? !!activeExportSettings?.showAxes : showAxes}
        />

        {/* Labels Control Overlay */}
        {!isExporting && (
          <div className="absolute bottom-6 left-4 md:bottom-10 md:left-10 flex flex-wrap gap-x-6 gap-y-2 z-20">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={showGrid} 
                onChange={() => setShowGrid(!showGrid)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${theme === 'dark' ? 'text-white/60 group-hover:text-white' : 'text-slate-900/60 group-hover:text-slate-900'}`}>{t.showGrid}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={showAxes} 
                onChange={() => setShowAxes(!showAxes)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${theme === 'dark' ? 'text-white/60 group-hover:text-white' : 'text-slate-900/60 group-hover:text-slate-900'}`}>{t.showAxes}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={showXValues} 
                onChange={() => setShowXValues(!showXValues)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${theme === 'dark' ? 'text-white/60 group-hover:text-white' : 'text-slate-900/60 group-hover:text-slate-900'}`}>{t.showXValues}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={showYValues} 
                onChange={() => setShowYValues(!showYValues)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${theme === 'dark' ? 'text-white/60 group-hover:text-white' : 'text-slate-900/60 group-hover:text-slate-900'}`}>{t.showYValues}</span>
            </label>
          </div>
        )}

        {/* Legend Overlay - Positioned within frame bounds with adjusted spacing */}
        {!isExporting && (
          <div className="absolute bottom-24 md:bottom-28 left-8 md:left-14 grid grid-cols-2 gap-3 pointer-events-none max-w-[calc(100%-2rem)] z-10">
            {curves.filter(c => c.isVisible).map(c => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: c.color }} />
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-tighter opacity-40 leading-none mb-1 truncate">{c.name}</span>
                  <span className="text-[10px] mono font-bold opacity-80 leading-none truncate">μ:{c.mean.toFixed(1)} σ:{c.sigma.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Sidebar 
        curves={curves} 
        theme={theme}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onAddCurve={addCurve}
        onDeleteCurve={deleteCurve}
        onUpdateCurve={updateCurve}
        onSettingsToggle={() => setIsSettingsModalOpen(true)}
        onExport={() => {
          // Initialize modal with current UI state
          setActiveExportSettings({
            showTitle: true,
            title: title,
            showLegend: true,
            showScales: true,
            showGrid: showGrid,
            showAxes: showAxes,
            showXValues: showXValues,
            showYValues: showYValues,
            selectedCurveIds: curves.filter(c => c.isVisible).map(c => c.id),
          });
          setIsExportModalOpen(true);
        }}
        language={appSettings.language}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleStartExport}
        curves={curves}
        theme={theme}
        currentTitle={title}
        initialSettings={activeExportSettings}
        language={appSettings.language}
      />

      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={appSettings}
        onUpdateSettings={updateAppSettings}
      />
    </div>
  );
};

export default App;
