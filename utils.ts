
import { GridCell, CellType, Difficulty } from './types';

export const generateId = () => Math.random().toString(36).substr(2, 9);

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandom = <T>(values: T[]) =>
  values[Math.floor(Math.random() * values.length)];

const createEmptyGrid = (size: number) =>
  Array(size)
    .fill(null)
    .map((_, r) =>
      Array(size)
        .fill(null)
        .map((__, c) => ({
          id: generateId(),
          type: 'empty',
          value: '',
          userInput: '',
          isStatic: false,
          row: r,
          col: c,
        }))
    );

const generateEquation = (difficulty: Difficulty) => {
  const ranges =
    difficulty === 'hard'
      ? { min: 10, max: 99 }
      : { min: 1, max: 20 };
  const operators = difficulty === 'hard' ? ['+', '-', 'x', '/'] : ['+', '-', 'x'];
  const operator = pickRandom(operators);

  if (operator === '/') {
    const divisor = randomInt(2, 12);
    const result = randomInt(2, 15);
    const dividend = divisor * result;
    return { num1: dividend, num2: divisor, operator, result };
  }

  const num1 = randomInt(ranges.min, ranges.max);
  const num2 = randomInt(ranges.min, ranges.max);

  if (operator === '-') {
    const large = Math.max(num1, num2);
    const small = Math.min(num1, num2);
    return { num1: large, num2: small, operator, result: large - small };
  }

  if (operator === 'x') {
    const num1Adjusted = randomInt(2, 12);
    const num2Adjusted = randomInt(2, 12);
    return {
      num1: num1Adjusted,
      num2: num2Adjusted,
      operator,
      result: num1Adjusted * num2Adjusted,
    };
  }

  return { num1, num2, operator, result: num1 + num2 };
};

const generatePuzzle = (difficulty: Difficulty): GridCell[][] => {
  const size = 9;
  const grid = createEmptyGrid(size);
  const rows = [0, 2, 4, 6, 8];

  rows.forEach((rowIndex) => {
    const equation = generateEquation(difficulty);
    fillCell(grid, rowIndex, 0, 'number', String(equation.num1), true);
    fillCell(grid, rowIndex, 1, 'operator', equation.operator, true);
    fillCell(grid, rowIndex, 2, 'number', String(equation.num2), false);
    fillCell(grid, rowIndex, 3, 'equals', '=', true);
    fillCell(grid, rowIndex, 4, 'result', String(equation.result), true);
  });

  return grid;
};

export const createPuzzle = (difficulty: Difficulty = 'hard'): GridCell[][] => {
  return generatePuzzle(difficulty);
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
