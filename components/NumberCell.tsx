import React, { useMemo } from 'react';
import { CellData } from '../types';
import { NUMBER_COLORS } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface NumberCellProps {
  cell: CellData;
  isSelected: boolean;
  isHinted: boolean;
  selectionIndex?: number;
  comboLength: number;
}

export const NumberCell: React.FC<NumberCellProps> = React.memo(({ cell, isSelected, isHinted, selectionIndex, comboLength }) => {
  const colorClass = NUMBER_COLORS[cell.value] || 'text-slate-300';
  const { theme } = useTheme();

  const textShadowStyle: React.CSSProperties = isSelected
    ? {}
    : theme === 'light'
      ? {} // ライトモードではテキストシャドウなし
      : { textShadow: '0 0 8px currentColor' }; // ダークモードのみテキストシャドウ

  const shineAnimationDelay = (selectionIndex !== undefined) ? `${selectionIndex * 120}ms` : '0s';

  // レインボーセル用のスタイル - CSSで作るエネルギッシュなアイコン
  const rainbowTextStyle: React.CSSProperties = cell.isRainbow
    ? {
      display: 'none' // テキストは非表示にして、CSSアイコンを使用
    }
    : textShadowStyle;

  const comboParticles = useMemo(() => {
    if (!isSelected || comboLength < 5) return [];

    // エレガントにするためにパーティクルの数と飛距離を調整
    const particleCount = Math.min(Math.max(0, comboLength - 4), 7);

    return Array.from({ length: particleCount }).map((_, i) => {
      const angle = Math.random() * 360;
      const distance = 70 + Math.random() * 30;
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
  }, [isSelected, comboLength, theme]);

  // Base classes
  const cellClasses = [
    'relative', 'w-full', 'h-full', 'flex', 'items-center', 'z-10', 'justify-center',
    'rounded-md', 'text-2xl', 'md:text-3xl', 'font-bold', 'transition-all', 'duration-300',
    'ease-out', 'font-fira', 'overflow-hidden'
  ];

  // 状態に応じたクラスとスタイルを追加
  let cellStyle: React.CSSProperties = {};

  if (cell.isRainbow) {
    // レインボーセルのスタイル - 背景を完全に透明に
    cellClasses.push('rainbow-cell');
    cellStyle.backgroundColor = 'transparent';
    cellStyle.border = 'none';
    cellStyle.boxShadow = 'none';
  } else if (cell.state === 'clearing') {
    // 消えるときのアニメーションを適用
    cellClasses.push('animate-cell-clear-spin');
  } else if (cell.state === 'new') {
    cellClasses.push(colorClass, 'animate-slide-down');
    cellStyle.backgroundColor = 'var(--bg-secondary)';
  } else if (isSelected) {
    if (cell.isRainbow) {
      // ワイルドカードが選択されたときは背景を透明にして、CSSアイコンのみ強調
      cellClasses.push('text-white');
      cellStyle.backgroundColor = 'transparent';
      cellStyle.border = 'none';
      cellStyle.boxShadow = 'none';
    } else {
      cellClasses.push('bg-sky-400', 'text-slate-900');
    }
    const isOdd = selectionIndex !== undefined && selectionIndex % 2 !== 0;
    cellClasses.push(isOdd ? 'is-glowing-odd' : 'is-glowing-even');
  } else {
    if (!cell.isRainbow) {
      cellClasses.push(colorClass);
    }
    cellStyle.backgroundColor = 'var(--bg-secondary)';
    cellStyle.transition = 'background-color 0.3s ease';
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
        style={cellStyle}
        onMouseEnter={(e) => {
          if (!isSelected && cell.state === 'idle') {
            (e.target as HTMLElement).style.filter = 'brightness(1.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected && cell.state === 'idle') {
            (e.target as HTMLElement).style.filter = 'brightness(1)';
          }
        }}
      >
        {isSelected && (
          <div
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine-effect pointer-events-none z-0"
            style={{ animationDelay: shineAnimationDelay }}
          />
        )}
        <span
          style={cell.isRainbow ? rainbowTextStyle : textShadowStyle}
          className={`relative z-[1] ${cell.isRainbow ? '' : colorClass}`}
        >
          {cell.isRainbow ? '' : cell.value}
        </span>

        {/* レインボーセル専用のCSSアイコン */}
        {cell.isRainbow && (
          <div className="rainbow-icon absolute inset-0 flex items-center justify-center">
            <div className="rainbow-core"></div>
          </div>
        )}

      </div>
      {/* 長いコンボの時にパーティクルエフェクトを表示 */}
      {comboParticles.map(p => (
        <div
          key={p.id}
          className={`absolute top-1/2 left-1/2 w-[8px] h-[8px] z-0 rounded-full pointer-events-none ${theme === 'light' ? 'bg-cyan-400' : 'bg-yellow-400/75'
            }`}
          style={p.style}
        />
      ))}
    </div>
  );
});