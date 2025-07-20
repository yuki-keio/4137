import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ComboEffectProps {
  count: number | null;
  comboKey: number; // コンボの一意識別子
  onComplete: () => void;
}

const BASE_PARTICLE_COUNT = 8;
const MAX_PARTICLE_COUNT = 20;
const DURATION = 1200; // ms

// パーティクルタイプの事前定義（パフォーマンス向上）
const PARTICLE_TYPES = {
  light: [
    { color: 'bg-yellow-400', shadow: 'shadow-md shadow-yellow-400/40' },
    { color: 'bg-cyan-400', shadow: 'shadow-md shadow-cyan-400/40' },
    { color: 'bg-pink-400', shadow: 'shadow-md shadow-pink-400/40' }
  ],
  dark: [
    { color: 'bg-yellow-500', shadow: 'shadow-lg shadow-yellow-500/50' },
    { color: 'bg-cyan-500', shadow: 'shadow-lg shadow-cyan-500/50' },
    { color: 'bg-pink-500', shadow: 'shadow-lg shadow-pink-500/50' }
  ]
};

const SIZES = ['w-2 h-2', 'w-3 h-3', 'w-4 h-4'];
const SHAPES = ['rounded-full', 'rounded-lg', 'rounded-sm'];

export const ComboEffect: React.FC<ComboEffectProps> = ({ count, comboKey, onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (count !== null && count >= 6) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete();
      }, DURATION);
      return () => clearTimeout(timer);
    } else {
      // countがnullの場合はアニメーションを停止
      setIsAnimating(false);
    }
  }, [count, comboKey, onComplete]);

  const particles = useMemo(() => {
    if (!isAnimating || !count) return [];

    // コンボ数に応じてパーティクル数を調整（パフォーマンス最適化）
    const particleCount = Math.min(
      BASE_PARTICLE_COUNT + Math.floor(count / 10),
      MAX_PARTICLE_COUNT
    );

    const particleTypes = PARTICLE_TYPES[theme];

    return Array.from({ length: particleCount }).map((_, i) => {
      // ランダム値を事前計算して再利用
      const typeIndex = i % particleTypes.length;
      const sizeIndex = i % SIZES.length;
      const shapeIndex = Math.floor(i / 3) % SHAPES.length;

      const angle = (360 / particleCount) * i + (Math.random() - 0.5) * 60; // より均等に分散
      const distance = 120 + (i % 3) * 40; // 距離を段階的に
      const delay = (i * 50) % 300; // より均等な遅延

      return {
        id: i,
        style: {
          '--end-rotate': `${angle}deg`,
          '--end-translate': `${distance}px`,
          animationDelay: `${delay}ms`,
          animationDuration: `${DURATION - delay}ms`,
        } as React.CSSProperties & { [key: string]: string },
        className: `absolute top-1/2 left-1/2 ${SIZES[sizeIndex]} ${particleTypes[typeIndex].color} ${SHAPES[shapeIndex]} ${particleTypes[typeIndex].shadow}`,
      };
    });
  }, [isAnimating, comboKey, theme, count]);

  if (!isAnimating || !count) {
    return null;
  }

  // テーマに応じてテキストカラーとシャドウを調整
  const textColorClass = theme === 'light' ? 'text-blue-600' : 'text-white';
  const textShadowStyle = '0 0 10px var(--combo-shadow-color), 0 0 20px var(--combo-shadow-color), 0 0 40px var(--combo-shadow-color)';

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
      {/* Combo Text */}
      <div
        key={`combo-text-${comboKey}`}
        className={`text-6xl font-extrabold ${textColorClass} font-fira`}
        style={{
          animation: `combo-text-pop ${DURATION}ms ease-out forwards`,
          textShadow: textShadowStyle
        }}
      >
        {`${count} COMBO!`}
      </div>

      {/* Particles */}
      <div key={`particles-${comboKey}`} className="absolute w-full h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {particles.map(p => (
          <div
            key={`particle-${comboKey}-${p.id}`}
            className={p.className}
            style={{
              ...p.style,
              animationName: 'combo-sparkle',
              animationFillMode: 'forwards',
              animationTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
        ))}
      </div>
    </div>
  );
};