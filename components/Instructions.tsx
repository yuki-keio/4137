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
            <strong>「<span className="text-[var(--number-4-color)]">4</span> → <span className="text-[var(--number-1-color)]">1</span> → <span className="text-[var(--number-3-color)]">3</span> → <span className="text-[var(--number-7-color)]">7</span> →」</strong>
            の順番にスライドして繋げます
          </p>
          <p>
            繋げた数字を<strong className="text-cyan-500">掛け算した値</strong>がスコアに加算されていきます🚀✨️
          </p>
        </div>
        <button
          onClick={onClose}
          className="px-10 py-2 text-white font-bold rounded-lg hover:opacity-90 transition-all duration-200 hover:scale-105 text-xl"
          style={{ background: 'linear-gradient(to right, var(--ui-gradient-start), var(--ui-gradient-end))' }}
        >
          OK
        </button>
      </div>
    </div>
  );
};