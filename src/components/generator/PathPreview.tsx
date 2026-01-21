import React, { memo, useMemo } from 'react';
import { CornerExponents } from '../../hooks/useSuperellipse';

interface PathPreviewProps {
  width: number;
  height: number;
  exp: number;
  useAsymmetric: boolean;
  cornerExponents: CornerExponents;
  pathData: string;
}

// Show key control points on the path
const getControlPoints = (
  width: number,
  height: number,
  exp: number,
  useAsymmetric: boolean,
  corners: CornerExponents
): { x: number; y: number; label: string; exp: number }[] => {
  const a = width / 2;
  const b = height / 2;
  
  const points = [
    { angle: 0, label: 'TR', cornerExp: corners.topRight },
    { angle: Math.PI / 2, label: 'TL', cornerExp: corners.topLeft },
    { angle: Math.PI, label: 'BL', cornerExp: corners.bottomLeft },
    { angle: (3 * Math.PI) / 2, label: 'BR', cornerExp: corners.bottomRight },
  ];
  
  return points.map(({ angle, label, cornerExp }) => {
    const n = useAsymmetric ? cornerExp : exp;
    const cosT = Math.cos(angle);
    const sinT = Math.sin(angle);
    
    const x = a * Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / n) + a;
    const y = b * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / n) + b;
    
    return { x, y, label, exp: n };
  });
};

export const PathPreview = memo<PathPreviewProps>(({
  width,
  height,
  exp,
  useAsymmetric,
  cornerExponents,
  pathData,
}) => {
  // Scale to fit in preview box (max 140px)
  const maxDim = Math.max(width, height);
  const scale = Math.min(140 / maxDim, 1);
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  
  const controlPoints = useMemo(
    () => getControlPoints(width, height, exp, useAsymmetric, cornerExponents),
    [width, height, exp, useAsymmetric, cornerExponents]
  );
  
  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
          Path Preview
        </span>
        <span className="text-[9px] text-zinc-400 font-mono">
          {width}×{height}
        </span>
      </div>
      
      <div className="flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-2 min-h-[160px]">
        <svg
          width={scaledWidth + 20}
          height={scaledHeight + 20}
          viewBox={`-10 -10 ${width + 20} ${height + 20}`}
          className="overflow-visible"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="previewGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path 
                d="M 20 0 L 0 0 0 20" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="0.5" 
                className="text-zinc-300 dark:text-zinc-700"
              />
            </pattern>
          </defs>
          <rect 
            x="0" 
            y="0" 
            width={width} 
            height={height} 
            fill="url(#previewGrid)" 
            opacity="0.5"
          />
          
          {/* Center crosshairs */}
          <line 
            x1={width / 2} 
            y1="0" 
            x2={width / 2} 
            y2={height} 
            stroke="currentColor" 
            strokeWidth="0.5" 
            strokeDasharray="4 4"
            className="text-zinc-400 dark:text-zinc-600"
          />
          <line 
            x1="0" 
            y1={height / 2} 
            x2={width} 
            y2={height / 2} 
            stroke="currentColor" 
            strokeWidth="0.5" 
            strokeDasharray="4 4"
            className="text-zinc-400 dark:text-zinc-600"
          />
          
          {/* Shape path */}
          <path
            d={pathData}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-indigo-500"
          />
          
          {/* Corner control points */}
          {controlPoints.map((point, index) => (
            <g key={point.label}>
              {/* Point marker */}
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="currentColor"
                className="text-indigo-500"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="2"
                fill="white"
              />
              
              {/* Label */}
              <text
                x={point.x + (index === 0 || index === 3 ? 8 : -8)}
                y={point.y + (index < 2 ? -8 : 12)}
                fontSize="8"
                fill="currentColor"
                className="text-zinc-500 font-mono"
                textAnchor={index === 0 || index === 3 ? 'start' : 'end'}
              >
                {point.label}: n={point.exp.toFixed(1)}
              </text>
            </g>
          ))}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2 text-[9px] text-zinc-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>Corner points</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-0.5 bg-indigo-500" />
          <span>Path outline</span>
        </div>
      </div>
    </div>
  );
});

PathPreview.displayName = 'PathPreview';
