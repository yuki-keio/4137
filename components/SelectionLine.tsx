import React, { useMemo } from 'react';
import { Position } from '../types';
import { GRID_SIZE } from '../constants';

interface SelectionLineProps {
  selectedCells: Position[];
  boardSize: { width: number; height: number };
}

export const SelectionLine: React.FC<SelectionLineProps> = ({ selectedCells, boardSize }) => {
  const cellWidth = boardSize.width / GRID_SIZE;
  const cellHeight = boardSize.height / GRID_SIZE;

  const segments = useMemo(() => {
    return selectedCells.slice(1).map((pos, index) => {
      const prevPos = selectedCells[index];
      const start = {
        x: (prevPos.col + 0.5) * cellWidth,
        y: (prevPos.row + 0.5) * cellHeight,
      };
      const end = {
        x: (pos.col + 0.5) * cellWidth,
        y: (pos.row + 0.5) * cellHeight,
      };
      
      const color = '#38bdf8'; // sky-400, Unified cyan color
      const length = Math.hypot(end.x - start.x, end.y - start.y);
      return { start, end, color, length };
    });
  }, [selectedCells, cellWidth, cellHeight]);

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${boardSize.width} ${boardSize.height}`}
      style={{ overflow: 'visible' }}
    >
      <g>
        {segments.map(({ start, end, color, length }, index) => (
          <line
            key={index}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke={color}
            strokeWidth="3"
            strokeOpacity="0.8"
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 3px ${color})`,
              ...(index === segments.length - 1 && segments.length === selectedCells.length - 1 && {
                  strokeDasharray: length,
                  strokeDashoffset: length,
                  animationName: 'drawLine',
                  animationDuration: '0.2s',
                  animationTimingFunction: 'ease-out',
                  animationFillMode: 'forwards',
              }),
            }}
          />
        ))}
      </g>
    </svg>
  );
};