import React, { useEffect, useState } from 'react';

interface LevelUpEffectProps {
  level: number | null;
  onComplete: () => void;
}

const DURATION = 1500; // ms

export const LevelUpEffect: React.FC<LevelUpEffectProps> = ({ level, onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (level !== null && level > 1) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete();
      }, DURATION);
      return () => clearTimeout(timer);
    }
  }, [level, onComplete]);

  if (!isAnimating || !level) {
    return null;
  }
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
      <div 
        className="text-6xl font-extrabold text-white font-fira"
        style={{
          animation: `level-up-pop ${DURATION}ms ease-out forwards`,
          textShadow: '0 0 10px #38bdf8, 0 0 20px #38bdf8, 0 0 40px #38bdf8'
        }}
      >
        {`LEVEL ${level}!`}
      </div>
    </div>
  );
};
