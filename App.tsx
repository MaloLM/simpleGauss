import React, { useState, useCallback, useEffect } from "react";
import {
  AnyCurve,
  CurveKind,
  ExportSettings,
  AppSettings,
} from "./types";
import { DEFAULT_VIEW_BOX, COLORS, INITIAL_CURVES } from "./constants";
import ConstructionCanvas from "./components/ConstructionCanvas";
import Sidebar from "./components/Sidebar";
import ExportModal from "./components/ExportModal";
import SettingsModal from "./components/SettingsModal";
import CanvasSettingsModal from "./components/CanvasSettingsModal";
import MobilePrevention from "./components/MobilePrevention";
import { translations } from "./translations";
import {
  PanelLeftOpenIcon,
  PanelLeftCloseIcon,
  PlusIcon,
  MinusIcon,
  CameraIcon,
  Settings2Icon,
} from "lucide-react";

const App: React.FC = () => {
  const [curves, setCurves] = useState<AnyCurve[]>(INITIAL_CURVES);
  const [title, setTitle] = useState("Your Model");
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCanvasSettingsOpen, setIsCanvasSettingsOpen] = useState(false);
  const [activeExportSettings, setActiveExportSettings] =
    useState<ExportSettings | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showXValues, setShowXValues] = useState(true);
  const [showYValues, setShowYValues] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme: "dark",
    handleSize: 0.1,
    curveOpacity: 0.1,
    language: "en",
  });

  const t = translations[appSettings.language];

  const updateAppSettings = useCallback((updates: Partial<AppSettings>) => {
    setAppSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const addCurve = useCallback((type: CurveKind) => {
    if (curves.length >= 12) return;
    const newId = Math.random().toString(36).substr(2, 9);
    
    let newCurve: AnyCurve;
    
    const colorIndex = curves.length % COLORS.length;
    const nextColor = COLORS[colorIndex];

    if (type === 'gaussian') {
      newCurve = {
        id: newId,
        type: 'gaussian',
        name: `${t.gaussian} ${curves.length + 1}`,
        mean: (Math.random() - 0.5) * 6 + panOffset.x,
        sigma: 0.8 + Math.random() * 0.4,
        amplitude: 0.6 + Math.random() * 0.4,
        color: nextColor,
        isVisible: true,
        isLocked: false,
      };
    } else if (type === 'linear') {
      newCurve = {
        id: newId,
        type: 'linear',
        name: `${t.linear} ${curves.length + 1}`,
        slope: 0.5,
        intercept: 1,
        color: nextColor,
        isVisible: true,
        isLocked: false,
      };
    } else if (type === 'quadratic') {
      newCurve = {
        id: newId,
        type: 'quadratic',
        name: `${t.quadratic} ${curves.length + 1}`,
        a: 0.5,
        h: panOffset.x,
        k: 1 + panOffset.y,
        color: nextColor,
        isVisible: true,
        isLocked: false,
      };
    } else if (type === 'powerLaw') {
      newCurve = {
        id: newId,
        type: 'powerLaw',
        name: `${t.powerLaw} ${curves.length + 1}`,
        a: 1,
        b: -1,
        h: panOffset.x,
        k: panOffset.y,
        color: nextColor,
        isVisible: true,
        isLocked: false,
      };
    } else if (type === 'exponential') {
      newCurve = {
        id: newId,
        type: 'exponential',
        name: `${t.exponential} ${curves.length + 1}`,
        a: 1,
        base: 2,
        h: panOffset.x,
        k: panOffset.y,
        color: nextColor,
        isVisible: true,
        isLocked: false,
      };
    } else {
      return;
    }

    setCurves((prev) => [...prev, newCurve]);
  }, [curves.length, panOffset.x, appSettings.language]);

  const deleteCurve = useCallback((id: string) => {
    setCurves((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAllCurves = useCallback(() => {
    setCurves([]);
  }, []);

  const reorderCurves = useCallback((startIndex: number, endIndex: number) => {
    setCurves((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const updateCurve = useCallback(
    (id: string, updates: Partial<AnyCurve>) => {
      setCurves((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } as AnyCurve : c))
      );
    },
    []
  );

  const resetView = useCallback(() => {
    setPanOffset({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 50));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.1));

  const handleOpenExport = useCallback(() => {
    setActiveExportSettings({
      showTitle: true,
      title: title,
      showLegend: true,
      showScales: true,
      showGrid: showGrid,
      showAxes: showAxes,
      showXValues: showXValues,
      showYValues: showYValues,
      selectedCurveIds: curves.filter((c) => c.isVisible).map((c) => c.id),
      backgroundColor: appSettings.theme === "dark" ? "#0f172a" : "#f8fafc",
    });
    setIsExportModalOpen(true);
  }, [title, showGrid, showAxes, showXValues, showYValues, curves]);

  useEffect(() => {
    if (!isExporting || !activeExportSettings) return;

    const capture = async () => {
      const svgElement = document.getElementById(
        "main-canvas-svg"
      ) as unknown as SVGElement | null;
      if (!svgElement) {
        setIsExporting(false);
        return;
      }

      await new Promise((r) => setTimeout(r, 200));

      // Ensure all styles are computed and applied inline for the capture
      const svgClone = svgElement.cloneNode(true) as SVGElement;
      
      // Explicitly set dimensions on the clone to ensure it's not 0x0
      svgClone.setAttribute('width', svgElement.clientWidth.toString());
      svgClone.setAttribute('height', svgElement.clientHeight.toString());

      // Inject styles to ensure text is visible and smaller
      const style = document.createElement('style');
      style.textContent = `
        text { 
          font-family: Inter, system-ui, sans-serif !important;
          font-weight: bold !important;
          font-size: 0.14px !important;
        }
      `;
      svgClone.prepend(style);

      const svgData = new XMLSerializer().serializeToString(svgClone);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const svgSize = svgElement.getBoundingClientRect();

      const scale = 4;
      canvas.width = svgSize.width * scale;
      canvas.height = svgSize.height * scale;

      const img = new Image();
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        if (ctx) {
          // Small delay to ensure image is fully ready for drawing
          const isDark = appSettings.theme === "dark";
          const bgColor = activeExportSettings.backgroundColor;
          const primaryTextColor = isDark ? "#ffffff" : "#0f172a";
          const secondaryTextColor = isDark
            ? "rgba(255, 255, 255, 0.5)"
            : "rgba(15, 23, 42, 0.5)";
          const legendBgColor = isDark
            ? "rgba(30, 41, 59, 0.8)"
            : "rgba(255, 255, 255, 0.8)";

          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Ensure smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Draw the SVG image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          if (activeExportSettings.showTitle) {
            let baseFontSize = 32 * scale;
            const maxTitleWidth = canvas.width * 0.85;
            ctx.font = `600 ${baseFontSize}px Inter, sans-serif`;
            let textWidth = ctx.measureText(activeExportSettings.title).width;
            while (textWidth > maxTitleWidth && baseFontSize > 12 * scale) {
              baseFontSize -= 2 * scale;
              ctx.font = `600 ${baseFontSize}px Inter, sans-serif`;
              textWidth = ctx.measureText(activeExportSettings.title).width;
            }
            
            // Match canvas title opacity (60%)
            const titleColor = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(15, 23, 42, 0.6)';
            ctx.fillStyle = titleColor;
            ctx.textBaseline = 'top';
            ctx.fillText(activeExportSettings.title, 48 * scale, 48 * scale);
          }

          if (activeExportSettings.showLegend) {
            const legendCurves = curves.filter((c) =>
              activeExportSettings.selectedCurveIds.includes(c.id)
            );
            const legendX = 48 * scale;
            let legendY = canvas.height - 48 * scale;
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

              ctx.arc(
                legendX + 8 * scale,
                legendY - 10 * scale,
                6 * scale,
                0,
                Math.PI * 2
              );
              ctx.fillStyle = curve.color;
              ctx.fill();

              ctx.fillStyle = secondaryTextColor;
              ctx.font = `900 ${10 * scale}px Inter, sans-serif`;
              ctx.fillText(
                curve.name.toUpperCase(),
                legendX + 24 * scale,
                legendY - 22 * scale
              );

              ctx.fillStyle = primaryTextColor;
              ctx.font = `bold ${12 * scale}px JetBrains Mono, monospace`;
              if (curve.type === 'gaussian') {
                ctx.fillText(
                  `μ:${curve.mean.toFixed(1)} σ:${curve.sigma.toFixed(1)}`,
                  legendX + 24 * scale,
                  legendY - 8 * scale
                );
              } else if (curve.type === 'linear') {
                ctx.fillText(
                  `a:${curve.slope.toFixed(1)} b:${curve.intercept.toFixed(1)}`,
                  legendX + 24 * scale,
                  legendY - 8 * scale
                );
              } else if (curve.type === 'quadratic') {
                ctx.fillText(
                  `a:${curve.a.toFixed(1)} h:${curve.h.toFixed(1)} k:${curve.k.toFixed(1)}`,
                  legendX + 24 * scale,
                  legendY - 8 * scale
                );
              } else if (curve.type === 'powerLaw') {
                ctx.fillText(
                  `a:${curve.a.toFixed(1)} b:${curve.b.toFixed(1)} h:${curve.h.toFixed(1)} k:${curve.k.toFixed(1)}`,
                  legendX + 24 * scale,
                  legendY - 8 * scale
                );
              } else if (curve.type === 'exponential') {
                ctx.fillText(
                  `a:${curve.a.toFixed(1)} b:${curve.base.toFixed(1)} h:${curve.h.toFixed(1)} k:${curve.k.toFixed(1)}`,
                  legendX + 24 * scale,
                  legendY - 8 * scale
                );
              }

              legendY -= itemHeight + 8 * scale;
            });
          }

          const pngUrl = canvas.toDataURL("image/png", 1.0);
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = `${activeExportSettings.title
            .toLowerCase()
            .replace(/\s+/g, "-")}.png`;
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

  const displayCurves =
    isExporting && activeExportSettings
      ? curves.filter((c) =>
          activeExportSettings.selectedCurveIds.includes(c.id)
        )
      : curves;

  const theme = appSettings.theme;

  return (
    <div
      className={`fixed inset-0 flex transition-colors duration-500 overflow-hidden ${
        theme === "dark"
          ? "bg-slate-900 text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {isMobile && (
        <MobilePrevention
          language={appSettings.language}
          theme={appSettings.theme}
        />
      )}
      <main className="relative flex-1 flex flex-col overflow-hidden h-full">

        {/* Header Overlay */}
        <header className="absolute top-0 left-0 w-full p-8 md:p-12 z-10 pointer-events-none flex justify-between items-start">
          <div className="flex flex-col gap-1 pointer-events-auto max-w-lg">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`text-2xl md:text-3xl font-semibold bg-transparent border-none focus:ring-0 w-full p-0 pl-2 outline-none transition-colors ${
                theme === "dark" ? "text-white/60" : "text-slate-900/60"
              }`}
            />
          </div>

          <div className="flex gap-3 pointer-events-auto items-center">
            {/* Reset Button */}
            <button
              onClick={resetView}
              className={`p-3 rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 ${
                panOffset.x === 0 && panOffset.y === 0 && zoom === 1
                  ? "opacity-0 scale-90 pointer-events-none"
                  : "opacity-100 scale-100"
              } ${
                theme === "dark"
                  ? "bg-slate-800 text-white border border-white/10"
                  : "bg-white text-slate-900 border border-slate-200"
              }`}
              title={t.reset}
            >
              <PlusIcon size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">
                {t.reset}
              </span>
            </button>

            {/* Screenshot Shortcut Button */}
            <button
              onClick={handleOpenExport}
              className={`p-3 rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 ${
                theme === "dark"
                  ? "bg-slate-800 text-white border border-white/10"
                  : "bg-white text-slate-900 border border-slate-200"
              }`}
              title={t.screenshot}
            >
              <CameraIcon size={18} />
            </button>

            {/* Canvas Settings Button */}
            <button
              onClick={() => setIsCanvasSettingsOpen(true)}
              className={`p-3 rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 ${
                theme === "dark"
                  ? "bg-slate-800 text-white border border-white/10"
                  : "bg-white text-slate-900 border border-slate-200"
              }`}
              title={t.settingsIcon}
            >
              <Settings2Icon size={18} />
            </button>

            {/* Zoom Buttons Group (NEW) */}
            <div
              className={`flex gap-1 p-1 rounded-2xl ${
                theme === "dark"
                  ? "bg-slate-800 border border-white/10"
                  : "bg-white border border-slate-200"
              } shadow-xl`}
            >
              <button
                onClick={handleZoomIn}
                className={`p-2 rounded-xl transition-all hover:bg-blue-500/10 hover:text-blue-500`}
                title="Zoom In"
              >
                <PlusIcon size={18} />
              </button>
              <button
                onClick={handleZoomOut}
                className={`p-2 rounded-xl transition-all hover:bg-blue-500/10 hover:text-blue-500`}
                title="Zoom Out"
              >
                <MinusIcon size={18} />
              </button>
            </div>

            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-3 rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 ${
                theme === "dark"
                  ? "bg-slate-800 text-white border border-white/10"
                  : "bg-white text-slate-900 border border-slate-200"
              }`}
              title={isSidebarOpen ? t.collapse : t.open}
            >
              {isSidebarOpen ? (
                <PanelLeftCloseIcon size={20} />
              ) : (
                <PanelLeftOpenIcon size={20} />
              )}
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
          zoom={zoom}
          onZoom={setZoom}
          handleSize={appSettings.handleSize}
          curveOpacity={appSettings.curveOpacity}
          language={appSettings.language}
          showXValues={
            isExporting ? !!activeExportSettings?.showXValues : showXValues
          }
          showYValues={
            isExporting ? !!activeExportSettings?.showYValues : showYValues
          }
          showGrid={isExporting ? !!activeExportSettings?.showGrid : showGrid}
          showAxes={isExporting ? !!activeExportSettings?.showAxes : showAxes}
        />

        {/* Legend Overlay */}
        {!isExporting && (
          <div className="absolute bottom-8 md:bottom-10 left-8 md:left-10 grid grid-cols-2 gap-3 pointer-events-none max-w-[calc(100%-2rem)] z-10">
            {curves
              .filter((c) => c.isVisible)
              .map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    style={{ backgroundColor: c.color }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-tighter opacity-40 leading-none mb-1 truncate">
                      {c.name}
                    </span>
                    {c.type === 'gaussian' && (
                      <span className="text-[10px] mono font-bold opacity-80 leading-none truncate">
                        μ:{c.mean.toFixed(1)} σ:{c.sigma.toFixed(1)}
                      </span>
                    )}
                    {c.type === 'linear' && (
                      <span className="text-[10px] mono font-bold opacity-80 leading-none truncate">
                        a:{c.slope.toFixed(1)} b:{c.intercept.toFixed(1)}
                      </span>
                    )}
                    {c.type === 'quadratic' && (
                      <span className="text-[10px] mono font-bold opacity-80 leading-none truncate">
                        a:{c.a.toFixed(1)} h:{c.h.toFixed(1)} k:{c.k.toFixed(1)}
                      </span>
                    )}
                    {c.type === 'powerLaw' && (
                      <span className="text-[10px] mono font-bold opacity-80 leading-none truncate">
                        a:{c.a.toFixed(1)} b:{c.b.toFixed(1)} h:{c.h.toFixed(1)} k:{c.k.toFixed(1)}
                      </span>
                    )}
                    {c.type === 'exponential' && (
                      <span className="text-[10px] mono font-bold opacity-80 leading-none truncate">
                        a:{c.a.toFixed(1)} b:{c.base.toFixed(1)} h:{c.h.toFixed(1)} k:{c.k.toFixed(1)}
                      </span>
                    )}
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
        onClearAll={clearAllCurves}
        onReorder={reorderCurves}
        onUpdateCurve={updateCurve}
        onSettingsToggle={() => setIsSettingsModalOpen(true)}
        onExport={handleOpenExport}
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

      <CanvasSettingsModal
        isOpen={isCanvasSettingsOpen}
        onClose={() => setIsCanvasSettingsOpen(false)}
        theme={theme}
        language={appSettings.language}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        showAxes={showAxes}
        setShowAxes={setShowAxes}
        showXValues={showXValues}
        setShowXValues={setShowXValues}
        showYValues={showYValues}
        setShowYValues={setShowYValues}
        handleSize={appSettings.handleSize}
        setHandleSize={(val) => updateAppSettings({ handleSize: val })}
        curveOpacity={appSettings.curveOpacity}
        setCurveOpacity={(val) => updateAppSettings({ curveOpacity: val })}
      />
    </div>
  );
};

export default App;
