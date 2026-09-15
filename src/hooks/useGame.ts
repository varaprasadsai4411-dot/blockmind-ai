// ============================================================
// BlockMind — Game State Hook
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  GameState,
  GamePiece,
  GameMode,
  DifficultyProfile,
  PerformanceSignals,
  Grid,
  PieceShape,
} from "@/game/types";
import {
  createEmptyGrid,
  canPlacePiece,
  placePiece,
  findFullLines,
  getBoardFillPct,
  isGameOver,
  generateDailyBoard,
  GRID_SIZE,
} from "@/game/grid";
import {
  rotatePieceCW,
  rotatePieceCCW,
  generatePieceBatch,
  generateSeededPiece,
} from "@/game/pieces";
import {
  calculateMoveScore,
  calculateLevel,
  computePerformanceSignals,
  updateDifficultyProfile,
  createDefaultProfile,
  getDailyChallengeSeed,
} from "@/game/scoring";

const QUEUE_SIZE = 3;

/** Snapshot of state needed for undo. */
interface UndoSnapshot {
  grid: Grid;
  pieceQueue: GamePiece[];
  selectedQueueIndex: number;
  selectedRotation: PieceShape | null;
  score: number;
  level: number;
  combo: number;
  streak: number;
  bestStreak: number;
  linesCleared: number;
  totalLinesCleared: number;
  placements: number;
  clears: number;
  nearDeathBoards: number;
  placementTimes: number[];
  lastPlacementTime: number;
  dailyPieceIndex: number;
}

function createInitialState(mode: GameMode, _dailyId?: string): GameState {
  return {
    grid: createEmptyGrid(),
    currentPiece: null,
    pieceQueue: [],
    score: 0,
    level: 1,
    combo: 0,
    streak: 0,
    bestStreak: 0,
    linesCleared: 0,
    totalLinesCleared: 0,
    isGameOver: false,
    gameMode: mode,
    placements: 0,
    clears: 0,
    nearDeathBoards: 0,
    placementTimes: [],
    lastPlacementTime: Date.now(),
    clearingLines: null,
    lastPlacedBlocks: [],
    showCombo: null,
    dailyChallengeId: undefined,
    dailyPieceSequence: undefined,
    dailyPieceIndex: 0,
  };
}

function generateDailyPieces(seed: number, count: number): GamePiece[] {
  const pieces: GamePiece[] = [];
  for (let i = 0; i < count; i++) {
    pieces.push(generateSeededPiece(seed + i * 7919));
  }
  return pieces;
}

/** Deep-clone a GamePiece for undo snapshots. */
function clonePiece(p: GamePiece): GamePiece {
  return { ...p, shape: p.shape.map((r) => [...r]) };
}

/** Smart snap: find the nearest valid position for a piece to the tapped cell.
 *  Searches outward in a spiral from (row, col) up to maxDist cells away. */
function findNearestValidPosition(
  grid: Grid,
  piece: GamePiece,
  row: number,
  col: number,
  maxDist = 4,
): { row: number; col: number } | null {
  // First, try the exact position
  if (canPlacePiece(grid, piece, row, col)) {
    return { row, col };
  }
  // Search outward in expanding squares
  for (let dist = 1; dist <= maxDist; dist++) {
    let bestDist = Infinity;
    let bestPos: { row: number; col: number } | null = null;
    for (let dr = -dist; dr <= dist; dr++) {
      for (let dc = -dist; dc <= dist; dc++) {
        if (Math.abs(dr) !== dist && Math.abs(dc) !== dist) continue; // only perimeter
        const nr = row + dr;
        const nc = col + dc;
        if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue;
        if (canPlacePiece(grid, piece, nr, nc)) {
          const d = Math.abs(dr) + Math.abs(dc);
          if (d < bestDist) {
            bestDist = d;
            bestPos = { row: nr, col: nc };
          }
        }
      }
    }
    if (bestPos) return bestPos;
  }
  return null;
}

export interface UseGameReturn {
  state: GameState;
  /** Which queue index is currently selected for placement (0, 1, or 2). */
  selectedQueueIndex: number;
  /** The selected piece (possibly rotated). */
  getSelectedPiece: () => GamePiece | null;
  /** Select a queue piece to be the active piece to place. */
  selectQueuePiece: (index: number) => void;
  /** Rotate the currently selected piece clockwise. */
  rotateSelectedCW: () => void;
  /** Rotate the currently selected piece counter-clockwise. */
  rotateSelectedCCW: () => void;
  /** Place the selected piece at (row, col) with smart snapping.
   *  Returns true on success. */
  placeAtCell: (row: number, col: number) => boolean;
  /** Reset / restart the game. */
  resetGame: (mode?: GameMode) => void;
  /** Undo the last placement. */
  undoMove: () => boolean;
  canUndo: boolean;
  difficultyProfile: DifficultyProfile;
  performanceSignals: PerformanceSignals;
  timeUntilNextDaily: number;
}

