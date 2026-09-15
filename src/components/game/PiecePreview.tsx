// ============================================================
// BlockMind — Piece Preview Component
// ============================================================

import { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { GamePiece } from "@/game/types";

interface PiecePreviewProps {
  pieces: GamePiece[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

function MiniPiece({ piece, size = 6 }: { piece: GamePiece; size?: number }) {
  const grid = piece.shape;
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  return (
    <div
      className="grid gap-[1px]"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${size}px)`,
        gridTemplateRows: `repeat(${rows}, ${size}px)`,
      }}
    >
      {grid.flatMap((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className={cn("rounded-sm pointer-events-none")}
            style={
              cell
                ? {
                    backgroundColor: cell,
                    boxShadow: [
                      "inset 1px 1px 2px rgba(255,255,255,0.5)",
                      "inset -1px -1px 2px rgba(0,0,0,0.3)",
                      "1px 2px 3px rgba(0,0,0,0.4)",
                    ].join(", "),
                  }
                : { backgroundColor: "transparent" }
            }
          />
        )),
      )}
    </div>
  );
}

export function PiecePreview({
  pieces,
  selectedIndex,
  onSelect,
  disabled,
}: PiecePreviewProps) {
  // Touch drag support: track which piece is being dragged
  const dragIndexRef = useRef<number | null>(null);

  const handleTouchStart = useCallback(
    (index: number) => (e: React.TouchEvent) => {
      if (disabled) return;
      dragIndexRef.current = index;
      // Select the piece on touch start
      onSelect(index);
    },
    [disabled, onSelect],
  );

  const handleTouchEnd = useCallback(
    (_index: number) => (e: React.TouchEvent) => {
      dragIndexRef.current = null;
    },
    [],
  );

  return (
    <div className="flex items-center justify-center gap-3">
      {pieces.map((piece, index) => {
        const isSelected = selectedIndex === index;
        return (
          <button
            key={piece.id}
            onClick={() => !disabled && onSelect(index)}
            onTouchStart={handleTouchStart(index)}
            onTouchEnd={handleTouchEnd(index)}
            disabled={disabled}
            className={cn(
              "relative flex items-center justify-center rounded-xl p-3 transition-all duration-200",
              "border-2 touch-manipulation",
              isSelected
                ? "border-blue-400 bg-blue-400/20 scale-110 shadow-lg shadow-blue-400/25 ring-2 ring-blue-400/30"
                : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25",
              disabled && "opacity-30 cursor-not-allowed",
            )}
          >
            <MiniPiece piece={piece} />
            {/* Selection indicator dot */}
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-400 border-2 border-slate-900" />
            )}
          </button>
        );
      })}
    </div>
  );
}
