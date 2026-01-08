
import { GridCell, CellType, Difficulty } from './types';

export const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Creates a hard 9x9 puzzle template with double digits and 'x' operator.
 */
export const createPuzzle = (difficulty: Difficulty = 'hard'): GridCell[][] => {
  const size = 9;
  const grid: GridCell[][] = Array(size).fill(null).map((_, r) =>
    Array(size).fill(null).map((_, c) => ({
      id: generateId(),
      type: 'empty',
      value: '',
      userInput: '',
      isStatic: false,
      row: r,
      col: c,
    }))
  );

  // We define a hardcoded 9x9 structure with double digits.
  // Using 'x' for multiplication.
  
  // R0: 15 x 3 = 45
  fillCell(grid, 0, 0, 'number', '15', true);
  fillCell(grid, 0, 1, 'operator', 'x', true);
  fillCell(grid, 0, 2, 'number', '3', false);
  fillCell(grid, 0, 3, 'equals', '=', true);
  fillCell(grid, 0, 4, 'result', '45', true);

  // C0: 15 + 21 = 36
  fillCell(grid, 1, 0, 'operator', '+', true);
  fillCell(grid, 2, 0, 'number', '21', false);
  fillCell(grid, 3, 0, 'equals', '=', true);
  fillCell(grid, 4, 0, 'result', '36', true);

  // R2: 21 - 11 = 10
  fillCell(grid, 2, 1, 'operator', '-', true);
  fillCell(grid, 2, 2, 'number', '11', false);
  fillCell(grid, 2, 3, 'equals', '=', true);
  fillCell(grid, 2, 4, 'result', '10', true);

  // C2: 3 + 11 = 14
  fillCell(grid, 1, 2, 'operator', '+', true);
  fillCell(grid, 3, 2, 'equals', '=', true);
  fillCell(grid, 4, 2, 'result', '14', true);

  // R4: 36 - 14 = 22
  fillCell(grid, 4, 1, 'operator', '-', true);
  fillCell(grid, 4, 3, 'equals', '=', true);
  fillCell(grid, 4, 4, 'result', '22', true);

  // Branching out further
  // C4: 45 / 5 = 9
  fillCell(grid, 1, 4, 'operator', '/', true);
  fillCell(grid, 2, 4, 'result', '10', true); // Existing
  fillCell(grid, 3, 4, 'equals', '=', true);
  fillCell(grid, 4, 4, 'result', '22', false); // This is now user input for equation: 45 / ? = ? (Wait, 45/5=9)
  // Let's re-adjust C4 logic: 45 - 23 = 22
  fillCell(grid, 1, 4, 'operator', '-', true);
  fillCell(grid, 2, 4, 'result', '10', true); // Keep consistent
  // R2: 21 - 11 = 10 (C4 crosses at R2,C4 which is 10)
  // C4: 45 - 35 = 10? No.
  // Let's stick to valid math:
  // C4: 45 (R0) 
  // R1,C4: -
  // R2,C4: 35
  // R3,C4: =
  // R4,C4: 10
  fillCell(grid, 1, 4, 'operator', '-', true);
  fillCell(grid, 2, 4, 'number', '35', false);
  fillCell(grid, 3, 4, 'equals', '=', true);
  fillCell(grid, 4, 4, 'result', '10', true);
  
  // Now R4: 36 (C0) - 14 (C2) = 22 (New R4,C4 needs to be consistent)
  // Re-adjusting R4 to: 36 - 14 = 22. 
  // Wait, R4,C4 was 10 from the C4 vertical.
  // Let's make R4: 36 - 26 = 10.
  fillCell(grid, 4, 2, 'number', '26', false);
  // Now C2 needs to be: 3 + 26 = 29
  fillCell(grid, 4, 2, 'number', '26', false);
  fillCell(grid, 3, 2, 'equals', '=', true);
  fillCell(grid, 4, 2, 'result', '29', true); 
  // Wait, R4,C0 is 36. R4,C1 is -. R4,C2 is 26. R4,C3 is =. R4,C4 is 10. (36-26=10) - Correct.
  // C2: 3 + 26 = 29. - Correct.
  fillCell(grid, 4, 0, 'result', '36', true);
  fillCell(grid, 4, 1, 'operator', '-', true);
  fillCell(grid, 4, 2, 'number', '26', false);
  fillCell(grid, 4, 3, 'equals', '=', true);
  fillCell(grid, 4, 4, 'result', '10', true);

  // New section
  // R6: 50 / 2 = 25
  fillCell(grid, 6, 0, 'number', '50', true);
  fillCell(grid, 6, 1, 'operator', '/', true);
  fillCell(grid, 6, 2, 'number', '2', false);
  fillCell(grid, 6, 3, 'equals', '=', true);
  fillCell(grid, 6, 4, 'result', '25', true);

  // C0: 36 + 14 = 50
  fillCell(grid, 5, 0, 'operator', '+', true);
  // R4,C0 is 36.
  fillCell(grid, 6, 0, 'number', '50', true);
  
  // C2: 29 x 2 = 58? No. 29 - 27 = 2.
  fillCell(grid, 5, 2, 'operator', '-', true);
  fillCell(grid, 6, 2, 'number', '27', false);
  fillCell(grid, 7, 2, 'equals', '=', true);
  fillCell(grid, 8, 2, 'result', '2', true);

  // R6 re-update: 50 - 23 = 27
  fillCell(grid, 6, 1, 'operator', '-', true);
  fillCell(grid, 6, 2, 'number', '23', false);
  fillCell(grid, 6, 3, 'equals', '=', true);
  fillCell(grid, 6, 4, 'result', '27', true);

  // Let's add more double digits in a fresh block
  // R0, C6: 12 x 4 = 48
  fillCell(grid, 0, 6, 'number', '12', true);
  fillCell(grid, 0, 7, 'operator', 'x', true);
  fillCell(grid, 0, 8, 'number', '4', false);
  fillCell(grid, 1, 8, 'equals', '=', true); // Vertical
  fillCell(grid, 2, 8, 'result', '48', true); // Vertical target
  // Re-adjust:
  fillCell(grid, 0, 6, 'number', '12', true);
  fillCell(grid, 0, 7, 'operator', 'x', true);
  fillCell(grid, 0, 8, 'number', '4', false);
  fillCell(grid, 0, 9, 'equals', '=', true); // Wait grid is 9x9, max index 8
  
  // Let's do R8: 10 + 35 = 45
  fillCell(grid, 8, 0, 'number', '10', false);
  fillCell(grid, 8, 1, 'operator', '+', true);
  fillCell(grid, 8, 2, 'number', '35', false);
  fillCell(grid, 8, 3, 'equals', '=', true);
  fillCell(grid, 8, 4, 'result', '45', true);

  return grid;
};