export function useGame(
  initialMode: GameMode = "endless",
  savedProfile?: DifficultyProfile,
): UseGameReturn {
  const [state, setState] = useState<GameState>(() =>
    createInitialState(initialMode),
  );
  const [profile, setProfile] = useState<DifficultyProfile>(
    savedProfile || createDefaultProfile(),
  );
  const [timeUntilNextDaily, setTimeUntilNextDaily] = useState(0);
  const [selectedQueueIndex, setSelectedQueueIndex] = useState(0);
  /** Rotation override — null means use the piece's default (index 0) shape. */
  const [selectedRotation, setSelectedRotation] = useState<PieceShape | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;
  const selectedRotationRef = useRef(selectedRotation);
  selectedRotationRef.current = selectedRotation;

  // Undo stack — last 5 snapshots
  const undoStackRef = useRef<UndoSnapshot[]>([]);
  const [canUndo, setCanUndo] = useState(false);

  // Countdown timer for daily challenge
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1,
          0,
          0,
          0,
          0,
        ),
      );
      setTimeUntilNextDaily(tomorrow.getTime() - now.getTime());
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize game on mount
  useEffect(() => {
    initializeGame(initialMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeGame = useCallback(
    (mode: GameMode) => {
      undoStackRef.current = [];
      setCanUndo(false);
      setSelectedQueueIndex(0);
      setSelectedRotation(null);

      setState((prev) => {
        const newState = createInitialState(mode);

        if (mode === "daily") {
          const seed = getDailyChallengeSeed(new Date());
          const board = generateDailyBoard(seed);
          const dailyPieces = generateDailyPieces(seed, 20);
          newState.grid = board;
          newState.dailyPieceSequence = dailyPieces;
          newState.dailyPieceIndex = 0;
          newState.pieceQueue = dailyPieces.slice(0, QUEUE_SIZE);
        } else {
          const skillRating = profile.skillRating;
          const pieces = generatePieceBatch(QUEUE_SIZE, skillRating);
          newState.pieceQueue = pieces;
        }

        newState.lastPlacementTime = Date.now();
        return newState;
      });
    },
    [profile.skillRating],
  );

  /** Get the currently selected piece with any rotation override applied. */
  const getSelectedPiece = useCallback((): GamePiece | null => {
    const s = stateRef.current;
    const piece = s.pieceQueue[selectedQueueIndex];
    if (!piece) return null;
    if (selectedRotationRef.current) {
      return { ...piece, shape: selectedRotationRef.current };
    }
    return piece;
  }, [selectedQueueIndex]);

  const selectQueuePiece = useCallback(
    (index: number) => {
      setState((prev) => {
        if (index < 0 || index >= prev.pieceQueue.length) return prev;
        if (prev.isGameOver) return prev;
        return { ...prev };
      });
      setSelectedQueueIndex(index);
      setSelectedRotation(null);
    },
    [],
  );

  const rotateSelectedCW = useCallback(() => {
    const piece = getSelectedPiece();
    if (!piece) return;
    const rotated = rotatePieceCW(piece);
    setSelectedRotation(rotated.shape);
  }, [getSelectedPiece]);

  const rotateSelectedCCW = useCallback(() => {
    const piece = getSelectedPiece();
    if (!piece) return;
    const rotated = rotatePieceCCW(piece);
    setSelectedRotation(rotated.shape);
  }, [getSelectedPiece]);

  const placeAtCell = useCallback(
    (row: number, col: number): boolean => {
      let success = false;
      setState((prev) => {
        if (prev.isGameOver || prev.clearingLines) return prev;
        const pieceToPlace = (() => {
          const base = prev.pieceQueue[selectedQueueIndex];
          if (!base) return null;
          if (selectedRotationRef.current) {
            return { ...base, shape: selectedRotationRef.current };
          }
          return base;
        })();
        if (!pieceToPlace) return prev;

        // Smart snapping: find the nearest valid position
        const snapped = findNearestValidPosition(
          prev.grid,
          pieceToPlace,
          row,
          col,
        );
        if (!snapped) return prev;

        const now = Date.now();
        const timeSinceLast = now - prev.lastPlacementTime;

        // Save undo snapshot (before placing)
        const snapshot: UndoSnapshot = {
          grid: prev.grid.map((r) => [...r]),
          pieceQueue: prev.pieceQueue.map(clonePiece),
          selectedQueueIndex,
          selectedRotation: selectedRotationRef.current
            ? selectedRotationRef.current.map((r) => [...r])
            : null,
          score: prev.score,
          level: prev.level,
          combo: prev.combo,
          streak: prev.streak,
          bestStreak: prev.bestStreak,
          linesCleared: prev.linesCleared,
          totalLinesCleared: prev.totalLinesCleared,
          placements: prev.placements,
          clears: prev.clears,
          nearDeathBoards: prev.nearDeathBoards,
          placementTimes: [...prev.placementTimes],
          lastPlacementTime: prev.lastPlacementTime,
          dailyPieceIndex: prev.dailyPieceIndex || 0,
        };
        const stack = [...undoStackRef.current, snapshot].slice(-5);
        undoStackRef.current = stack;

        // Place the piece at the snapped position
        const { grid: newGrid, placedBlocks } = placePiece(
          prev.grid,
          pieceToPlace,
          snapped.row,
          snapped.col,
        );

        // Check for full lines
        const { rows: fullRows, cols: fullCols } = findFullLines(newGrid);
        const linesCleared = fullRows.length + fullCols.length;

        const newCombo =
          linesCleared > 0 ? prev.combo + linesCleared - 1 : 0;
        const newStreak = linesCleared > 0 ? prev.streak + 1 : 0;
        const points = calculateMoveScore(
          linesCleared,
          prev.combo,
          prev.level,
          newStreak,
        );

        const newTotalLines = prev.totalLinesCleared + linesCleared;
        const newLevel = calculateLevel(newTotalLines);

        // Grid after clearing lines
        let finalGrid = newGrid;
        if (linesCleared > 0) {
          const cleared = newGrid.map((r) => [...r]);
          for (const r of fullRows) {
            for (let c = 0; c < GRID_SIZE; c++) cleared[r][c] = null;
          }
          for (const c of fullCols) {
            for (let r = 0; r < GRID_SIZE; r++) cleared[r][c] = null;
          }
          finalGrid = cleared;
        }

        const newPlacements = prev.placements + 1;
        const newClears = prev.clears + (linesCleared > 0 ? 1 : 0);
        const boardFill = getBoardFillPct(finalGrid);
        const newNearDeath =
          boardFill > 80 ? prev.nearDeathBoards + 1 : prev.nearDeathBoards;

        // Remove the placed piece from queue and advance selection
        const newQueue = prev.pieceQueue.filter((_, i) => i !== selectedQueueIndex);
        let nextSelectedIdx = selectedQueueIndex;
        if (nextSelectedIdx >= newQueue.length) {
          nextSelectedIdx = Math.max(0, newQueue.length - 1);
        }

        // Refill queue for endless/daily mode
        let filledQueue = [...newQueue];
        if (prev.gameMode === "daily" && prev.dailyPieceSequence) {
          const nextIdx = (prev.dailyPieceIndex || 0) + 1;
          const startIdx = nextIdx + newQueue.length;
          const needed = QUEUE_SIZE - filledQueue.length;
          for (let i = 0; i < needed && startIdx + i < (prev.dailyPieceSequence?.length || 0); i++) {
            filledQueue.push(prev.dailyPieceSequence[startIdx + i]);
          }
        } else {
          if (filledQueue.length < QUEUE_SIZE) {
            const signals = computePerformanceSignals({
              placements: newPlacements,
              clears: newClears,
              nearDeathBoards: newNearDeath,
              streakLength: newStreak,
              boardFillPct: boardFill,
              placementTimes: [...prev.placementTimes, timeSinceLast],
              placementsSinceClear: linesCleared > 0 ? 0 : prev.placements,
            });
            const updatedProfile = updateDifficultyProfile(profile, signals);
            const needed = QUEUE_SIZE - filledQueue.length;
            filledQueue = [
              ...filledQueue,
              ...generatePieceBatch(needed, updatedProfile.skillRating),
            ];
          }
        }

        // Clamp selected index
        if (nextSelectedIdx >= filledQueue.length) {
          nextSelectedIdx = Math.max(0, filledQueue.length - 1);
        }

        // Check game over — can any remaining piece fit anywhere on the final grid?
        let gameOver =
          prev.gameMode !== "zen" && isGameOver(finalGrid, filledQueue);

        // Zen mode mercy: clear bottom 2 rows
        if (prev.gameMode === "zen" && gameOver) {
          const zenGrid = finalGrid.map((r) => [...r]);
          for (let r = 6; r < 8; r++) {
            for (let c = 0; c < 8; c++) zenGrid[r][c] = null;
          }
          finalGrid = zenGrid;
          gameOver = false;
        }

        const showCombo = linesCleared >= 2 ? linesCleared : null;

        success = true;

        return {
          ...prev,
          grid: finalGrid,
          currentPiece: null,
          pieceQueue: filledQueue,
          score: prev.score + points,
          level: newLevel,
          combo: newCombo,
          streak: newStreak,
          bestStreak: Math.max(prev.bestStreak, newStreak),
          linesCleared: prev.linesCleared + linesCleared,
          totalLinesCleared: newTotalLines,
          isGameOver: gameOver,
          placements: newPlacements,
          clears: newClears,
          nearDeathBoards: newNearDeath,
          placementTimes: [...prev.placementTimes, timeSinceLast],
          lastPlacementTime: now,
          clearingLines:
            linesCleared > 0 ? { rows: fullRows, cols: fullCols } : null,
          lastPlacedBlocks: placedBlocks,
          showCombo,
          dailyPieceIndex:
            prev.gameMode === "daily"
              ? (prev.dailyPieceIndex || 0) + 1
              : prev.dailyPieceIndex,
        };
      });
      if (success) {
        setSelectedRotation(null);
        setCanUndo(true);
      }
      return success;
    },
    [selectedQueueIndex, profile],
  );

  // Auto-clear clearingLines after animation duration
  const clearClearingLinesRef = useRef<() => void>(() => {});
  clearClearingLinesRef.current = () => {
    setState((prev) => {
      if (!prev.clearingLines) return prev;
      return { ...prev, clearingLines: null };
    });
  };

  useEffect(() => {
    if (state.clearingLines) {
      const timer = setTimeout(() => clearClearingLinesRef.current(), 600);
      return () => clearTimeout(timer);
    }
  }, [state.clearingLines]);

  const undoMove = useCallback((): boolean => {
    const snapshot = undoStackRef.current.pop();
    if (!snapshot) return false;

    setState((prev) => ({
      ...prev,
      grid: snapshot.grid,
      currentPiece: null,
      pieceQueue: snapshot.pieceQueue,
      score: snapshot.score,
      level: snapshot.level,
      combo: snapshot.combo,
      streak: snapshot.streak,
      bestStreak: snapshot.bestStreak,
      linesCleared: snapshot.linesCleared,
      totalLinesCleared: snapshot.totalLinesCleared,
      placements: snapshot.placements,
      clears: snapshot.clears,
      nearDeathBoards: snapshot.nearDeathBoards,
      placementTimes: snapshot.placementTimes,
      lastPlacementTime: snapshot.lastPlacementTime,
      dailyPieceIndex: snapshot.dailyPieceIndex,
      isGameOver: false,
      clearingLines: null,
      lastPlacedBlocks: [],
      showCombo: null,
    }));
    setSelectedQueueIndex(snapshot.selectedQueueIndex);
    setSelectedRotation(snapshot.selectedRotation);
    setCanUndo(undoStackRef.current.length > 0);
    return true;
  }, []);

  const resetGame = useCallback(
    (mode?: GameMode) => {
      const targetMode = mode || state.gameMode;
      undoStackRef.current = [];
      setCanUndo(false);
      setSelectedQueueIndex(0);
      setSelectedRotation(null);

      setState(() => {
        const newState = createInitialState(targetMode);

        if (targetMode === "daily") {
          const seed = getDailyChallengeSeed(new Date());
          const board = generateDailyBoard(seed);
          const dailyPieces = generateDailyPieces(seed, 20);
          newState.grid = board;
          newState.dailyPieceSequence = dailyPieces;
          newState.dailyPieceIndex = 0;
          newState.pieceQueue = dailyPieces.slice(0, QUEUE_SIZE);
        } else {
          const pieces = generatePieceBatch(QUEUE_SIZE, profile.skillRating);
          newState.pieceQueue = pieces;
        }

        newState.lastPlacementTime = Date.now();
        return newState;
      });
    },
    [state.gameMode, profile.skillRating],
  );

  // Compute performance signals
  const performanceSignals: PerformanceSignals = computePerformanceSignals({
    placements: state.placements,
    clears: state.clears,
    nearDeathBoards: state.nearDeathBoards,
    streakLength: state.streak,
    boardFillPct: getBoardFillPct(state.grid),
    placementTimes: state.placementTimes,
    placementsSinceClear: state.placements,
  });

  return {
    state,
    selectedQueueIndex,
    getSelectedPiece,
    selectQueuePiece,
    rotateSelectedCW,
    rotateSelectedCCW,
    placeAtCell,
    resetGame,
    undoMove,
    canUndo,
    difficultyProfile: profile,
    performanceSignals,
    timeUntilNextDaily,
  };
}
