import React, { useEffect, useMemo, useState } from 'react';

interface ComboEffectProps {
  count: number | null;
  comboKey: number; // コンボの一意識別子
  onComplete: () => void;
}

const PARTICLE_COUNT = 10;
const DURATION = 1200; // ms

export const ComboEffect: React.FC<ComboEffectProps> = ({ count, comboKey, onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(false);

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
    if (!isAnimating) return [];
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
      const angle = Math.random() * 360;
      const distance = 150 + Math.random() * 100;
      const rotation = Math.random() * 720 - 360;
      const color = Math.random() > 0.5 ? 'bg-cyan-400' : 'bg-fuchsia-500';
      const delay = Math.random() * 200; // ms

      return {
        id: i,
        style: {
          '--transform-end': `translate(-50%, -50%) rotate(${angle}deg) translateX(${distance}px) rotate(${rotation}deg)`,
          animationDelay: `${delay}ms`,
          animationDuration: `${DURATION - delay}ms`,
        } as React.CSSProperties,
        color,
        shape: Math.random() > 0.5 ? 'rounded-full' : 'rounded-sm',
      };
    });
  }, [isAnimating, comboKey]);

  if (!isAnimating || !count) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
      {/* Combo Text */}
      <div
        key={`combo-text-${comboKey}`}
        className="text-6xl font-extrabold text-white font-fira"
        style={{
          animation: `combo-text-pop ${DURATION}ms ease-out forwards`,
          textShadow: '0 0 10px #facc15, 0 0 20px #facc15, 0 0 40px #facc15'
        }}
      >
        {`${count} COMBO!`}
      </div>

      {/* Particles */}
      <div key={`particles-${comboKey}`} className="absolute w-full h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {particles.map(p => (
          <div
            key={`particle-${comboKey}-${p.id}`}
            className={`absolute top-1/2 left-1/2 w-8 h-8 ${p.color} ${p.shape}`}
            style={{
              ...p.style,
              animationName: 'particle-burst',
              animationFillMode: 'forwards',
              animationTimingFunction: 'cubic-bezier(0.1, 0.8, 0.7, 1)',
            }}
          />
        ))}
      </div>
    </div>
  );
};