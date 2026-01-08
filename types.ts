
export type CellType = 'number' | 'operator' | 'equals' | 'empty' | 'result';

export interface GridCell {
  id: string;
  type: CellType;
  value: string; // The correct answer
  userInput: string; // What the user has currently placed
  isStatic: boolean; // If true, the cell is pre-filled and cannot be changed
  row: number;
  col: number;
}

export type Difficulty = 'hard'; // Restricting to hard as requested

export interface Equation {
  cells: GridCell[];
  orientation: 'horizontal' | 'vertical';
  isValid: boolean | null;
}

export interface PoolNumber {
  id: string;
  value: string;
  isUsed: boolean;
}
