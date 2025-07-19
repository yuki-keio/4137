import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { NumberCell } from './NumberCell';
import { FloatingScoreDisplay } from './FloatingScore';
import { SelectionLine } from './SelectionLine';
import { CellData, Position, FloatingScore } from '../types';
import { GRID_SIZE, SEQUENCE, WEIGHTED_NUMBERS, HINT_TIMEOUT, NUMBER_COLORS } from '../constants';

interface GameBoardProps {
  onAddScore: (score: number, cellCount: number) => void;
  onGameStart: () => void;
}

const generateInitialGrid = (): CellData[][] => {
  let counter = 0;
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      id: counter++,
      value: WEIGHTED_NUMBERS[Math.floor(Math.random() * WEIGHTED_NUMBERS.length)],
      state: 'idle',
    }))
  );
};

const generateReplenishPool = (grid: CellData[][]): number[] => {
  const numberCounts: { [key: number]: number } = { 4: 0, 1: 0, 3: 0, 7: 0 };

  grid.forEach(row => {
    row.forEach(cell => {
      if (cell.value !== 0 && numberCounts[cell.value] !== undefined) {
        numberCounts[cell.value]++;
      }
    });
  });

  const pool = [...WEIGHTED_NUMBERS];
  const totalCells = GRID_SIZE * GRID_SIZE;
  const targetCount = SEQUENCE.length > 0 ? totalCells / SEQUENCE.length : totalCells;

  SEQUENCE.forEach(num => {
    const count = numberCounts[num] || 0;
    const deficit = Math.max(0, Math.floor(targetCount - count));
    // 不足している数字を少し多めに補充するためのボーナス
    const bonus = Math.ceil(deficit / 4);

    for (let i = 0; i < bonus; i++) {
      pool.push(num);
    }
  });

  return pool;
};

