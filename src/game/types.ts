// ============================================================
// BlockMind — Core Game Types
// ============================================================

/** 8×8 grid. Each cell is either null (empty) or a color string. */
export type Grid = (string | null)[][];

/** A single cell coordinate. */
export interface Cell {
  row: number;
  col: number;
}

/** A placed block on the grid (for animation tracking). */
export interface PlacedBlock {
  row: number;
  col: number;
  color: string;
}

/** A game piece shape: 2D matrix of color strings (non-null = filled). */
export type PieceShape = (string | null)[][];

/** Piece ID — stable identifier across rotations. */
export type PieceId = string;

/** A game piece with all its metadata. */
export interface GamePiece {
  id: PieceId;
  shape: PieceShape;
  color: string;
  name: string;
}

/** Placement result — whether a placement succeeded and what lines cleared. */
export interface PlacementResult {
  valid: boolean;
  linesCleared: number;
  clearedRows: number[];
  clearedCols: number[];
  comboMultiplier: number;
  pointsAwarded: number;
}

/** Performance signals tracked by the adaptive difficulty engine. */
export interface PerformanceSignals {
  clearRate: number; // % of lines cleared vs placed
  avgTimeToPlace: number; // ms average
  nearDeathCount: number; // boards > 80% full
  streakLength: number; // consecutive clears without dead placement
  boardFillPct: number; // current board fill percentage
  placementsSinceClear: number; // placements since last clear
}

/** Difficulty profile stored per user. */
export interface DifficultyProfile {
  skillRating: number; // 0-100, higher = harder pieces
  avgClearRate: number;
  avgTimeToPlace: number;
  gamesPlayed: number;
}

/** Game mode types. */
export type GameMode = "endless" | "daily" | "zen";

/** Full game state. */
export interface GameState {
  grid: Grid;
  currentPiece: GamePiece | null;
  pieceQueue: GamePiece[];
  score: number;
  level: number;
  combo: number;
  streak: number;
  bestStreak: number;
  linesCleared: number;
  totalLinesCleared: number;
  isGameOver: boolean;
  gameMode: GameMode;
  // Performance tracking
  placements: number;
  clears: number;
  nearDeathBoards: number;
  placementTimes: number[];
  lastPlacementTime: number;
  // Animation state
  clearingLines: { rows: number[]; cols: number[] } | null;
  lastPlacedBlocks: PlacedBlock[];
  showCombo: number | null;
  // Daily challenge
  dailyChallengeId?: string;
  dailyPieceSequence?: GamePiece[];
  dailyPieceIndex?: number;
}

/** Game action types for state transitions. */
export type GameAction =
  | { type: "PLACE_PIECE"; piece: GamePiece; row: number; col: number }
  | { type: "ROTATE_CW" }
  | { type: "ROTATE_CCW" }
  | { type: "SELECT_PIECE"; index: number }
  | { type: "NEXT_TURN" }
  | { type: "GAME_OVER" }
  | { type: "RESET"; mode: GameMode; dailyId?: string }
  | { type: "SET_CLEARING_LINES"; rows: number[]; cols: number[] }
  | { type: "CLEAR_ANIMATION_DONE" }
  | { type: "SHOW_COMBO"; value: number }
  | { type: "HIDE_COMBO" }
  | { type: "SET_PIECE_QUEUE"; pieces: GamePiece[] };

/** Ghost piece position for preview. */
export interface GhostPosition {
  row: number;
  col: number;
  valid: boolean;
}
