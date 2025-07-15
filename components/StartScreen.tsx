import React from 'react';

interface StartScreenProps {
  onStart: () => void;
  highScore: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, highScore }) => {
  return (
    <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center z-10 animate-fade-in p-4">
      <div className="text-center w-full max-w-md">
        <h1 className="text-7xl md:text-8xl font-bold text-white tracking-wider font-fira mb-4" style={{ textShadow: '0 0 15px rgba(56, 189, 248, 0.7)' }}>
          4137
        </h1>
        <p className="text-slate-400 text-xl mb-12">爽快シーケンスパズル</p>
        
        <div className="mb-12">
            <h2 className="text-cyan-400 font-bold mb-2 text-2xl">ハイスコア</h2>
            <p className="text-5xl font-bold text-white font-fira" style={{ textShadow: '0 0 10px rgba(255,255,255,0.7)' }}>
                {highScore}
            </p>
        </div>
        
        <button
          onClick={onStart}
          className="w-full max-w-xs px-8 py-4 bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white font-bold rounded-lg hover:opacity-90 transition-all duration-200 text-2xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105"
        >
          ゲームスタート
        </button>
      </div>
    </div>
  );
};
