export interface CellData {
  id: number;
  value: number;
  state: 'idle' | 'clearing' | 'new';
}

export interface Position {
  row: number;
  col: number;
}

export type GameState = 'playing' | 'gameOver';

export interface FloatingScore {
  id: number;
  value: number;
  position: Position;
}

export type Theme = 'light' | 'dark';