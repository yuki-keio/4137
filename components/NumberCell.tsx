import React, { useMemo } from 'react';
import { CellData } from '../types';
import { NUMBER_COLORS } from '../constants';

interface NumberCellProps {
  cell: CellData;
  isSelected: boolean;
  isHinted: boolean;
  selectionIndex?: number;
  comboLength: number;
}

export const NumberCell: React.FC<NumberCellProps> = React.memo(({ cell, isSelected, isHinted, selectionIndex, comboLength }) => {
  const colorClass = NUMBER_COLORS[cell.value] || 'text-slate-300';
  
  const textShadowStyle: React.CSSProperties = isSelected
    ? {}
    : { textShadow: '0 0 8px currentColor' };

  const shineAnimationDelay = (selectionIndex !== undefined) ? `${selectionIndex * 120}ms` : '0s';

  const comboParticles = useMemo(() => {
    if (!isSelected || comboLength < 6) return [];
    
    // エレガントにするためにパーティクルの数と飛距離を調整
    const particleCount = Math.min(Math.max(0, comboLength - 5), 8);
    
    return Array.from({ length: particleCount }).map((_, i) => {
      const angle = Math.random() * 360;
      // 飛距離を短くして、より自然な感じに
      const distance = 40 + Math.random() * 30;
      // アニメーション時間を短くして、素早いエフェクトに
      const duration = 600 + Math.random() * 400; // ms
      const delay = Math.random() * 150; // ms

      return {
        // Use comboLength in key to force re-render of particles on combo change
        id: `${comboLength}-${i}`,
        style: {
          '--end-rotate': `${angle}deg`,
          '--end-translate': `${distance}px`,
          animationName: 'combo-sparkle',
          animationDuration: `${duration}ms`,
          animationDelay: `${delay}ms`,
          animationFillMode: 'forwards',
          animationTimingFunction: 'cubic-bezier(0.1, 0.8, 0.7, 1)',
        } as React.CSSProperties,
      };
    });
  }, [isSelected, comboLength]);

  // Base classes
  const cellClasses = [
    'relative', 'w-full', 'h-full', 'flex', 'items-center', 'justify-center',
    'rounded-md', 'text-2xl', 'md:text-3xl', 'font-bold', 'transition-all', 'duration-300',
    'ease-out', 'font-fira', 'overflow-hidden'
  ];
  
  // 状態に応じたクラスを追加
  if (cell.state === 'clearing') {
    // 消えるときのアニメーションを適用
    cellClasses.push('animate-cell-clear-spin');
  } else if (cell.state === 'new') {
    cellClasses.push(colorClass, 'bg-slate-800', 'animate-slide-down');
  } else if (isSelected) {
    cellClasses.push('bg-sky-400', 'text-slate-900');
    const isOdd = selectionIndex !== undefined && selectionIndex % 2 !== 0;
    cellClasses.push(isOdd ? 'is-glowing-odd' : 'is-glowing-even'); 
  } else {
    cellClasses.push(colorClass, 'bg-slate-800', 'hover:bg-slate-700'); 
  }

  if (isHinted && !isSelected && cell.state !== 'clearing') {
    cellClasses.push('hint-glow');
  }
  
  return (
    <div
      className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center p-0.5 md:p-1 select-none [perspective:250px]"
    >
      <div 
        className={cellClasses.join(' ')}
      >
        {isSelected && (
           <div
             className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine-effect pointer-events-none z-0"
             style={{ animationDelay: shineAnimationDelay }}
           />
        )}
        <span 
            style={textShadowStyle}
            className="relative z-[1]"
        >
            {cell.value}
        </span>
      </div>
      {/* 長いコンボの時にパーティクルエフェクトを表示 */}
      {comboParticles.map(p => (
        <div
          key={p.id}
          className="absolute top-1/2 left-1/2 w-1 h-1 bg-yellow-200 rounded-full pointer-events-none"
          style={p.style}
        />
      ))}
    </div>
  );
});