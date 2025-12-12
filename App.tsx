import React, { useState, useCallback, useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { GameEndScreen } from './components/GameEndScreen';
import { Instructions } from './components/Instructions';
import { LEVEL_THRESHOLDS, INITIAL_TIME_LIMIT } from './constants';
import { Timer, HelpCircle, Sun, Moon } from './components/icons';
import { GameState } from './types';
import { ComboEffect } from './components/ComboEffect';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { usePWAInstall } from './hooks/usePWAInstall';

const HIGH_SCORE_KEY = '4137-highScore';

const GameApp: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { canInstall, installPWA } = usePWAInstall();

  // Game state management
  const [gameState, setGameState] = useState<GameState>('playing');
  const [showInstructions, setShowInstructions] = useState(false);

  // Game data
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_LIMIT);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Control/Trigger states
  const [gameKey, setGameKey] = useState(Date.now());
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeBonusFeedback, setTimeBonusFeedback] = useState<{ amount: number; count: number } | null>(null);
  const [comboEffectTrigger, setComboEffectTrigger] = useState<number | null>(null);
  const [comboKey, setComboKey] = useState(0);

  const nextLevelThreshold = LEVEL_THRESHOLDS[level - 1];

  // Load high score on initial mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
    if (savedHighScore) {
      setHighScore(Number(savedHighScore));
    }
  }, []);

  // Register Service Worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => {
          console.log('Service Worker registered successfully');
        })
        .catch((registrationError) => {
          console.log('Service Worker registration failed: ', registrationError);
        });
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState !== 'playing' || !isTimerRunning) return;

    if (timeLeft <= 0) {
      setGameState('gameOver');
      setIsTimerRunning(false);

      // Check for new high score
      if (score > highScore) {
        setIsNewHighScore(true);
        setHighScore(score);
        localStorage.setItem(HIGH_SCORE_KEY, String(score));
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft, isTimerRunning, score, highScore]);

  // Level up logic
  useEffect(() => {
    if (gameState !== 'playing' || !isTimerRunning) return;

    let levelsGained = 0;
    let tempLevel = level;
    while (LEVEL_THRESHOLDS[tempLevel - 1] && score >= LEVEL_THRESHOLDS[tempLevel - 1]) {
      levelsGained++;
      tempLevel++;
    }

    if (levelsGained > 0) {
      const newLevel = level + levelsGained;
      const timeBonusPerLevel = 5;
      setLevel(newLevel);
      setTimeLeft(prevTime => prevTime + timeBonusPerLevel * levelsGained);
      setTimeBonusFeedback({ amount: timeBonusPerLevel, count: levelsGained });
    }
  }, [score, level, gameState, isTimerRunning]);


  const handleAddScore = useCallback((points: number, cellCount: number) => {
    setScore(prev => prev + points);
    if (cellCount >= 6) {
      setComboEffectTrigger(cellCount);
      setComboKey(prev => prev + 1); // 新しいコンボキーを生成
    }
  }, []);

  const handleGameStart = useCallback(() => {
    if (!isTimerRunning && gameState === 'playing') {
      setIsTimerRunning(true);
    }
  }, [isTimerRunning, gameState]);

  // This function now resets the game to a fresh 'playing' state
  const startGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setTimeLeft(INITIAL_TIME_LIMIT);
    setGameKey(Date.now());
    setGameState('playing');
    setIsTimerRunning(false); // Timer starts on first interaction
    setTimeBonusFeedback(null);
    setComboEffectTrigger(null);
    setComboKey(0); // コンボキーもリセット
    setIsNewHighScore(false);
  }, []);

  const currentLevelStartScore = level > 1 ? LEVEL_THRESHOLDS[level - 2] : 0;
  const pointsForNextLevel = nextLevelThreshold - currentLevelStartScore;
  const progressInCurrentLevel = score - currentLevelStartScore;

  const scorePercentage = nextLevelThreshold && pointsForNextLevel > 0
    ? Math.min((progressInCurrentLevel / pointsForNextLevel) * 100, 100)
    : 100;

  return (
    <div className="transition-all duration-300" style={{
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      <div className="flex flex-col items-center justify-center p-2 md:p-4 selection:bg-cyan-300 selection:text-slate-900">
        <ComboEffect
          count={comboEffectTrigger}
          comboKey={comboKey}
          onComplete={() => setComboEffectTrigger(null)}
        />
        <div className="w-full max-w-lg mx-auto flex flex-col items-center">
          <header className="w-full flex justify-between items-center mb-4 p-4 rounded-lg transition-all duration-300" style={{
            backgroundColor: 'var(--bg-secondary)'
          }}>
            <h1
              className="text-3xl md:text-4xl font-bold tracking-wider font-fira cursor-pointer transition-all duration-200"
              style={{
                color: 'var(--text-primary)',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#06b6d4'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onClick={startGame}
            >
              4137
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }}
                aria-label={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
              >
                {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
              <button
                onClick={() => setShowInstructions(true)}
                className="p-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }}
                aria-label="遊び方"
              >
                <HelpCircle className="w-6 h-6" />
              </button>
            </div>
          </header>

          <main className="w-full relative">
            <div className="mb-4 p-3 rounded-lg transition-all duration-300" style={{
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <div className="flex items-center gap-x-4 w-full">
                {/* Left: Level */}
                <div className="flex items-center flex-shrink-0">
                  <span className="font-bold text-lg" style={{ color: 'var(--text-secondary)' }}>Lv.{level}</span>
                </div>

                {/* Center: Progress Bar + Score */}
                <div className="flex-grow flex items-center gap-x-3">
                  <div className="w-full rounded-full h-2.5 overflow-hidden" style={{
                    backgroundColor: 'var(--bg-tertiary)'
                  }}>
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${scorePercentage}%`,
                        background: 'linear-gradient(to right, var(--gradient-start), var(--gradient-end))'
                      }}
                    />
                  </div>
                  <div className="text-sm font-fira font-normal whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{score}</span>
                    <span className="px-1">/</span>
                    <span style={{ color: 'var(--text-accent)' }}>{nextLevelThreshold ? nextLevelThreshold : 'MAX'}</span>
                  </div>
                </div>

                {/* Right: Timer */}
                <div className="relative flex items-center flex-shrink-0">
                  <Timer className="w-6 h-6 text-red-400" />
                  <span className={`font-bold text-2xl font-fira w-10 text-right ${timeLeft <= 10 ? 'text-red-400 animate-pulse-timer' : ''}`} style={{ color: timeLeft <= 10 ? '#f87171' : 'var(--text-primary)' }}>{timeLeft}</span>
                  {timeBonusFeedback && Array.from({ length: timeBonusFeedback.count }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-1/2 top-0 text-lg md:text-xl font-bold text-green-400 pointer-events-none animate-time-bonus"
                      style={{
                        textShadow: '0 0 8px #4ade80',
                        animationDelay: `${i * 200}ms`
                      }}
                      onAnimationEnd={() => {
                        if (i === timeBonusFeedback.count - 1) {
                          setTimeBonusFeedback(null);
                        }
                      }}
                    >
                      +{timeBonusFeedback.amount}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <GameBoard
              key={gameKey}
              onAddScore={handleAddScore}
              onGameStart={handleGameStart}
            />
            {gameState === 'gameOver' && (
              <GameEndScreen
                score={score}
                level={level}
                highScore={highScore}
                isNewHighScore={isNewHighScore}
                onReset={startGame}
                canInstall={canInstall}
                onInstall={installPWA}
              />
            )}
            {showInstructions && <Instructions onClose={() => setShowInstructions(false)} />}
          </main>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <GameApp />
    </ThemeProvider>
  );
};

export default App;