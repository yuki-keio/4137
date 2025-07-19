import React from 'react';

interface InstructionsProps {
  onClose: () => void;
}

export const Instructions: React.FC<InstructionsProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-fade-in p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="relative p-8 rounded-xl shadow-2xl shadow-cyan-500/10 text-center border-2 border-cyan-400/50 max-w-lg mx-auto transition-all duration-300" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>遊び方</h2>
        <div className="text-lg space-y-4 text-left mb-8" style={{ color: 'var(--text-secondary)' }}>
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
          className="px-10 py-3 text-white font-bold rounded-lg hover:opacity-90 transition-all duration-200 hover:scale-105 text-xl"
          style={{ background: 'linear-gradient(to right, var(--gradient-start), var(--gradient-end))' }}
        >
          ゲームをプレイ
        </button>
      </div>
    </div>
  );
};