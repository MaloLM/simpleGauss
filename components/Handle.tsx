
import React from 'react';

interface HandleProps {
  x: number;
  y: number;
  cursor: string;
  onMouseDown: (e: React.MouseEvent) => void;
  color: string;
  tooltip?: string;
  isActive?: boolean;
  size?: number;
}

const Handle: React.FC<HandleProps> = ({ 
  x, 
  y, 
  cursor, 
  onMouseDown, 
  color, 
  tooltip, 
  isActive, 
  size = 0.1 
}) => {
  return (
    <g 
      className="group cursor-pointer select-none" 
      onMouseDown={onMouseDown}
      style={{ cursor }}
    >
      {/* Hit area - slightly larger than visible handle for better touch/click experience */}
      <circle cx={x} cy={y} r={size * 2.5} fill="transparent" />
      
      {/* Main Handle Circle */}
      <circle 
        cx={x} 
        cy={y} 
        r={size} 
        fill={color} 
        style={{ vectorEffect: 'non-scaling-stroke' }}
        className="stroke-white"
        strokeWidth="2"
      />
      
      {tooltip && (
        <g transform={`translate(${x}, ${y - size * 3.5}) scale(1, -1)`}>
           <text
            textAnchor="middle"
            fontSize="0.22"
            className="opacity-0 group-hover:opacity-100 fill-slate-400 font-bold pointer-events-none transition-opacity"
            style={{ userSelect: 'none' }}
          >
            {tooltip}
          </text>
        </g>
      )}
    </g>
  );
};

export default Handle;
