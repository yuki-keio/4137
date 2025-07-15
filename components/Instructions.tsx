import React from 'react';

interface InstructionsProps {
  onClose: () => void;
}

export const Instructions: React.FC<InstructionsProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-fade-in p-4">
      <div className="relative bg-slate-800 p-8 rounded-xl shadow-2xl shadow-cyan-500/10 text-center border-2 border-cyan-400/50 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">遊び方</h2>
        <div className="text-slate-300 text-lg space-y-4 text-left mb-8">
          <p>
            タテ・ヨコ・ナナメに隣り合った数字を
            <strong className="text-cyan-300">「4 → 1 → 3 → 7 →」</strong>
            の順番に繋げて消せます。
          </p>
          <p>
            スコアは、繋げた数字を<strong className="text-yellow-300">掛け算した値</strong>になります。
          </p>
        </div>
        <button
          onClick={onClose}
          className="px-10 py-3 bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white font-bold rounded-lg hover:opacity-90 transition-all duration-200 hover:scale-105 text-xl"
        >
          ゲームをプレイ
        </button>
      </div>
    </div>
  );
};