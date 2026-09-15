// ============================================================
// BlockMind — Game Screen
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameMode, Cell } from "@/game/types";
import { useGame } from "@/hooks/useGame";
import { api } from "@/convex/_generated/api";
import { useMutation, useConvexAuth } from "convex/react";
import { GameBoard } from "./GameBoard";
import { PiecePreview } from "./PiecePreview";
import { ScoreDisplay } from "./ScoreDisplay";
import { GameControls } from "./GameControls";
import { GameOverScreen, generateCoachTip } from "./GameOverScreen";
import { getBoardFillPct, canPlacePiece } from "@/game/grid";
import { ArrowLeft, Clock, Volume2, VolumeX, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCountdown } from "@/game/scoring";
import {
  isMuted,
  setMuted,
  playSelect,
  playPlace,
  playLineClear,
  playComboClear,
  playGameOver,
  playUndo,
  playReset,
} from "@/game/sounds";

interface GameScreenProps {
  mode: GameMode;
  onBack: () => void;
}

export function GameScreen({ mode, onBack }: GameScreenProps) {
  const {
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
    difficultyProfile,
    performanceSignals,
    timeUntilNextDaily,
  } = useGame(mode);

  const { isAuthenticated } = useConvexAuth();
  const saveGameResults = useMutation(api.game.saveGameResults);
  const savedRef = useRef(false);
  const [muted, setMutedState] = useState(isMuted());
  const [hoveredCell, setHoveredCell] = useState<Cell | null>(null);

  const selectedPiece = getSelectedPiece();
  const boardFill = getBoardFillPct(state.grid);

  // Whether the current hovered cell is a valid placement
  const isValidHover = useMemo(() => {
    if (!selectedPiece || !hoveredCell) return false;
    return canPlacePiece(state.grid, selectedPiece, hoveredCell.row, hoveredCell.col);
  }, [selectedPiece, hoveredCell, state.grid]);

  // Save game results on game over (endless & daily only)
  useEffect(() => {
    if (
      state.isGameOver &&
      !savedRef.current &&
      isAuthenticated &&
      mode !== "zen"
    ) {
      savedRef.current = true;
      saveGameResults({
        score: state.score,
        level: state.level,
        linesCleared: state.totalLinesCleared,
        streak: state.streak,
        bestStreak: state.bestStreak,
        gameMode: mode,
        skillRating: difficultyProfile.skillRating,
        avgClearRate: performanceSignals.clearRate,
        avgTimeToPlace: performanceSignals.avgTimeToPlace,
      }).catch(() => {
        savedRef.current = false;
      });
    }
  }, [
    state.isGameOver,
    state.score,
    state.level,
    state.totalLinesCleared,
    state.streak,
    state.bestStreak,
    mode,
    difficultyProfile.skillRating,
    performanceSignals.clearRate,
    performanceSignals.avgTimeToPlace,
    isAuthenticated,
    saveGameResults,
  ]);

  useEffect(() => {
    if (!state.isGameOver) savedRef.current = false;
  }, [state.isGameOver]);

  // Sound effects
  const prevLinesRef = useRef(state.totalLinesCleared);
  const gameOverPlayedRef = useRef(false);

  useEffect(() => {
    if (state.isGameOver && !gameOverPlayedRef.current) {
      gameOverPlayedRef.current = true;
      playGameOver();
    }
    if (!state.isGameOver) gameOverPlayedRef.current = false;
  }, [state.isGameOver]);

  useEffect(() => {
    if (state.showCombo && state.showCombo >= 2) {
      playComboClear(state.showCombo);
    } else if (state.totalLinesCleared > prevLinesRef.current) {
      playLineClear();
    }
    prevLinesRef.current = state.totalLinesCleared;
  }, [state.showCombo, state.totalLinesCleared]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.isGameOver) return;
      switch (e.key) {
        case "r":
        case "R":
          rotateSelectedCW();
          playSelect();
          break;
        case "e":
        case "E":
          rotateSelectedCCW();
          playSelect();
          break;
        case "1":
          selectQueuePiece(0);
          playSelect();
          break;
        case "2":
          selectQueuePiece(1);
          playSelect();
          break;
        case "3":
          selectQueuePiece(2);
          playSelect();
          break;
        case "z":
        case "Z":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (undoMove()) playUndo();
          }
          break;
        case "Backspace":
          if (undoMove()) playUndo();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.isGameOver, rotateSelectedCW, rotateSelectedCCW, selectQueuePiece, undoMove]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (state.isGameOver) return;
      const placed = placeAtCell(row, col);
      if (placed) {
        playPlace();
      }
    },
    [state.isGameOver, placeAtCell],
  );

  const handleHoverCell = useCallback(
    (row: number, col: number) => {
      setHoveredCell({ row, col });
    },
    [],
  );

  const handleHoverEnd = useCallback(() => {
    setHoveredCell(null);
  }, []);

  const handleSelectPiece = useCallback(
    (index: number) => {
      selectQueuePiece(index);
      playSelect();
    },
    [selectQueuePiece],
  );

  const handleRotateCW = useCallback(() => {
    rotateSelectedCW();
    playSelect();
  }, [rotateSelectedCW]);

  const handleRotateCCW = useCallback(() => {
    rotateSelectedCCW();
    playSelect();
  }, [rotateSelectedCCW]);

  const handleUndo = useCallback(() => {
    if (undoMove()) playUndo();
  }, [undoMove]);

  const handleReset = useCallback(() => {
    playReset();
    resetGame();
  }, [resetGame]);

  const handlePlayAgain = useCallback(() => {
    playReset();
    resetGame();
  }, [resetGame]);

  const handleModeSelect = useCallback(() => {
    onBack();
  }, [onBack]);

  const toggleMute = useCallback(() => {
    const next = !isMuted();
    setMuted(next);
    setMutedState(next);
  }, []);

  const coachTip = state.isGameOver
    ? generateCoachTip({
        score: state.score,
        linesCleared: state.totalLinesCleared,
        bestStreak: state.bestStreak,
        level: state.level,
        gameMode: mode,
      })
    : undefined;

  return (
    <div className="h-dvh min-h-[100dvh] flex flex-col overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-slate-300 hover:text-white hover:bg-white/10 -ml-2 text-xs sm:text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          {mode === "daily" && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-400 border border-amber-500/20">
              <Clock className="w-3 h-3" />
              {formatCountdown(timeUntilNextDaily)}
            </div>
          )}
          <div className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-slate-300 capitalize border border-white/10">
            {mode === "zen"
              ? "☀️ Zen"
              : mode === "daily"
                ? "📅 Daily"
                : "♾️ Endless"}
          </div>
          <button
            onClick={toggleMute}
            className={cn(
              "flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full",
              "border border-white/10 transition-all",
              muted
                ? "bg-white/5 text-slate-500 hover:bg-white/10"
                : "bg-white/10 text-slate-300 hover:bg-white/20",
            )}
            aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>

      {/* Board fill indicator */}
      <div className="px-4 mb-1.5 shrink-0">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
          <span>Board Fill</span>
          <span>{Math.round(boardFill)}%</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full transition-colors duration-500",
              boardFill > 80
                ? "bg-red-500"
                : boardFill > 60
                  ? "bg-amber-500"
                  : "bg-emerald-500",
            )}
            animate={{ width: `${Math.min(boardFill, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Score display */}
      <div className="px-4 mb-2 relative shrink-0">
        <ScoreDisplay
          score={state.score}
          level={state.level}
          combo={state.combo}
          streak={state.streak}
          showCombo={state.showCombo}
        />
      </div>

      {/* Game board — flex-1 fills remaining space, board scales to fit width */}
      <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 min-h-0">
        <div className="w-full max-w-[420px]">
          <GameBoard
            grid={state.grid}
            ghostPiece={selectedPiece}
            hoveredCell={hoveredCell}
            isValidHover={isValidHover}
            isGameOver={state.isGameOver}
            clearingLines={state.clearingLines}
            lastPlacedBlocks={state.lastPlacedBlocks}
            onCellClick={handleCellClick}
            onHoverCell={handleHoverCell}
            onHoverEnd={handleHoverEnd}
          />
        </div>

        {/* Selected piece instruction */}
        <div className="mt-2 sm:mt-3 w-full max-w-[420px]">
          {selectedPiece ? (
            <div className="flex items-center justify-center gap-1.5 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Tap the board to place
              <ChevronRight className="w-3 h-3" />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Select a piece below
            </div>
          )}

          {/* Piece queue */}
          <PiecePreview
            pieces={state.pieceQueue}
            selectedIndex={selectedQueueIndex}
            onSelect={handleSelectPiece}
            disabled={state.isGameOver}
          />
        </div>

        {/* Controls */}
        <div className="mt-2 sm:mt-3 pb-2 sm:pb-4 shrink-0">
          <GameControls
            onRotateCW={handleRotateCW}
            onRotateCCW={handleRotateCCW}
            onUndo={handleUndo}
            onReset={handleReset}
            disabled={state.isGameOver}
          />
        </div>
      </div>

      {/* Game over overlay */}
      <AnimatePresence>
        {state.isGameOver && (
          <GameOverScreen
            score={state.score}
            level={state.level}
            linesCleared={state.totalLinesCleared}
            bestStreak={state.bestStreak}
            gameMode={mode}
            onPlayAgain={handlePlayAgain}
            onModeSelect={handleModeSelect}
            coachTip={coachTip}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