const fillCell = (grid: GridCell[][], r: number, c: number, type: CellType, value: string, isStatic: boolean) => {
  if (grid[r] && grid[r][c]) {
    grid[r][c].type = type;
    grid[r][c].value = value;
    grid[r][c].isStatic = isStatic;
    // We don't fill userInput for non-static cells anymore, user moves numbers there.
    if (isStatic) grid[r][c].userInput = value;
    else grid[r][c].userInput = '';
  }
};

export const checkEquation = (cells: GridCell[]): boolean => {
  if (cells.length < 5) return false;
  
  const num1 = parseInt(cells[0].userInput);
  const op = cells[1].value;
  const num2 = parseInt(cells[2].userInput);
  const result = parseInt(cells[4].userInput);

  if (isNaN(num1) || isNaN(num2) || isNaN(result)) return false;

  switch (op) {
    case '+': return num1 + num2 === result;
    case '-': return num1 - num2 === result;
    case 'x': return num1 * num2 === result;
    case '/': return num1 / num2 === result;
    default: return false;
  }
};

export const extractEquations = (grid: GridCell[][]) => {
  const equations: { cells: GridCell[]; orientation: 'horizontal' | 'vertical' }[] = [];
  const size = grid.length;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size - 4; c++) {
      if (grid[r][c].type === 'number' && grid[r][c+1].type === 'operator' && grid[r][c+3].type === 'equals') {
        equations.push({
          cells: [grid[r][c], grid[r][c+1], grid[r][c+2], grid[r][c+3], grid[r][c+4]],
          orientation: 'horizontal'
        });
      }
    }
  }

  for (let c = 0; c < size; c++) {
    for (let r = 0; r < size - 4; r++) {
      if (grid[r][c].type === 'number' && grid[r+1][c].type === 'operator' && grid[r+3][c].type === 'equals') {
        equations.push({
          cells: [grid[r][c], grid[r+1][c], grid[r+2][c], grid[r+3][c], grid[r+4][c]],
          orientation: 'vertical'
        });
      }
    }
  }

  return equations;
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
