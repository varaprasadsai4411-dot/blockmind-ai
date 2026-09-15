// ============================================================
// BlockMind — Game Board Component
// ============================================================

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Grid, GamePiece, Cell, PlacedBlock } from "@/game/types";
import { GRID_SIZE, canPlacePiece, getPieceCells } from "@/game/grid";

interface GameBoardProps {
  grid: Grid;
  /** The piece currently being placed (ghost preview). */
  ghostPiece: GamePiece | null;
  /** Currently hovered cell — ghost shows piece anchored here. */
  hoveredCell: Cell | null;
  /** Whether the hovered cell is a valid placement. */
  isValidHover: boolean;
  isGameOver: boolean;
  clearingLines: { rows: number[]; cols: number[] } | null;
  lastPlacedBlocks: PlacedBlock[];
  onCellClick: (row: number, col: number) => void;
  onHoverCell: (row: number, col: number) => void;
  onHoverEnd: () => void;
}

// Particle system for line clears
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  tx: number;
  ty: number;
  rotation: number;
}

function ParticleEffect({
  clearingLines,
  grid,
}: {
  clearingLines: { rows: number[]; cols: number[] } | null;
  grid: Grid;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!clearingLines) return;
    const newParticles: Particle[] = [];
    let id = 0;

    const colors: string[] = [];
    for (const r of clearingLines.rows) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r]?.[c]) colors.push(grid[r][c]!);
      }
    }
    for (const c of clearingLines.cols) {
      for (let r = 0; r < GRID_SIZE; r++) {
        if (grid[r]?.[c]) colors.push(grid[r][c]!);
      }
    }
    if (colors.length === 0) return;

    for (const r of clearingLines.rows) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const color = grid[r]?.[c] || colors[0];
        const baseX = (c / GRID_SIZE) * 100;
        const baseY = (r / GRID_SIZE) * 100;
        for (let p = 0; p < 3; p++) {
          const angle = (Math.PI * 2 * p) / 3 + Math.random() * 0.5;
          const dist = 15 + Math.random() * 25;
          newParticles.push({
            id: id++,
            x: baseX,
            y: baseY,
            color,
            size: 4 + Math.random() * 6,
            tx: Math.cos(angle) * dist,
            ty: Math.sin(angle) * dist,
            rotation: Math.random() * 360,
          });
        }
      }
    }
    for (const c of clearingLines.cols) {
      for (let r = 0; r < GRID_SIZE; r++) {
        if (clearingLines.rows.includes(r)) continue;
        const color = grid[r]?.[c] || colors[0];
        const baseX = (c / GRID_SIZE) * 100;
        const baseY = (r / GRID_SIZE) * 100;
        for (let p = 0; p < 3; p++) {
          const angle = (Math.PI * 2 * p) / 3 + Math.random() * 0.5;
          const dist = 15 + Math.random() * 25;
          newParticles.push({
            id: id++,
            x: baseX,
            y: baseY,
            color,
            size: 4 + Math.random() * 6,
            tx: Math.cos(angle) * dist,
            ty: Math.sin(angle) * dist,
            rotation: Math.random() * 360,
          });
        }
      }
    }

    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 700);
    return () => clearTimeout(timer);
  }, [clearingLines, grid]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 6px ${p.color}90`,
            transform: `translate(${p.tx}vw, ${p.ty}vh) rotate(${p.rotation}deg)`,
            opacity: 0,
            animation: "particle-fly 0.6s ease-out forwards",
          }}
        />
      ))}
    </div>
  );
}

/** 3D block shadow — true bevel + drop shadow for placed blocks. */
const BLOCK_3D_SHADOW = [
  "inset 2px 2px 4px rgba(255,255,255,0.6)",
  "inset -3px -3px 4px rgba(0,0,0,0.4)",
  "2px 4px 6px rgba(0,0,0,0.5)",
].join(", ");

/** 3D block shadow for ghost/preview blocks — lighter. */
const GHOST_3D_SHADOW = [
  "inset 1px 1px 3px rgba(255,255,255,0.4)",
  "inset -2px -2px 3px rgba(0,0,0,0.3)",
  "1px 2px 4px rgba(0,0,0,0.3)",
].join(", ");

/** Empty cell recessed shadow. */
const EMPTY_CELL_SHADOW = "inset 0 1px 3px rgba(0,0,0,0.4)";

export function GameBoard({
  grid,
  ghostPiece,
  hoveredCell,
  isValidHover,
  isGameOver,
  clearingLines,
  lastPlacedBlocks,
  onCellClick,
  onHoverCell,
  onHoverEnd,
}: GameBoardProps) {
  // Compute ghost cells from ghostPiece + hoveredCell
  const ghostCells = useMemo(() => {
    if (!ghostPiece || !hoveredCell) return [];
    if (canPlacePiece(grid, ghostPiece, hoveredCell.row, hoveredCell.col)) {
      return getPieceCells(ghostPiece, hoveredCell.row, hoveredCell.col);
    }
    return [];
  }, [ghostPiece, hoveredCell, grid]);

  const ghostSet = useMemo(() => {
    const set = new Set<string>();
    ghostCells.forEach((c) => set.add(`${c.row},${c.col}`));
    return set;
  }, [ghostCells]);

  const clearingSet = useMemo(() => {
    const set = new Set<string>();
    if (clearingLines) {
      clearingLines.rows.forEach((r) => {
        for (let c = 0; c < GRID_SIZE; c++) set.add(`${r},${c}`);
      });
      clearingLines.cols.forEach((c) => {
        for (let r = 0; r < GRID_SIZE; r++) set.add(`${r},${c}`);
      });
    }
    return set;
  }, [clearingLines]);

  const lastPlacedSet = useMemo(() => {
    const set = new Set<string>();
    lastPlacedBlocks.forEach((b) => set.add(`${b.row},${b.col}`));
    return set;
  }, [lastPlacedBlocks]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (isGameOver) return;
      onCellClick(row, col);
    },
    [onCellClick, isGameOver],
  );

  const handleCellMouseEnter = useCallback(
    (row: number, col: number) => {
      if (isGameOver) return;
      onHoverCell(row, col);
    },
    [onHoverCell, isGameOver],
  );

  const handleGridMouseLeave = useCallback(() => {
    onHoverEnd();
  }, [onHoverEnd]);

  // Touch handlers for mobile
  const touchCellRef = useRef<Cell | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isGameOver) return;
      const touch = e.touches[0];
      const el = e.currentTarget as HTMLDivElement;
      const rect = el.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const cellW = rect.width / GRID_SIZE;
      const cellH = rect.height / GRID_SIZE;
      const col = Math.floor(x / cellW);
      const row = Math.floor(y / cellH);
      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        touchCellRef.current = { row, col };
        onHoverCell(row, col);
      }
    },
    [isGameOver, onHoverCell],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isGameOver) return;
      const touch = e.touches[0];
      const el = e.currentTarget as HTMLDivElement;
      const rect = el.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const cellW = rect.width / GRID_SIZE;
      const cellH = rect.height / GRID_SIZE;
      const col = Math.floor(x / cellW);
      const row = Math.floor(y / cellH);
      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        touchCellRef.current = { row, col };
        onHoverCell(row, col);
      }
    },
    [isGameOver, onHoverCell],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (isGameOver) return;
      const cell = touchCellRef.current;
      if (cell) {
        onCellClick(cell.row, cell.col);
        touchCellRef.current = null;
        onHoverEnd();
      }
    },
    [onCellClick, isGameOver, onHoverEnd],
  );

  const handleTouchCancel = useCallback(() => {
    touchCellRef.current = null;
    onHoverEnd();
  }, [onHoverEnd]);

  return (
    <div className="relative select-none mb-[6px]">
      {/* Grid container — extra padding so 3D bevels render fully */}
      <div
        className={cn(
          "grid gap-[2px] rounded-xl p-[6px] border border-white/10",
          isGameOver ? "bg-slate-800/70" : "bg-slate-800/95",
        )}
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          aspectRatio: "1",
          maxWidth: "100%",
          touchAction: "none",
        }}
        onMouseLeave={handleGridMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        {Array.from({ length: GRID_SIZE }).map((_, row) =>
          Array.from({ length: GRID_SIZE }).map((_, col) => {
            const cellColor = grid[row][col];
            const isGhost = ghostSet.has(`${row},${col}`);
            const isClearing = clearingSet.has(`${row},${col}`);
            const isNewPlaced = lastPlacedSet.has(`${row},${col}`);
            const isInvalid =
              hoveredCell?.row === row &&
              hoveredCell?.col === col &&
              ghostPiece &&
              !isValidHover;

            return (
              <div
                key={`${row}-${col}`}
                role="button"
                tabIndex={-1}
                className={cn(
                  "relative rounded-md transition-all duration-100",
                  "aspect-square",
                  cellColor ? "" : "bg-slate-700/40",
                  isClearing && "animate-pulse scale-110 z-10",
                  isNewPlaced && !isClearing && "animate-pop-in",
                  isGhost && !cellColor && "bg-white/20",
                  !isGameOver && "cursor-pointer active:brightness-90",
                )}
                style={{
                  ...(cellColor && !isClearing
                    ? {
                        backgroundColor: cellColor,
                        boxShadow: BLOCK_3D_SHADOW,
                      }
                    : isClearing
                      ? {
                          backgroundColor: "rgba(255,255,255,0.7)",
                          boxShadow:
                            "0 0 20px rgba(255,255,255,0.7), inset 0 0 10px rgba(255,255,255,0.5)",
                        }
                      : isGhost && !cellColor
                        ? {
                            backgroundColor:
                              ghostPiece?.color || "rgba(255,255,255,0.2)",
                            opacity: 0.4,
                            boxShadow: GHOST_3D_SHADOW,
                          }
                        : isInvalid
                          ? {
                              boxShadow: EMPTY_CELL_SHADOW,
                              backgroundColor: "rgba(255,255,255,0.05)",
                            }
                          : {
                              boxShadow: EMPTY_CELL_SHADOW,
                            }),
                }}
                onClick={() => handleCellClick(row, col)}
                onMouseEnter={() => handleCellMouseEnter(row, col)}
              >
                {/* 3D top face gradient overlay — NO overflow-hidden so bevels render */}
                {cellColor && !isClearing && (
                  <div className="absolute inset-0 rounded-md pointer-events-none">
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.1) 40%, transparent 60%, rgba(0,0,0,0.15) 100%)",
                      }}
                    />
                  </div>
                )}
                {/* Ghost piece gradient overlay */}
                {isGhost && !cellColor && (
                  <div className="absolute inset-0 rounded-md pointer-events-none">
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)",
                      }}
                    />
                  </div>
                )}
                {/* Clear flash */}
                {isClearing && (
                  <div className="absolute inset-0 rounded-md bg-white animate-pulse pointer-events-none" />
                )}
              </div>
            );
          }),
        )}
      </div>

      {/* Particle effects */}
      <ParticleEffect clearingLines={clearingLines} grid={grid} />

      {/* Game over overlay */}
      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-[1px] z-20">
          <div className="text-white text-lg font-bold tracking-wide uppercase">
            Game Over
          </div>
        </div>
      )}
    </div>
  );
}
