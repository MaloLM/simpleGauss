
import React from 'react';

interface HandleProps {
  x: number;
  y: number;
  cursor: string;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  color: string;
  isActive?: boolean;
  size?: number;
}

const Handle: React.FC<HandleProps> = ({ 
  x, 
  y, 
  cursor, 
  onMouseDown, 
  onMouseEnter,
  onMouseLeave,
  color, 
  isActive, 
  size = 0.1 
}) => {
  return (
    <g 
      className="group cursor-pointer select-none" 
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor }}
    >
      {/* Hit area - larger than visible handle for accessibility */}
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
    </g>
  );
};

export default Handle;