export const GameBoard: React.FC<GameBoardProps> = ({ onAddScore, onGameStart }) => {
  const [grid, setGrid] = useState<CellData[][]>(generateInitialGrid);
  const [selectedCells, setSelectedCells] = useState<Position[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [hintedCells, setHintedCells] = useState<Set<string>>(new Set());
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const hintTimer = useRef<number | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasNewCells = grid.some(row => row.some(cell => cell.state === 'new'));
    if (hasNewCells) {
      const timer = setTimeout(() => {
        setGrid(prev => prev.map(row =>
          row.map(cell => cell.state === 'new' ? { ...cell, state: 'idle' } : cell)
        ));
      }, 500); // Corresponds to slide-down animation duration
      return () => clearTimeout(timer);
    }
  }, [grid]);

  const getPositionFromInteraction = (e: React.MouseEvent | React.TouchEvent): Position | null => {
    const board = boardRef.current;
    if (!board) return null;

    const touch = (e as React.TouchEvent).touches?.[0] || (e as React.TouchEvent).changedTouches?.[0];
    const clientX = touch ? touch.clientX : (e as React.MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as React.MouseEvent).clientY;

    const rect = board.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const col = Math.floor((x / rect.width) * GRID_SIZE);
    const row = Math.floor((y / rect.height) * GRID_SIZE);

    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      return { row, col };
    }
    return null;
  };

  const resetHintTimer = useCallback(() => {
    if (hintTimer.current) clearTimeout(hintTimer.current);
    setHintedCells(new Set());
  }, []);

  const startHintTimer = useCallback(() => {
    resetHintTimer();
    hintTimer.current = window.setTimeout(() => {
      const newHintedCells = new Set<string>();
      if (selectedCells.length === 0) {
        // Highlight starting '4's
        grid.forEach((row, rIdx) => {
          row.forEach((cell, cIdx) => {
            if (cell.value === SEQUENCE[0]) {
              newHintedCells.add(`${rIdx}-${cIdx}`);
            }
          });
        });
      } else {
        // Highlight next possible moves
        const lastPos = selectedCells[selectedCells.length - 1];
        const nextValue = SEQUENCE[selectedCells.length % SEQUENCE.length];
        for (let r_off = -1; r_off <= 1; r_off++) {
          for (let c_off = -1; c_off <= 1; c_off++) {
            if (r_off === 0 && c_off === 0) continue;
            const nextRow = lastPos.row + r_off;
            const nextCol = lastPos.col + c_off;
            if (nextRow >= 0 && nextRow < GRID_SIZE && nextCol >= 0 && nextCol < GRID_SIZE) {
              const isAlreadySelected = selectedCells.some(p => p.row === nextRow && p.col === nextCol);
              if (!isAlreadySelected && grid[nextRow][nextCol].value === nextValue) {
                newHintedCells.add(`${nextRow}-${nextCol}`);
              }
            }
          }
        }
      }
      setHintedCells(newHintedCells);
    }, HINT_TIMEOUT);
  }, [grid, selectedCells, resetHintTimer]);

  useEffect(() => {
    startHintTimer();
    return () => resetHintTimer();
  }, [selectedCells, grid, startHintTimer, resetHintTimer]);


  const handleInteractionEnd = useCallback(() => {
    if (!isSelecting) return;
    setIsSelecting(false);

    if (selectedCells.length > 1) {
      const score = selectedCells.reduce((prod, pos) => prod * grid[pos.row][pos.col].value, 1);
      onAddScore(score, selectedCells.length);

      const lastPos = selectedCells[selectedCells.length - 1];
      setFloatingScores(f => [...f, { id: Date.now(), value: score, position: lastPos }]);

      setGrid(prevGrid => {
        const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })));
        selectedCells.forEach(pos => {
          newGrid[pos.row][pos.col].state = 'clearing';
        });
        return newGrid;
      });

      setTimeout(() => {
        setGrid(prevGrid => {
          const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })));
          selectedCells.forEach(pos => {
            newGrid[pos.row][pos.col].value = 0;
          });

          for (let col = 0; col < GRID_SIZE; col++) {
            let emptyRow = GRID_SIZE - 1;
            for (let row = GRID_SIZE - 1; row >= 0; row--) {
              if (newGrid[row][col].value !== 0) {
                [newGrid[emptyRow][col], newGrid[row][col]] = [newGrid[row][col], newGrid[emptyRow][col]];
                emptyRow--;
              }
            }
          }

          const replenishPool = generateReplenishPool(newGrid);
          let idCounter = Math.max(...newGrid.flat().map(c => c.id)) + 1;

          for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
              if (newGrid[row][col].value === 0) {
                newGrid[row][col] = {
                  id: idCounter++,
                  value: replenishPool[Math.floor(Math.random() * replenishPool.length)],
                  state: 'new',
                };
              } else {
                newGrid[row][col].state = 'idle';
              }
            }
          }
          return newGrid;
        });
      }, 400); // Wait for clearing animation
    }

    setSelectedCells([]);
  }, [isSelecting, selectedCells, grid, onAddScore]);

  const handleInteractionStart = (pos: Position | null) => {
    if (!pos || grid[pos.row][pos.col].value !== SEQUENCE[0]) return;

    onGameStart();

    resetHintTimer();
    setIsSelecting(true);
    setSelectedCells([pos]);
  };

  const handleInteractionMove = (pos: Position | null) => {
    if (!isSelecting || !pos) return;

    setSelectedCells(prev => {
      const lastPos = prev[prev.length - 1];

      // Do nothing if the cursor hasn't moved to a new cell
      if (pos.row === lastPos.row && pos.col === lastPos.col) {
        return prev;
      }

      // Handle backtracking to undo the last selection
      const secondLastPos = prev[prev.length - 2];
      if (secondLastPos && pos.row === secondLastPos.row && pos.col === secondLastPos.col) {
        return prev.slice(0, -1);
      }

      const isAdjacent = Math.abs(lastPos.row - pos.row) <= 1 && Math.abs(lastPos.col - pos.col) <= 1;
      // The key fix: check for selection status against the latest state `prev`
      const isAlreadySelected = prev.some(p => p.row === pos.row && p.col === pos.col);
      const nextValue = SEQUENCE[prev.length % SEQUENCE.length];

      if (isAdjacent && !isAlreadySelected && grid[pos.row][pos.col].value === nextValue) {
        return [...prev, pos];
      }

      return prev;
    });
  };

  const selectedMap = useMemo(() => {
    const map = new Map<string, number>();
    selectedCells.forEach((p, index) => {
      map.set(`${p.row}-${p.col}`, index);
    });
    return map;
  }, [selectedCells]);

  const currentSequenceNumbers = useMemo(() => {
    return selectedCells.map(pos => grid[pos.row][pos.col].value);
  }, [selectedCells, grid]);

  const boardSize = boardRef.current
    ? { width: boardRef.current.clientWidth, height: boardRef.current.clientHeight }
    : { width: 0, height: 0 };

  const boardClasses = [
    'relative', 'grid', 'p-1', 'md:p-2', 'rounded-lg',
    'shadow-lg', 'touch-none',
  ];

  return (
    <div className="flex flex-col items-center">
      <div
        ref={boardRef}
        className={boardClasses.join(' ')}
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        onMouseLeave={handleInteractionEnd}
        onMouseDown={(e) => handleInteractionStart(getPositionFromInteraction(e))}
        onMouseMove={(e) => handleInteractionMove(getPositionFromInteraction(e))}
        onMouseUp={handleInteractionEnd}
        onTouchStart={(e) => handleInteractionStart(getPositionFromInteraction(e))}
        onTouchMove={(e) => handleInteractionMove(getPositionFromInteraction(e))}
        onTouchEnd={handleInteractionEnd}
      >
        {selectedCells.length > 1 && boardSize.width > 0 && (
          <SelectionLine
            selectedCells={selectedCells}
            boardSize={boardSize}
          />
        )}
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const selectionIndex = selectedMap.get(`${rowIndex}-${colIndex}`);
            const isSelected = selectionIndex !== undefined;

            return (
              <NumberCell
                key={cell.id}
                cell={cell}
                isSelected={isSelected}
                isHinted={hintedCells.has(`${rowIndex}-${colIndex}`)}
                selectionIndex={selectionIndex}
                comboLength={selectedCells.length}
              />
            )
          })
        )}
        {floatingScores.map(fs => (
          <FloatingScoreDisplay
            key={fs.id}
            value={fs.value}
            position={fs.position}
            onAnimationEnd={() => setFloatingScores(f => f.filter(item => item.id !== fs.id))}
          />
        ))}
      </div>
      <div className="mt-4 w-full h-20 flex items-center justify-center rounded-lg p-2 text-center transition-all duration-300" style={{ backgroundColor: 'var(--bg-secondary)' }} aria-live="polite">
        <div className="text-2xl md:text-3xl font-bold transition-all duration-300 font-fira flex items-center gap-x-2">
          {(currentSequenceNumbers.length > 0 ? currentSequenceNumbers : SEQUENCE).map((num, index, arr) => {
            const isSelectionActive = currentSequenceNumbers.length > 0;
            return (
              <React.Fragment key={index}>
                <span className={`${NUMBER_COLORS[num]} ${isSelectionActive ? 'text-glow' : ''}`}>{num}</span>
                {index < arr.length && (
                  <span className={isSelectionActive ? 'text-cyan-400 text-glow' : ''} style={{ color: isSelectionActive ? '#22d3ee' : 'var(--text-secondary)' }}>→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};