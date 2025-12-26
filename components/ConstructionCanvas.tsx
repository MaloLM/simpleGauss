
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { AnyCurve, ViewBox, DragState, Theme, Language } from '../types';
import { generateGaussianPath, calculateGaussian, generateLinearPath, calculateLinear, generateQuadraticPath, calculateQuadratic, generatePowerLawPath, calculatePowerLaw } from '../services/mathUtils';
import { translations } from '../translations';
import Handle from './Handle';

interface ConstructionCanvasProps {
  curves: AnyCurve[];
  viewBox: ViewBox;
  theme: Theme;
  isExporting: boolean;
  showScalesInExport?: boolean;
  onUpdateCurve: (id: string, updates: Partial<AnyCurve>) => void;
  panOffset: { x: number; y: number };
  onPan: (offset: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  zoom: number;
  onZoom: (zoom: number | ((prev: number) => number)) => void;
  handleSize?: number;
  curveOpacity?: number;
  language: Language;
  showXValues: boolean;
  showYValues: boolean;
  showGrid: boolean;
  showAxes: boolean;
}

const ConstructionCanvas: React.FC<ConstructionCanvasProps> = ({ 
  curves, 
  viewBox, 
  theme,
  isExporting,
  showScalesInExport = true,
  onUpdateCurve,
  panOffset,
  onPan,
  zoom,
  onZoom,
  handleSize = 0.1,
  curveOpacity = 0.12,
  language,
  showXValues,
  showYValues,
  showGrid,
  showAxes
}) => {
  const t = translations[language];
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hoveredPeakId, setHoveredPeakId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [lastTouchPos, setLastTouchPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Standard math width is 14. Adjust by zoom.
  const baseMathWidth = 14;
  const mathWidth = baseMathWidth / zoom;
  const aspect = dimensions.width / dimensions.height;
  const mathHeight = mathWidth / aspect;

  const xMinBase = -mathWidth / 2;
  const xMaxBase = mathWidth / 2;
  const yMinBase = -mathHeight * 0.15;
  const yMaxBase = yMinBase + mathHeight;

  const xMin = xMinBase + panOffset.x;
  const xMax = xMaxBase + panOffset.x;
  const yMin = yMinBase + panOffset.y;
  const yMax = yMaxBase + panOffset.y;

  const colors = theme === 'dark' ? {
    grid: isExporting ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
    axis: 'rgba(255, 255, 255, 0.2)',
    text: isExporting ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.4)',
  } : {
    grid: isExporting ? 'rgba(0, 0, 0, 0.07)' : 'rgba(0, 0, 0, 0.04)',
    axis: 'rgba(0, 0, 0, 0.12)',
    text: isExporting ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
  };

  const showLabels = true;

  const onWheel = useCallback((e: React.WheelEvent) => {
    // Zoom centered on viewport
    e.preventDefault();
    const direction = e.deltaY > 0 ? -1 : 1;
    onZoom(prev => {
      const next = direction > 0 ? prev * 1.05 : prev / 1.05;
      return Math.min(Math.max(next, 0.1), 50);
    });
  }, [onZoom]);

  const gridLines = useMemo(() => {
    if (!showGrid) return null;
    const lines = [];
    
    // Adaptive grid density
    let stepX = 1;
    if (zoom > 5) stepX = 0.2;
    if (zoom > 15) stepX = 0.1;
    if (zoom < 0.5) stepX = 5;

    let stepY = 0.2;
    if (zoom > 5) stepY = 0.05;
    if (zoom < 0.5) stepY = 1;

    for (let x = Math.floor(xMin / stepX) * stepX; x <= Math.ceil(xMax / stepX) * stepX; x += stepX) {
      lines.push(
        <line 
          key={`grid-x-${x}`} 
          x1={x} y1={yMin} x2={x} y2={yMax} 
          stroke={colors.grid} 
          strokeWidth={isExporting ? 0.003 / zoom : "1"} 
          style={isExporting ? {} : { vectorEffect: 'non-scaling-stroke' }} 
        />
      );
    }
    for (let y = Math.floor(yMin / stepY) * stepY; y <= Math.ceil(yMax / stepY) * stepY; y += stepY) {
      lines.push(
        <line 
          key={`grid-y-${y}`} 
          x1={xMin} y1={y} x2={xMax} y2={y} 
          stroke={colors.grid} 
          strokeWidth={isExporting ? 0.003 / zoom : "1"} 
          style={isExporting ? {} : { vectorEffect: 'non-scaling-stroke' }} 
        />
      );
    }
    return lines;
  }, [xMin, xMax, yMin, yMax, colors.grid, showGrid, zoom]);

  const labels = useMemo(() => {
    if (!showLabels) return null;
    const texts = [];
    
    const xLabelY = Math.max(yMin + (0.3 / zoom), Math.min(yMax - (0.5 / zoom), 0)) - (0.2 / zoom);
    const yLabelX = Math.max(xMin + (0.1 / zoom), Math.min(xMax - (0.8 / zoom), 0)) - (0.3 / zoom);

    const fontSize = 0.18 / zoom;

    if (showXValues) {
      let stepX = 1;
      if (zoom > 5) stepX = 0.5;
      if (zoom < 0.5) stepX = 5;

      for (let x = Math.floor(xMin / stepX) * stepX; x <= Math.ceil(xMax / stepX) * stepX; x += stepX) {
        if (Math.abs(x) < 0.0001) continue;
        texts.push(
          <g key={`label-x-${x}`} transform={`translate(${x}, ${xLabelY}) scale(1, -1)`}>
            <text 
              fontSize={fontSize} 
              textAnchor="middle" 
              fill={colors.text}
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
              className="font-bold select-none pointer-events-none"
            >
              {parseFloat(x.toFixed(1))}
            </text>
          </g>
        );
      }
    }

    if (showYValues) {
      let stepY = 1; 
      if (zoom > 5) stepY = 0.2;
      if (zoom < 0.5) stepY = 5;

      for (let y = Math.floor(yMin / stepY) * stepY; y <= Math.ceil(yMax / stepY) * stepY; y += stepY) {
        if (Math.abs(y) < 0.001) continue;
        texts.push(
          <g key={`label-y-${y}`} transform={`translate(${yLabelX}, ${y}) scale(1, -1)`}>
            <text 
              fontSize={fontSize * 0.9} 
              textAnchor="end" 
              alignmentBaseline="middle"
              fill={colors.text}
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
              className="font-bold select-none pointer-events-none"
            >
              {parseFloat(y.toFixed(1))}
            </text>
          </g>
        );
      }
    }

    return texts;
  }, [xMin, xMax, yMin, yMax, colors.text, showLabels, showXValues, showYValues, zoom]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      
      const rect = svgRef.current.getBoundingClientRect();
      const dxMath = (e.movementX / rect.width) * mathWidth;
      const dyMath = (e.movementY / rect.height) * mathHeight;

      if (drag) {
        const rawX = e.clientX - rect.left;
        const rawY = e.clientY - rect.top;
        const svgX = (rawX / rect.width) * mathWidth + xMin;
        const svgY = (1 - rawY / rect.height) * mathHeight + yMin;

        const curve = curves.find(c => c.id === drag.curveId);
        if (!curve) return;

        if (curve.type === 'gaussian') {
          if (drag.handleId === 'mean-amplitude') {
            onUpdateCurve(curve.id, { 
              mean: svgX, 
              amplitude: Math.max(0.01, svgY) 
            });
          } else if (drag.handleId === 'sigma') {
            const newSigma = Math.abs(svgX - curve.mean);
            onUpdateCurve(curve.id, { sigma: Math.max(0.05, newSigma) });
          }
        } else if (curve.type === 'linear') {
          if (drag.handleId === 'intercept') {
            onUpdateCurve(curve.id, { intercept: svgY });
          } else if (drag.handleId === 'slope') {
            onUpdateCurve(curve.id, { slope: svgY - curve.intercept });
          }
        } else if (curve.type === 'quadratic') {
          if (drag.handleId === 'vertex') {
            onUpdateCurve(curve.id, { h: svgX, k: svgY });
          } else if (drag.handleId === 'curvature') {
            const dx = 1;
            onUpdateCurve(curve.id, { a: (svgY - curve.k) / Math.pow(dx, 2) });
          }
        } else if (curve.type === 'powerLaw') {
          if (drag.handleId === 'vertex') {
            onUpdateCurve(curve.id, { h: svgX });
          } else if (drag.handleId === 'coefficient') {
            const dx = 1;
            onUpdateCurve(curve.id, { a: (svgY - curve.k) / Math.pow(dx, curve.b) });
          } else if (drag.handleId === 'exponent') {
            const dx = 2;
            const dy = svgY - curve.k;
            if (dy / curve.a > 0) {
              onUpdateCurve(curve.id, { b: Math.log(dy / curve.a) / Math.log(dx) });
            }
          }
        }
      } else if (isPanning) {
        onPan(prev => ({
          x: prev.x - dxMath,
          y: prev.y + dyMath
        }));
      }
    };

    const handleMouseUp = () => {
      setDrag(null);
      setIsPanning(false);
    };

    if (drag || isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [drag, isPanning, curves, mathWidth, mathHeight, xMin, yMin, onUpdateCurve, onPan]);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();

      if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

        if (lastTouchDistance !== null) {
          const delta = dist / lastTouchDistance;
          onZoom(prev => Math.min(Math.max(prev * delta, 0.1), 50));
        }
        setLastTouchDistance(dist);
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rawX = touch.clientX - rect.left;
        const rawY = touch.clientY - rect.top;
        const svgX = (rawX / rect.width) * mathWidth + xMin;
        const svgY = (1 - rawY / rect.height) * mathHeight + yMin;

        if (drag) {
          const curve = curves.find(c => c.id === drag.curveId);
          if (!curve) return;

          if (curve.type === 'gaussian') {
            if (drag.handleId === 'mean-amplitude') {
              onUpdateCurve(curve.id, { mean: svgX, amplitude: Math.max(0.01, svgY) });
            } else if (drag.handleId === 'sigma') {
              onUpdateCurve(curve.id, { sigma: Math.max(0.05, Math.abs(svgX - curve.mean)) });
            }
          } else if (curve.type === 'linear') {
            if (drag.handleId === 'intercept') {
              onUpdateCurve(curve.id, { intercept: svgY });
            } else if (drag.handleId === 'slope') {
              onUpdateCurve(curve.id, { slope: svgY - curve.intercept });
            }
          } else if (curve.type === 'quadratic') {
            if (drag.handleId === 'vertex') {
              onUpdateCurve(curve.id, { h: svgX, k: svgY });
            } else if (drag.handleId === 'curvature') {
              const dx = 1;
              onUpdateCurve(curve.id, { a: (svgY - curve.k) / Math.pow(dx, 2) });
            }
          } else if (curve.type === 'powerLaw') {
            if (drag.handleId === 'vertex') {
              onUpdateCurve(curve.id, { h: svgX });
            } else if (drag.handleId === 'coefficient') {
              const dx = 1;
              onUpdateCurve(curve.id, { a: (svgY - curve.k) / Math.pow(dx, curve.b) });
            } else if (drag.handleId === 'exponent') {
              const dx = 2;
              const dy = svgY - curve.k;
              if (dy / curve.a > 0) {
                onUpdateCurve(curve.id, { b: Math.log(dy / curve.a) / Math.log(dx) });
              }
            }
          }
        } else if (isPanning && lastTouchPos) {
          const dxMath = ((touch.clientX - lastTouchPos.x) / rect.width) * mathWidth;
          const dyMath = ((touch.clientY - lastTouchPos.y) / rect.height) * mathHeight;
          onPan(prev => ({ x: prev.x - dxMath, y: prev.y + dyMath }));
        }
        setLastTouchPos({ x: touch.clientX, y: touch.clientY });
      }
    };

    const handleTouchEnd = () => {
      setDrag(null);
      setIsPanning(false);
      setLastTouchDistance(null);
      setLastTouchPos(null);
    };

    if (drag || isPanning || lastTouchDistance !== null) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchcancel', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [drag, isPanning, lastTouchDistance, lastTouchPos, curves, mathWidth, mathHeight, xMin, yMin, onUpdateCurve, onPan, onZoom]);

  const handleBgMouseDown = (e: React.MouseEvent) => {
    const target = e.target as SVGElement;
    const isHandle = target.closest('.handle-group');
    if (!isHandle) setIsPanning(true);
  };

  const handleBgTouchStart = (e: React.TouchEvent) => {
    const target = e.target as SVGElement;
    const isHandle = target.closest('.handle-group');
    if (!isHandle) {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        setLastTouchDistance(dist);
      } else if (e.touches.length === 1) {
        setIsPanning(true);
        setLastTouchPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    }
  };


  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full flex items-center justify-center p-4 md:p-10 pb-16 md:pb-24 transition-colors duration-500 overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}
      onWheel={onWheel}
    >
      <div 
        className={`relative w-full h-full shadow-2xl rounded-3xl overflow-hidden ${isExporting ? '' : 'bg-white/5 backdrop-blur-sm border border-white/10'} ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleBgMouseDown}
        onTouchStart={handleBgTouchStart}
      >

        <svg
          ref={svgRef}
          id="main-canvas-svg"
          viewBox={`${xMin} ${-yMax} ${mathWidth} ${mathHeight}`}
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          style={isExporting ? { background: 'transparent' } : {}}
        >
          <g transform="scale(1, -1)">
            {gridLines}
            {showAxes && (
              <>
                {/* Horizontal Axis */}
                <line 
                  x1={xMin} y1={0} x2={xMax} y2={0} 
                  stroke={colors.axis} 
                  strokeWidth={isExporting ? 0.028 / zoom : "2"} 
                  style={isExporting ? {} : { vectorEffect: 'non-scaling-stroke' }} 
                />
                {/* Vertical Axis */}
                <line 
                  x1={0} y1={yMin} x2={0} y2={yMax} 
                  stroke={colors.axis} 
                  strokeWidth={isExporting ? 0.028 / zoom : "2"} 
                  style={isExporting ? {} : { vectorEffect: 'non-scaling-stroke' }} 
                />
              </>
            )}
            
            {labels}

            {[...curves].reverse().filter(c => c.isVisible).map(curve => {
              if (curve.type === 'gaussian') {
                const path = generateGaussianPath(curve.mean, curve.sigma, curve.amplitude, xMin, xMax, 250);
                const sideHandleX = curve.mean + curve.sigma;
                const sideHandleY = calculateGaussian(sideHandleX, curve.mean, curve.sigma, curve.amplitude);
                const isActive = drag?.curveId === curve.id && drag.handleId === 'mean-amplitude';
                const isHovered = hoveredPeakId === curve.id;

                return (
                  <g key={curve.id}>
                    <path
                      d={`${path} L ${xMax} 0 L ${xMin} 0 Z`}
                      fill={curve.color}
                      fillOpacity={curveOpacity}
                    />
                    <path
                      d={path}
                      fill="none"
                      stroke={curve.color}
                      strokeWidth={isExporting ? 0.04 / zoom : "3"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={isExporting ? {} : { vectorEffect: 'non-scaling-stroke' }}
                    />
                    
                    {!curve.isLocked && !isExporting && (
                      <>
                        {(isActive || isHovered) && (
                          <g transform={`translate(${curve.mean}, ${curve.amplitude + (0.4 / zoom)}) scale(1, -1)`}>
                            <text 
                              fontSize={0.25 / zoom} 
                              textAnchor="middle" 
                              fill={theme === 'dark' ? 'white' : 'black'}
                              className="font-light opacity-60 select-none pointer-events-none animate-in fade-in duration-200"
                            >
                              {curve.name}
                            </text>
                          </g>
                        )}

                        <Handle
                          x={curve.mean}
                          y={curve.amplitude}
                          cursor="move"
                          color={curve.color}
                          isActive={isActive}
                          size={handleSize / zoom}
                          onMouseDown={(e) => { e.stopPropagation(); setDrag({ curveId: curve.id, handleId: 'mean-amplitude' }); }}
                          onTouchStart={(e) => { 
                            if (e.cancelable) e.preventDefault();
                            e.stopPropagation(); 
                            setDrag({ curveId: curve.id, handleId: 'mean-amplitude' }); 
                          }}
                          onMouseEnter={() => setHoveredPeakId(curve.id)}
                          onMouseLeave={() => setHoveredPeakId(null)}
                        />
                        <Handle
                          x={sideHandleX}
                          y={sideHandleY}
                          cursor="ew-resize"
                          color={curve.color}
                          isActive={drag?.curveId === curve.id && drag.handleId === 'sigma'}
                          size={handleSize / zoom}
                          onMouseDown={(e) => { e.stopPropagation(); setDrag({ curveId: curve.id, handleId: 'sigma' }); }}
                          onTouchStart={(e) => { 
                            if (e.cancelable) e.preventDefault();
                            e.stopPropagation(); 
                            setDrag({ curveId: curve.id, handleId: 'sigma' }); 
                          }}
                        />
                      </>
                    )}
                  </g>
                );
              } else if (curve.type === 'linear') {
                const path = generateLinearPath(curve.slope, curve.intercept, xMin, xMax);
                const interceptHandleY = curve.intercept;
                const slopeHandleY = calculateLinear(1, curve.slope, curve.intercept);
                const isInterceptActive = drag?.curveId === curve.id && drag.handleId === 'intercept';
                const isSlopeActive = drag?.curveId === curve.id && drag.handleId === 'slope';
                const isHovered = hoveredPeakId === curve.id;

                return (
                  <g key={curve.id}>
                    <path
                      d={path}
                      fill="none"
                      stroke={curve.color}
                      strokeWidth={isExporting ? 0.04 / zoom : "3"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={isExporting ? {} : { vectorEffect: 'non-scaling-stroke' }}
                    />
                    
                    {!curve.isLocked && !isExporting && (
                      <>
                        {(isInterceptActive || isSlopeActive || isHovered) && (
                          <g transform={`translate(0, ${curve.intercept + (0.4 / zoom)}) scale(1, -1)`}>
                            <text 
                              fontSize={0.25 / zoom} 
                              textAnchor="middle" 
                              fill={theme === 'dark' ? 'white' : 'black'}
                              className="font-light opacity-60 select-none pointer-events-none animate-in fade-in duration-200"
                            >
                              {curve.name}
                            </text>
                          </g>
                        )}

                        <Handle
                          x={0}
                          y={interceptHandleY}
                          cursor="ns-resize"
                          color={curve.color}
                          isActive={isInterceptActive}
                          size={handleSize / zoom}
                          onMouseDown={(e) => { e.stopPropagation(); setDrag({ curveId: curve.id, handleId: 'intercept' }); }}
                          onTouchStart={(e) => { 
                            if (e.cancelable) e.preventDefault();
                            e.stopPropagation(); 
                            setDrag({ curveId: curve.id, handleId: 'intercept' }); 
                          }}
                          onMouseEnter={() => setHoveredPeakId(curve.id)}
                          onMouseLeave={() => setHoveredPeakId(null)}
                        />
                        <Handle
                          x={1}
                          y={slopeHandleY}
                          cursor="ns-resize"
                          color={curve.color}
                          isActive={isSlopeActive}
                          size={handleSize / zoom}
                          onMouseDown={(e) => { e.stopPropagation(); setDrag({ curveId: curve.id, handleId: 'slope' }); }}
                          onTouchStart={(e) => { 
                            if (e.cancelable) e.preventDefault();
                            e.stopPropagation(); 
                            setDrag({ curveId: curve.id, handleId: 'slope' }); 
                          }}
                        />
                      </>
                    )}
                  </g>
                );
              } else if (curve.type === 'quadratic') {
                const path = generateQuadraticPath(curve.a, curve.h, curve.k, xMin, xMax, 250);
                const vertexHandleX = curve.h;
                const vertexHandleY = curve.k;
                const curvatureHandleX = curve.h + 1;
                const curvatureHandleY = calculateQuadratic(curvatureHandleX, curve.a, curve.h, curve.k);
                const isVertexActive = drag?.curveId === curve.id && drag.handleId === 'vertex';
                const isCurvatureActive = drag?.curveId === curve.id && drag.handleId === 'curvature';
                const isHovered = hoveredPeakId === curve.id;

                return (
                  <g key={curve.id}>
                    <path
                      d={path}
                      fill="none"
                      stroke={curve.color}
                      strokeWidth={isExporting ? 0.04 / zoom : "3"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={isExporting ? {} : { vectorEffect: 'non-scaling-stroke' }}
                    />
                    
                    {!curve.isLocked && !isExporting && (
                      <>
                        {(isVertexActive || isCurvatureActive || isHovered) && (
                          <g transform={`translate(${curve.h}, ${curve.k + (0.4 / zoom)}) scale(1, -1)`}>
                            <text 
                              fontSize={0.25 / zoom} 
                              textAnchor="middle" 
                              fill={theme === 'dark' ? 'white' : 'black'}
                              className="font-light opacity-60 select-none pointer-events-none animate-in fade-in duration-200"
                            >
                              {curve.name}
                            </text>
                          </g>
                        )}

                        <Handle
                          x={vertexHandleX}
                          y={vertexHandleY}
                          cursor="move"
                          color={curve.color}
                          isActive={isVertexActive}
                          size={handleSize / zoom}
                          onMouseDown={(e) => { e.stopPropagation(); setDrag({ curveId: curve.id, handleId: 'vertex' }); }}
                          onTouchStart={(e) => { 
                            if (e.cancelable) e.preventDefault();
                            e.stopPropagation(); 
                            setDrag({ curveId: curve.id, handleId: 'vertex' }); 
                          }}
                          onMouseEnter={() => setHoveredPeakId(curve.id)}
                          onMouseLeave={() => setHoveredPeakId(null)}
                        />
                        <Handle
                          x={curvatureHandleX}
                          y={curvatureHandleY}
                          cursor="ns-resize"
                          color={curve.color}
                          isActive={isCurvatureActive}
                          size={handleSize / zoom}
                          onMouseDown={(e) => { e.stopPropagation(); setDrag({ curveId: curve.id, handleId: 'curvature' }); }}
                          onTouchStart={(e) => { 
                            if (e.cancelable) e.preventDefault();
                            e.stopPropagation(); 
                            setDrag({ curveId: curve.id, handleId: 'curvature' }); 
                          }}
                        />
                      </>
                    )}
                  </g>
                );
              } else if (curve.type === 'powerLaw') {
                const path = generatePowerLawPath(curve.a, curve.b, curve.h, curve.k, xMin, xMax, 250);
                const vertexHandleX = curve.h;
                const vertexHandleY = curve.k;
                const coefficientHandleX = curve.h + 1;
                const coefficientHandleY = calculatePowerLaw(coefficientHandleX, curve.a, curve.b, curve.h, curve.k);
                const exponentHandleX = curve.h + 2;
                const exponentHandleY = calculatePowerLaw(exponentHandleX, curve.a, curve.b, curve.h, curve.k);
                
                const isVertexActive = drag?.curveId === curve.id && drag.handleId === 'vertex';
                const isCoefficientActive = drag?.curveId === curve.id && drag.handleId === 'coefficient';
                const isExponentActive = drag?.curveId === curve.id && drag.handleId === 'exponent';
                const isHovered = hoveredPeakId === curve.id;

                return (
                  <g key={curve.id}>
                    <path
                      d={`${path} L ${xMax} 0 L ${xMin} 0 Z`}
                      fill={curve.color}
                      fillOpacity={curveOpacity}
                    />
                    <path
                      d={path}
                      fill="none"
                      stroke={curve.color}
                      strokeWidth={isExporting ? 0.04 / zoom : "3"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={isExporting ? {} : { vectorEffect: 'non-scaling-stroke' }}
                    />
                    
                    {!curve.isLocked && !isExporting && (
                      <>
                        {(isVertexActive || isCoefficientActive || isExponentActive || isHovered) && (
                          <g transform={`translate(${curve.h}, ${curve.k + (0.4 / zoom)}) scale(1, -1)`}>
                            <text 
                              fontSize={0.25 / zoom} 
                              textAnchor="middle" 
                              fill={theme === 'dark' ? 'white' : 'black'}
                              className="font-light opacity-60 select-none pointer-events-none animate-in fade-in duration-200"
                            >
                              {curve.name}
                            </text>
                          </g>
                        )}

                        <Handle
                          x={vertexHandleX}
                          y={vertexHandleY}
                          cursor="ew-resize"
                          color={curve.color}
                          isActive={isVertexActive}
                          size={handleSize / zoom}
                          onMouseDown={(e) => { e.stopPropagation(); setDrag({ curveId: curve.id, handleId: 'vertex' }); }}
                          onTouchStart={(e) => { 
                            if (e.cancelable) e.preventDefault();
                            e.stopPropagation(); 
                            setDrag({ curveId: curve.id, handleId: 'vertex' }); 
                          }}
                          onMouseEnter={() => setHoveredPeakId(curve.id)}
                          onMouseLeave={() => setHoveredPeakId(null)}
                        />
                        <Handle
                          x={coefficientHandleX}
                          y={coefficientHandleY}
                          cursor="ns-resize"
                          color={curve.color}
                          isActive={isCoefficientActive}
                          size={handleSize / zoom}
                          onMouseDown={(e) => { e.stopPropagation(); setDrag({ curveId: curve.id, handleId: 'coefficient' }); }}
                          onTouchStart={(e) => { 
                            if (e.cancelable) e.preventDefault();
                            e.stopPropagation(); 
                            setDrag({ curveId: curve.id, handleId: 'coefficient' }); 
                          }}
                        />
                        <Handle
                          x={exponentHandleX}
                          y={exponentHandleY}
                          cursor="ns-resize"
                          color={curve.color}
                          isActive={isExponentActive}
                          size={handleSize / zoom}
                          onMouseDown={(e) => { e.stopPropagation(); setDrag({ curveId: curve.id, handleId: 'exponent' }); }}
                          onTouchStart={(e) => { 
                            if (e.cancelable) e.preventDefault();
                            e.stopPropagation(); 
                            setDrag({ curveId: curve.id, handleId: 'exponent' }); 
                          }}
                        />
                      </>
                    )}
                  </g>
                );
              }
              return null;
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default ConstructionCanvas;
