// ============================================================
// BlockMind — Grid Logic
// ============================================================

import type { Grid, GamePiece, Cell, PlacedBlock, PlacementResult } from "./types";

export const GRID_SIZE = 8;

/** Create an empty 8×8 grid. */
export function createEmptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null)
  );
}

/** Get cells occupied by a piece at a given position. */
export function getPieceCells(piece: GamePiece, row: number, col: number): Cell[] {
  const cells: Cell[] = [];
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c] !== null) {
        cells.push({ row: row + r, col: col + c });
      }
    }
  }
  return cells;
}

/** Check if a piece can be placed at a given position on the grid. */
export function canPlacePiece(grid: Grid, piece: GamePiece, row: number, col: number): boolean {
  const cells = getPieceCells(piece, row, col);
  for (const cell of cells) {
    if (cell.row < 0 || cell.row >= GRID_SIZE) return false;
    if (cell.col < 0 || cell.col >= GRID_SIZE) return false;
    if (grid[cell.row][cell.col] !== null) return false;
  }
  return true;
}

/** Place a piece on the grid (mutates a copy). Returns the new grid and placed blocks. */
export function placePiece(
  grid: Grid,
  piece: GamePiece,
  row: number,
  col: number
): { grid: Grid; placedBlocks: PlacedBlock[] } {
  const newGrid = grid.map((r) => [...r]);
  const placedBlocks: PlacedBlock[] = [];
  const cells = getPieceCells(piece, row, col);
  for (const cell of cells) {
    newGrid[cell.row][cell.col] = piece.color;
    placedBlocks.push({ row: cell.row, col: cell.col, color: piece.color });
  }
  return { grid: newGrid, placedBlocks };
}

/** Find full rows and columns. Returns indices of lines to clear. */
export function findFullLines(grid: Grid): { rows: number[]; cols: number[] } {
  const fullRows: number[] = [];
  const fullCols: number[] = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r].every((cell) => cell !== null)) {
      fullRows.push(r);
    }
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    if (grid.every((row) => row[c] !== null)) {
      fullCols.push(c);
    }
  }

  return { rows: fullRows, cols: fullCols };
}

/** Clear full lines from the grid. Returns the new grid and count of cells cleared. */
export function clearLines(
  grid: Grid,
  rows: number[],
  cols: number[]
): { grid: Grid; cellsCleared: number } {
  const newGrid = grid.map((r) => [...r]);
  let cellsCleared = 0;

  // Clear rows
  for (const r of rows) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (newGrid[r][c] !== null) cellsCleared++;
      newGrid[r][c] = null;
    }
  }
  // Clear columns
  for (const c of cols) {
    for (let r = 0; r < GRID_SIZE; r++) {
      if (newGrid[r][c] !== null) cellsCleared++;
      newGrid[r][c] = null;
    }
  }

  return { grid: newGrid, cellsCleared };
}

/** Calculate points for clearing lines. */
export function calculatePoints(linesCleared: number, combo: number, level: number): number {
  if (linesCleared === 0) return 0;
  // Base points per line
  const basePoints = [0, 10, 30, 60, 100]; // 0, 1, 2, 3, 4 lines
  const base = basePoints[Math.min(linesCleared, 4)];
  // Combo multiplier
  const comboMult = 1 + combo * 0.5;
  // Level multiplier
  const levelMult = 1 + (level - 1) * 0.1;
  return Math.round(base * comboMult * levelMult);
}

/** Get board fill percentage (0-100). */
export function getBoardFillPct(grid: Grid): number {
  let filled = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] !== null) filled++;
    }
  }
  return (filled / (GRID_SIZE * GRID_SIZE)) * 100;
}

/** Count empty cells on the grid. */
export function countEmptyCells(grid: Grid): number {
  let count = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) count++;
    }
  }
  return count;
}

/** Check if game is over: none of the given pieces can be placed anywhere. */
export function isGameOver(grid: Grid, pieces: GamePiece[]): boolean {
  if (pieces.length === 0) return true;
  for (const piece of pieces) {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (canPlacePiece(grid, piece, r, c)) return false;
      }
    }
  }
  return true;
}

/** Find all valid positions for a piece on the grid. */
export function findValidPositions(
  grid: Grid,
  piece: GamePiece
): Cell[] {
  const positions: Cell[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (canPlacePiece(grid, piece, r, c)) {
        positions.push({ row: r, col: c });
      }
    }
  }
  return positions;
}

/** Find the best (lowest) valid row for a piece in a given column. */
export function findDropPosition(
  grid: Grid,
  piece: GamePiece,
  col: number
): number | null {
  for (let r = GRID_SIZE - piece.shape.length; r >= 0; r--) {
    if (canPlacePiece(grid, piece, r, col)) {
      return r;
    }
  }
  return null;
}

/** Generate a starting board for daily challenges (scattered blocks). */
export function generateDailyBoard(seed: number): Grid {
  const grid = createEmptyGrid();
  // Use seed to deterministically place some blocks
  let s = seed;
  const nextRand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };

  // Place 5-12 random blocks as a starting challenge
  const blockCount = 5 + Math.floor(nextRand() * 8);
  const colors = ["#E53E3E", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6"];
  for (let i = 0; i < blockCount; i++) {
    const r = Math.floor(nextRand() * GRID_SIZE);
    const c = Math.floor(nextRand() * GRID_SIZE);
    if (grid[r][c] === null) {
      grid[r][c] = colors[Math.floor(nextRand() * colors.length)];
    }
  }
  return grid;
}
