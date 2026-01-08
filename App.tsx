
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  CheckCircle2, 
  Github, 
  Lightbulb,
  Brain,
  ChevronRight,
  MousePointer2
} from 'lucide-react';
import { GridCell, PoolNumber } from './types';
import { createPuzzle, extractEquations, checkEquation, generateId, shuffleArray } from './utils';

const App: React.FC = () => {
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [numberPool, setNumberPool] = useState<PoolNumber[]>([]);
  const [selectedCell, setSelectedCell] = useState<{r: number, c: number} | null>(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const startNewGame = useCallback(() => {
    const newGrid = createPuzzle('hard');
    const emptyCells = newGrid.flat().filter(cell => !cell.isStatic && cell.type !== 'empty');
    const pool: PoolNumber[] = emptyCells.map(cell => ({
      id: generateId(),
      value: cell.value,
      isUsed: false
    }));

    setGrid(newGrid);
    setNumberPool(shuffleArray(pool));
    setIsGameComplete(false);
    setShowFeedback(false);
    setTimer(0);
    setIsActive(true);
    setSelectedCell(null);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && !isGameComplete) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, isGameComplete]);

  const handleCellClick = (r: number, c: number) => {
    if (isGameComplete) return;
    const cell = grid[r][c];
    if (cell.isStatic || cell.type === 'empty' || cell.type === 'operator' || cell.type === 'equals') return;

    if (cell.userInput !== '') {
      const valueToReturn = cell.userInput;
      const newPool = [...numberPool];
      const poolIdx = newPool.findIndex(p => p.value === valueToReturn && p.isUsed);
      if (poolIdx !== -1) {
        newPool[poolIdx].isUsed = false;
      }
      
      const newGrid = [...grid.map(row => row.map(cell => ({...cell})))];
      newGrid[r][c].userInput = '';
      setGrid(newGrid);
      setNumberPool(newPool);
      setSelectedCell({r, c});
    } else {
      setSelectedCell({r, c});
    }
    setShowFeedback(false);
  };

  const handlePoolNumberClick = (poolItem: PoolNumber) => {
    if (isGameComplete || !selectedCell || poolItem.isUsed) return;

    const { r, c } = selectedCell;
    const newGrid = [...grid.map(row => row.map(cell => ({...cell})))];
    newGrid[r][c].userInput = poolItem.value;
    
    const newPool = numberPool.map(p => p.id === poolItem.id ? { ...p, isUsed: true } : p);

    setGrid(newGrid);
    setNumberPool(newPool);
    setSelectedCell(null);
    setShowFeedback(false);
  };

  const validatePuzzle = () => {
    const equations = extractEquations(grid);
    let allValid = true;

    const allFilled = grid.flat().every(cell => 
      cell.type === 'empty' || cell.userInput !== ''
    );

    if (!allFilled) {
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
      return;
    }

    equations.forEach(eq => {
      const isValid = checkEquation(eq.cells);
      if (!isValid) allValid = false;
    });

    if (allValid) {
      setIsGameComplete(true);
      setIsActive(false);
    } else {
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const revealHint = () => {
    const emptySlot = grid.flat().find(cell => !cell.isStatic && cell.userInput === '' && cell.type !== 'empty');
    if (!emptySlot) return;
    
    const poolIdx = numberPool.findIndex(p => p.value === emptySlot.value && !p.isUsed);
    if (poolIdx !== -1) {
      const { r, c } = { r: emptySlot.row, c: emptySlot.col };
      const newGrid = [...grid.map(row => row.map(cell => ({...cell})))];
      newGrid[r][c].userInput = emptySlot.value;
      const newPool = [...numberPool];
      newPool[poolIdx].isUsed = true;
      setGrid(newGrid);
      setNumberPool(newPool);
      setSelectedCell(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-900/50">
            <Brain className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Math Crossword Master</h1>
            <p className="text-slate-500 text-sm font-medium">Hard Level • Double Digits</p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-slate-900 px-6 py-3 rounded-2xl shadow-sm border border-slate-800">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Time</span>
            <span className="text-lg font-mono font-bold text-indigo-400">{formatTime(timer)}</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <button 
            onClick={startNewGame}
            className="flex items-center gap-2 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-400 px-4 py-2 rounded-xl font-bold transition-all text-sm border border-indigo-500/30"
          >
            <ChevronRight size={18} />
            Next Puzzle
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Game Board */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="bg-slate-900 p-4 md:p-8 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden w-full">
            {isGameComplete && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                <div className="bg-yellow-900/30 p-4 rounded-full mb-4 border border-yellow-500/50">
                  <Trophy className="w-12 h-12 text-yellow-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-100 mb-2">Genius!</h2>
                <p className="text-slate-400 mb-6 font-medium">Puzzle solved in {formatTime(timer)}</p>
                <button 
                  onClick={startNewGame}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-900/50 transition-all transform hover:-translate-y-1"
                >
                  Get Next Puzzle
                </button>
              </div>
            )}

            <div 
              className={`grid gap-1.5 md:gap-2 mx-auto`} 
              style={{ 
                gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))`,
                maxWidth: '600px'
              }}
            >
              {grid.map((row, r) => (
                row.map((cell, c) => (
                  <div key={cell.id} className="aspect-square">
                    {cell.type === 'empty' ? (
                      <div className="w-full h-full bg-slate-800/20 rounded-lg" />
                    ) : (
                      <div 
                        onClick={() => handleCellClick(r, c)}
                        className={`
                          w-full h-full flex items-center justify-center rounded-lg text-xs md:text-base font-bold transition-all duration-200 cursor-pointer
                          ${cell.isStatic ? 'bg-slate-800/50 text-slate-500 cursor-default' : 'bg-slate-900 shadow-sm border-2'}
                          ${!cell.isStatic && cell.userInput === '' ? 'border-slate-800 hover:border-indigo-500/50' : ''}
                          ${!cell.isStatic && cell.userInput !== '' ? 'border-indigo-500 text-indigo-400' : ''}
                          ${selectedCell?.r === r && selectedCell?.c === c ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-900/20 scale-105 z-10' : ''}
                          ${cell.type === 'operator' || cell.type === 'equals' ? 'bg-slate-800 text-indigo-400 border-none cursor-default' : ''}
                          ${cell.type === 'result' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800 cursor-default' : ''}
                          ${showFeedback && !cell.isStatic && cell.userInput !== '' && cell.userInput !== cell.value ? 'border-rose-500 bg-rose-950 text-rose-400 animate-pulse' : ''}
                        `}
                      >
                        <span className="math-font">{cell.userInput || (cell.type === 'operator' || cell.type === 'equals' || cell.type === 'result' || cell.isStatic ? cell.value : '')}</span>
                      </div>
                    )}
                  </div>
                ))
              ))}
            </div>
          </div>

          <div className="mt-8 flex gap-4 w-full justify-center">
             <button 
              onClick={validatePuzzle}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/50"
            >
              <CheckCircle2 size={20} />
              Check Solution
            </button>
            <button 
              onClick={revealHint}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-6 py-3 rounded-xl font-bold transition-all shadow-sm"
            >
              <Lightbulb size={20} className="text-amber-500" />
              Hint
            </button>
          </div>
        </div>

        {/* Right: Number Pool */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-800">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <MousePointer2 className="text-indigo-400" size={20} />
              Number Pool
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">Select an empty slot in the grid, then pick a number below.</p>
            <div 
                className="grid gap-1.5 md:gap-2"
                style={{ 
                    gridTemplateColumns: `repeat(4, minmax(0, 1fr))`
                }}
            >
              {numberPool.map((item) => (
                <button
                  key={item.id}
                  disabled={item.isUsed || !selectedCell}
                  onClick={() => handlePoolNumberClick(item)}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg font-mono font-bold text-xs md:text-base transition-all border-2
                    ${item.isUsed 
                      ? 'bg-slate-800 border-slate-800 text-slate-700 cursor-not-allowed opacity-30' 
                      : selectedCell 
                        ? 'bg-slate-900 border-slate-700 text-indigo-400 hover:border-indigo-500 hover:scale-105 shadow-sm active:scale-95'
                        : 'bg-slate-800 border-slate-800 text-slate-600 cursor-not-allowed'
                    }
                  `}
                >
                  {item.value}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={startNewGame}
            className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-slate-100 py-4 rounded-2xl font-bold transition-all border border-slate-700"
          >
            <RotateCcw size={20} />
            Reset Current Puzzle
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-slate-600 text-sm font-medium flex items-center gap-4">
        <span>Math Crossword Master © 2024</span>
        <div className="w-1 h-1 bg-slate-800 rounded-full" />
        <a href="#" className="hover:text-indigo-400 flex items-center gap-1 transition-colors">
          <Github size={16} />
          Source
        </a>
      </footer>
    </div>
  );
};

export default App;
