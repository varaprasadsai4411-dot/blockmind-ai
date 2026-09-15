// ============================================================
// BlockMind — Game Controls Component
// ============================================================

import { cn } from "@/lib/utils";
import { RotateCw, RotateCcw, Undo2, RotateCcwIcon } from "lucide-react";

interface GameControlsProps {
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onUndo?: () => void;
  onReset?: () => void;
  disabled?: boolean;
}

export function GameControls({
  onRotateCW,
  onRotateCCW,
  onUndo,
  onReset,
  disabled,
}: GameControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {/* Undo */}
      <button
        onClick={onUndo}
        disabled={disabled || !onUndo}
        className={cn(
          "flex items-center justify-center w-11 h-11 rounded-full",
          "bg-white/10 border border-white/10 text-slate-300",
          "hover:bg-white/20 active:scale-95 transition-all",
          "disabled:opacity-20 disabled:cursor-not-allowed",
        )}
        aria-label="Undo last move"
        title="Undo"
      >
        <Undo2 className="w-4 h-4" />
      </button>

      {/* Counter-clockwise rotation */}
      <button
        onClick={onRotateCCW}
        disabled={disabled}
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full",
          "bg-white/10 border border-white/10 text-white",
          "hover:bg-white/20 active:scale-95 transition-all",
          "disabled:opacity-30 disabled:cursor-not-allowed",
        )}
        aria-label="Rotate counter-clockwise"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      {/* Clockwise rotation */}
      <button
        onClick={onRotateCW}
        disabled={disabled}
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full",
          "bg-white/10 border border-white/10 text-white",
          "hover:bg-white/20 active:scale-95 transition-all",
          "disabled:opacity-30 disabled:cursor-not-allowed",
        )}
        aria-label="Rotate clockwise"
      >
        <RotateCw className="w-5 h-5" />
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        disabled={disabled || !onReset}
        className={cn(
          "flex items-center justify-center w-11 h-11 rounded-full",
          "bg-white/10 border border-white/10 text-slate-300",
          "hover:bg-white/20 active:scale-95 transition-all",
          "disabled:opacity-20 disabled:cursor-not-allowed",
        )}
        aria-label="Reset game"
        title="Reset"
      >
        <RotateCcwIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
