import React from 'react';

interface GameEndScreenProps {
  score: number;
  level: number;
  highScore: number;
  isNewHighScore: boolean;
  onReset: () => void;
}

export const GameEndScreen: React.FC<GameEndScreenProps> = ({ score, level, highScore, isNewHighScore, onReset }) => {
  return (
    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl text-center border-2 border-cyan-400/50 shadow-cyan-500/20 w-11/12 max-w-md">
        
        {isNewHighScore && (
            <div className="mb-6 animate-fade-in">
                <p className="text-3xl font-bold text-yellow-300 text-glow">ハイスコア更新！</p>
            </div>
        )}

        <div className="mb-4">
          <h2 className="text-cyan-400 font-bold mb-2 text-2xl">スコア</h2>
          <p className="text-5xl font-bold text-white font-fira" style={{ textShadow: '0 0 10px rgba(255,255,255,0.7)' }}>
            {score}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 text-center">
            <div>
                 <h2 className="text-slate-400 font-bold mb-1 text-lg">レベル</h2>
                 <p className="text-4xl font-bold text-white font-fira">{level}</p>
            </div>
             <div>
                 <h2 className="text-slate-400 font-bold mb-1 text-lg">ハイスコア</h2>
                 <p className="text-4xl font-bold text-white font-fira">{highScore}</p>
            </div>
        </div>

        <button
          onClick={onReset}
          className="w-full mt-4 px-8 py-3 bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity duration-200 text-xl"
        >
          もう一度プレイ
        </button>
      </div>
    </div>
  );
};
