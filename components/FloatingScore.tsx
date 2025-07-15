import React, { useEffect, useState } from 'react';
import { Position } from '../types';
import { GRID_SIZE } from '../constants';

interface FloatingScoreProps {
  value: number;
  position: Position;
  onAnimationEnd: () => void;
}

export const FloatingScoreDisplay: React.FC<FloatingScoreProps> = ({ value, position, onAnimationEnd }) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setIsAnimating(true);
        const timer = setTimeout(onAnimationEnd, 800);
        return () => clearTimeout(timer);
    }, [onAnimationEnd]);

    if (!isAnimating) {
        return null;
    }
    
    const left = `${(position.col / GRID_SIZE) * 100 + (1 / GRID_SIZE / 2) * 100}%`;
    const top = `${(position.row / GRID_SIZE) * 100 + (1 / GRID_SIZE / 2) * 100}%`;

    return (
        <div 
            className="absolute text-2xl md:text-3xl font-bold text-yellow-300 pointer-events-none animate-pop-up"
            style={{ 
                left,
                top,
                transform: 'translate(-50%, -50%)',
                textShadow: '0 0 10px #facc15, 0 0 20px #facc15'
             }}
        >
            +{value}
        </div>
    );
};
