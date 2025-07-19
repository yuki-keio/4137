import React, { useEffect, useState } from 'react';
import { Position } from '../types';
import { GRID_SIZE } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface FloatingScoreProps {
    value: number;
    position: Position;
    onAnimationEnd: () => void;
}

export const FloatingScoreDisplay: React.FC<FloatingScoreProps> = ({ value, position, onAnimationEnd }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const { theme } = useTheme();

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

    // テーマに応じて色とテキストシャドウを変更
    const colorClass = theme === 'light' ? 'text-blue-600' : 'text-yellow-300';
    const textShadow = theme === 'light'
        ? '0 0 10px #2563eb, 0 0 20px #2563eb'
        : '0 0 10px #facc15, 0 0 20px #facc15';

    return (
        <div
            className={`absolute text-2xl md:text-3xl font-bold ${colorClass} pointer-events-none animate-pop-up`}
            style={{
                left,
                top,
                transform: 'translate(-50%, -50%)',
                textShadow
            }}
        >
            +{value}
        </div>
    );
};
