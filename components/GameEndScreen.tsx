import React, { useState, useEffect } from 'react';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface GameEndScreenProps {
  score: number;
  level: number;
  highScore: number;
  isNewHighScore: boolean;
  onReset: () => void;
  canInstall: boolean;
  onInstall: () => Promise<boolean>;
}

export const GameEndScreen: React.FC<GameEndScreenProps> = ({
  score,
  level,
  highScore,
  isNewHighScore,
  onReset,
  canInstall,
  onInstall
}) => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);

  // ローカルストレージから設定を取得
  const getNeverShowInstallPrompt = () => {
    try {
      return localStorage.getItem('neverShowPWAInstall') === 'true';
    } catch {
      return false;
    }
  };

  const setNeverShowInstallPrompt = () => {
    try {
      localStorage.setItem('neverShowPWAInstall', 'true');
    } catch {
      // ローカルストレージが使えない場合は何もしない
    }
  };

  // ゲーム終了後に一度だけインストールプロンプトを表示
  useEffect(() => {
    if (canInstall && !hasShownPrompt && !getNeverShowInstallPrompt()) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
        setHasShownPrompt(true);
      }, 2000); // 2秒後に表示

      return () => clearTimeout(timer);
    }
  }, [canInstall, hasShownPrompt]);

  const handleInstall = async () => {
    const success = await onInstall();
    if (success) {
      setShowInstallPrompt(false);
    }
  };

  const handleCancelInstall = () => {
    setShowInstallPrompt(false);
  };

  const handleNeverShowInstall = () => {
    setNeverShowInstallPrompt();
    setShowInstallPrompt(false);
  };
  return (
    <div className="absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="p-8 rounded-xl shadow-2xl text-center border-2 border-cyan-400/50 shadow-cyan-500/20 w-11/12 max-w-md transition-all duration-300" style={{ backgroundColor: 'var(--bg-secondary)' }}>

        {isNewHighScore && (
          <div className="mb-6 animate-fade-in">
            <p className="text-3xl font-bold text-yellow-300 text-glow">ハイスコア更新！</p>
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-cyan-400 font-bold mb-2 text-2xl">スコア</h2>
          <p className="text-5xl font-bold font-fira" style={{
            textShadow: '0 0 10px rgba(255,255,255,0.7)',
            color: 'var(--text-primary)'
          }}>
            {score}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 text-center">
          <div>
            <h2 className="font-bold mb-1 text-lg" style={{ color: 'var(--text-secondary)' }}>レベル</h2>
            <p className="text-4xl font-bold font-fira" style={{ color: 'var(--text-primary)' }}>{level}</p>
          </div>
          <div>
            <h2 className="font-bold mb-1 text-lg" style={{ color: 'var(--text-secondary)' }}>ハイスコア</h2>
            <p className="text-4xl font-bold font-fira" style={{ color: 'var(--text-primary)' }}>{highScore}</p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="w-full mt-4 px-8 py-3 text-white font-bold rounded-lg hover:opacity-90 transition-opacity duration-200 text-xl"
          style={{ background: 'linear-gradient(to right, var(--ui-gradient-start), var(--ui-gradient-end))' }}
        >
          もう一度プレイ
        </button>
      </div>

      <PWAInstallPrompt
        isVisible={showInstallPrompt}
        onInstall={handleInstall}
        onCancel={handleCancelInstall}
        onNeverShow={handleNeverShowInstall}
      />
    </div>
  );
};
