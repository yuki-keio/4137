import React, { useState, useCallback, useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { GameEndScreen } from './components/GameEndScreen';
import { Instructions } from './components/Instructions';
import { LEVEL_THRESHOLDS, INITIAL_TIME_LIMIT } from './constants';
import { RefreshCw, Timer, HelpCircle } from './components/icons';
import { GameState } from './types';
import { ComboEffect } from './components/ComboEffect';

const HIGH_SCORE_KEY = '4137-highScore';

const App: React.FC = () => {
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

  const nextLevelThreshold = LEVEL_THRESHOLDS[level - 1];

  // Load high score on initial mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
    if (savedHighScore) {
      setHighScore(Number(savedHighScore));
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
    setIsNewHighScore(false);
  }, []);

  const currentLevelStartScore = level > 1 ? LEVEL_THRESHOLDS[level - 2] : 0;
  const pointsForNextLevel = nextLevelThreshold - currentLevelStartScore;
  const progressInCurrentLevel = score - currentLevelStartScore;
  
  const scorePercentage = nextLevelThreshold && pointsForNextLevel > 0
    ? Math.min((progressInCurrentLevel / pointsForNextLevel) * 100, 100)
    : 100;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-2 md:p-4 selection:bg-cyan-300 selection:text-slate-900">
      <ComboEffect
        count={comboEffectTrigger}
        onComplete={() => setComboEffectTrigger(null)}
      />
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        <header className="w-full flex justify-between items-center mb-4 p-4 rounded-lg bg-slate-800/50">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wider font-fira">
            4137
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInstructions(true)}
              className="p-2 rounded-md bg-slate-700 hover:bg-cyan-500 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              aria-label="遊び方"
            >
              <HelpCircle className="w-6 h-6" />
            </button>
            <button
              onClick={startGame}
              className="p-2 rounded-md bg-slate-700 hover:bg-cyan-500 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              aria-label="ゲームをリセット"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="w-full relative">
            <div className="mb-4 p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-x-4 w-full">
                {/* Left: Level */}
                <div className="flex items-center flex-shrink-0">
                  <span className="font-bold text-lg text-white-400">Lv.{level}</span>
                </div>

                {/* Center: Progress Bar + Score */}
                <div className="flex-grow flex items-center gap-x-3">
                  <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${scorePercentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-slate-400 font-fira font-normal whitespace-nowrap">
                    <span className="text-slate-200 font-medium">{score}</span>
                    <span className="px-1">/</span>
                    <span className="text-cyan-300">{nextLevelThreshold ? nextLevelThreshold : 'MAX'}</span>
                  </div>
                </div>
                
                {/* Right: Timer */}
                <div className="relative flex items-center flex-shrink-0">
                  <Timer className="w-6 h-6 text-red-400" />
                  <span className={`font-bold text-2xl text-white font-fira w-10 text-right ${timeLeft <= 10 ? 'text-red-400 animate-pulse-timer' : ''}`}>{timeLeft}</span>
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
            <GameBoard key={gameKey} onAddScore={handleAddScore} onGameStart={handleGameStart} />
             {gameState === 'gameOver' && (
               <GameEndScreen 
                 score={score}
                 level={level}
                 highScore={highScore}
                 isNewHighScore={isNewHighScore}
                 onReset={startGame}
               />
             )}
            {showInstructions && <Instructions onClose={() => setShowInstructions(false)} />}
        </main>
      </div>
    </div>
  );
};

export default App;