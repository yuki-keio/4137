import React, { useEffect, useState } from 'react';

interface RainbowRefreshEffectProps {
  isActive: boolean;
  triggerPosition?: { x: number; y: number } | null; // 発動位置（画面座標）
  onComplete?: () => void;
}

const EFFECT_DURATION = 1200; // 1.2秒のエフェクト

export const RainbowRefreshEffect: React.FC<RainbowRefreshEffectProps> = ({
  isActive,
  triggerPosition,
  onComplete
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsAnimating(true);

      // エフェクト完了
      const completeTimer = setTimeout(() => {
        setIsAnimating(false);
        onComplete?.();
      }, EFFECT_DURATION);

      return () => {
        clearTimeout(completeTimer);
      };
    }
  }, [isActive, onComplete]);

  if (!isAnimating) {
    return null;
  }

  return (
    <div className="rainbow-refresh-effect fixed inset-0 z-50 pointer-events-none">
      {/* 発動位置の輝きエフェクト */}
      {triggerPosition && (
        <div
          className="rainbow-trigger-glow absolute"
          style={{
            left: triggerPosition.x,
            top: triggerPosition.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="trigger-spark-core"></div>
          <div className="trigger-spark-ring"></div>
          <div className="trigger-spark-rays"></div>
        </div>
      )}

      {/* 中央の虹コア */}
      <div className="rainbow-refresh-core absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="rainbow-core-pulse"></div>
      </div>

      {/* 虹の波動 */}
      <div className="rainbow-wave-container absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="rainbow-wave rainbow-wave-1"></div>
        <div className="rainbow-wave rainbow-wave-2"></div>
        <div className="rainbow-wave rainbow-wave-3"></div>
      </div>

      {/* きらきらパーティクル */}
      <div className="sparkle-container absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="sparkle sparkle-1"></div>
        <div className="sparkle sparkle-2"></div>
        <div className="sparkle sparkle-3"></div>
        <div className="sparkle sparkle-4"></div>
        <div className="sparkle sparkle-5"></div>
        <div className="sparkle sparkle-6"></div>
      </div>
    </div>
  );
};
