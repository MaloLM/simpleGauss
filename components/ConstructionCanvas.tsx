
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { GaussianCurve, ViewBox, DragState, Theme } from '../types';
import { generateGaussianPath, calculateGaussian } from '../services/mathUtils';
import Handle from './Handle';

interface ConstructionCanvasProps {
  curves: GaussianCurve[];
  viewBox: ViewBox;
  theme: Theme;
  isExporting: boolean;
  showScalesInExport?: boolean;
  onUpdateCurve: (id: string, updates: Partial<GaussianCurve>) => void;
  panOffset: { x: number; y: number };
  onPan: (offset: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  handleSize?: number;
  curveOpacity?: number;
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
  handleSize = 0.1,
  curveOpacity = 0.12
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });

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

  const mathWidth = 14;
  const aspect = dimensions.width / dimensions.height;
  const mathHeight = mathWidth / aspect;

  const xMinBase = -mathWidth / 2;
  const xMaxBase = mathWidth / 2;
  const yMinBase = -mathHeight * 0.15;
  const yMaxBase = yMinBase + mathHeight;

  // View ranges adjusted by panning
  const xMin = xMinBase + panOffset.x;
  const xMax = xMaxBase + panOffset.x;
  const yMin = yMinBase + panOffset.y;
  const yMax = yMaxBase + panOffset.y;

  const colors = theme === 'dark' ? {
    grid: 'rgba(255, 255, 255, 0.05)',
    axis: 'rgba(255, 255, 255, 0.2)',
    text: 'rgba(255, 255, 255, 0.4)',
  } : {
    grid: 'rgba(0, 0, 0, 0.04)',
    axis: 'rgba(0, 0, 0, 0.12)',
    text: 'rgba(0, 0, 0, 0.5)',
  };

  const showLabels = !isExporting || showScalesInExport;

  const gridLines = useMemo(() => {
    const lines = [];
    const stepX = 1;
    const stepY = 0.2;

    for (let x = Math.floor(xMin); x <= Math.ceil(xMax); x += stepX) {
      lines.push(
        <line 
          key={`grid-x-${x}`} 
          x1={x} y1={yMin} x2={x} y2={yMax} 
          stroke={colors.grid} 
          strokeWidth="1" 
          style={{ vectorEffect: 'non-scaling-stroke' }} 
        />
      );
    }
    for (let y = Math.floor(yMin / stepY) * stepY; y <= Math.ceil(yMax / stepY) * stepY; y += stepY) {
      lines.push(
        <line 
          key={`grid-y-${y}`} 
          x1={xMin} y1={y} x2={xMax} y2={y} 
          stroke={colors.grid} 
          strokeWidth="1" 
          style={{ vectorEffect: 'non-scaling-stroke' }} 
        />
      );
    }
    return lines;
  }, [xMin, xMax, yMin, yMax, colors.grid]);

  const labels = useMemo(() => {
    if (!showLabels) return null;
    const texts = [];
    for (let x = Math.floor(xMin); x <= Math.ceil(xMax); x += 1) {
      if (x === 0) continue;
      texts.push(
        <g key={`label-x-${x}`} transform={`translate(${x}, ${panOffset.y - 0.15}) scale(1, -1)`}>
          <text 
            fontSize="0.18" 
            textAnchor="middle" 
            fill={colors.text}
            className="font-bold select-none pointer-events-none"
          >
            {x}
          </text>
        </g>
      );
    }
    return texts;
  }, [xMin, xMax, colors.text, showLabels, panOffset.y]);

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

        if (drag.type === 'mean-amplitude') {
          onUpdateCurve(curve.id, { 
            mean: svgX, 
            amplitude: Math.max(0.01, svgY) 
          });
        } else if (drag.type === 'sigma') {
          const newSigma = Math.abs(svgX - curve.mean);
          onUpdateCurve(curve.id, { sigma: Math.max(0.05, newSigma) });
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

  const handleBgMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as any).tagName === 'line') {
      setIsPanning(true);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full flex items-center justify-center p-4 md:p-10 transition-colors duration-500 overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}
    >
      <div 
        className={`relative w-full h-full shadow-2xl rounded-3xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleBgMouseDown}
      >
        <svg
          ref={svgRef}
          viewBox={`${xMin} ${-yMax} ${mathWidth} ${mathHeight}`}
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="scale(1, -1)">
            {gridLines}
            {/* Origin Axes */}
            <line x1={xMin} y1={0} x2={xMax} y2={0} stroke={colors.axis} strokeWidth="2" style={{ vectorEffect: 'non-scaling-stroke' }} />
            <line x1={0} y1={yMin} x2={0} y2={yMax} stroke={colors.axis} strokeWidth="2" style={{ vectorEffect: 'non-scaling-stroke' }} />
            
            {labels}

            {curves.filter(c => c.isVisible).map(curve => {
              const path = generateGaussianPath(curve.mean, curve.sigma, curve.amplitude, xMin, xMax, 250);
              const sideHandleX = curve.mean + curve.sigma;
              const sideHandleY = calculateGaussian(sideHandleX, curve.mean, curve.sigma, curve.amplitude);

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
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ vectorEffect: 'non-scaling-stroke' }}
                  />
                  
                  {!curve.isLocked && !isExporting && (
                    <>
                      <Handle
                        x={curve.mean}
                        y={curve.amplitude}
                        cursor="move"
                        color={curve.color}
                        isActive={drag?.curveId === curve.id && drag?.type === 'mean-amplitude'}
                        tooltip={`${curve.name} Peak`}
                        size={handleSize}
                        onMouseDown={(e) => { e.stopPropagation(); setDrag({ curveId: curve.id, type: 'mean-amplitude' }); }}
                      />
                      <Handle
                        x={sideHandleX}
                        y={sideHandleY}
                        cursor="ew-resize"
                        color={curve.color}
                        isActive={drag?.curveId === curve.id && drag?.type === 'sigma'}
                        size={handleSize}
                        onMouseDown={(e) => { e.stopPropagation(); setDrag({ curveId: curve.id, type: 'sigma' }); }}
                      />
                    </>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default ConstructionCanvas;
