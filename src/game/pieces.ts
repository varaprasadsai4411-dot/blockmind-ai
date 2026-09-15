// ============================================================
// BlockMind — Piece Definitions
// ============================================================
// Block Blast-style pieces. Each piece has a name, color, and
// multiple rotation states defined as 2D matrices.
// ============================================================

import type { GamePiece, PieceShape, PieceId } from "./types";

// ----- Color Palette — Jewel/Candy Theme -----
export const PIECE_COLORS = {
  ruby: "#E53E3E",       // Red
  amber: "#F59E0B",      // Yellow/Orange
  emerald: "#10B981",    // Green
  sapphire: "#3B82F6",   // Blue
  amethyst: "#8B5CF6",   // Purple
  rose: "#EC4899",       // Pink
  teal: "#14B8A6",       // Teal
} as const;

export type PieceColorName = keyof typeof PIECE_COLORS;

// ----- Piece Definitions -----
// Each piece defines its rotation states as arrays of (row, col) offsets
// from the top-left of its bounding box, plus the color.

interface PieceDefinition {
  id: PieceId;
  name: string;
  colorName: PieceColorName;
  rotations: number[][][]; // [rotation][cell] = [row, col]
  size: number; // bounding box size
}

const PIECE_DEFS: PieceDefinition[] = [
  // Single block
  {
    id: "single",
    name: "Dot",
    colorName: "teal",
    rotations: [
      [[0, 0]],
    ],
    size: 1,
  },
  // Domino — horizontal
  {
    id: "domino",
    name: "Bar2",
    colorName: "emerald",
    rotations: [
      [[0, 0], [0, 1]],
      [[0, 0], [1, 0]],
    ],
    size: 2,
  },
  // Tromino — L shape (3 blocks)
  {
    id: "tromino-l",
    name: "L3",
    colorName: "amber",
    rotations: [
      [[0, 0], [1, 0], [1, 1]],
      [[0, 1], [1, 0], [1, 1]],
      [[0, 0], [0, 1], [1, 0]],
      [[0, 0], [0, 1], [1, 1]],
    ],
    size: 2,
  },
  // Tromino — straight 3
  {
    id: "tromino-i",
    name: "Bar3",
    colorName: "sapphire",
    rotations: [
      [[0, 0], [0, 1], [0, 2]],
      [[0, 0], [1, 0], [2, 0]],
    ],
    size: 3,
  },
  // Tromino — corner
  {
    id: "tromino-v",
    name: "V3",
    colorName: "rose",
    rotations: [
      [[0, 0], [0, 1], [1, 0]],
      [[0, 0], [0, 1], [1, 1]],
      [[0, 1], [1, 0], [1, 1]],
      [[0, 0], [1, 0], [1, 1]],
    ],
    size: 2,
  },
  // Tetromino — O (square)
  {
    id: "tetromino-o",
    name: "Square",
    colorName: "amber",
    rotations: [
      [[0, 0], [0, 1], [1, 0], [1, 1]],
    ],
    size: 2,
  },
  // Tetromino — I (straight 4)
  {
    id: "tetromino-i",
    name: "Bar4",
    colorName: "sapphire",
    rotations: [
      [[0, 0], [0, 1], [0, 2], [0, 3]],
      [[0, 0], [1, 0], [2, 0], [3, 0]],
    ],
    size: 4,
  },
  // Tetromino — T
  {
    id: "tetromino-t",
    name: "T",
    colorName: "amethyst",
    rotations: [
      [[0, 1], [1, 0], [1, 1], [1, 2]],
      [[0, 0], [1, 0], [1, 1], [2, 0]],
      [[0, 0], [0, 1], [0, 2], [1, 1]],
      [[0, 1], [1, 0], [1, 1], [2, 1]],
    ],
    size: 3,
  },
  // Tetromino — L
  {
    id: "tetromino-l",
    name: "L",
    colorName: "ruby",
    rotations: [
      [[0, 0], [1, 0], [2, 0], [2, 1]],
      [[0, 0], [0, 1], [0, 2], [1, 0]],
      [[0, 0], [0, 1], [1, 1], [2, 1]],
      [[0, 2], [1, 0], [1, 1], [1, 2]],
    ],
    size: 3,
  },
  // Tetromino — J (mirror of L)
  {
    id: "tetromino-j",
    name: "J",
    colorName: "ruby",
    rotations: [
      [[0, 1], [1, 1], [2, 0], [2, 1]],
      [[0, 0], [1, 0], [1, 1], [1, 2]],
      [[0, 0], [0, 1], [1, 0], [2, 0]],
      [[0, 0], [0, 1], [0, 2], [1, 2]],
    ],
    size: 3,
  },
  // Tetromino — S
  {
    id: "tetromino-s",
    name: "S",
    colorName: "emerald",
    rotations: [
      [[0, 1], [0, 2], [1, 0], [1, 1]],
      [[0, 0], [1, 0], [1, 1], [2, 1]],
    ],
    size: 3,
  },
  // Tetromino — Z (mirror of S)
  {
    id: "tetromino-z",
    name: "Z",
    colorName: "rose",
    rotations: [
      [[0, 0], [0, 1], [1, 1], [1, 2]],
      [[0, 1], [1, 0], [1, 1], [2, 0]],
    ],
    size: 3,
  },
];

// ----- Piece Generation -----
// Unique piece IDs for each instantiation
let pieceCounter = 0;

export function createPiece(def: PieceDefinition): GamePiece {
  const rotation = def.rotations[0];
  const shape: PieceShape = Array.from({ length: def.size }, () =>
    Array.from({ length: def.size }, () => null)
  );
  for (const [r, c] of rotation) {
    shape[r][c] = PIECE_COLORS[def.colorName];
  }
  return {
    id: `${def.id}-${pieceCounter++}`,
    shape,
    color: PIECE_COLORS[def.colorName],
    name: def.name,
  };
}

// ----- Rotation Helpers -----

/** Get the rotation states for a piece definition by matching its shape. */
function findPieceDef(piece: GamePiece): PieceDefinition | undefined {
  return PIECE_DEFS.find((def) => def.id === piece.id.split("-").slice(0, -1).join("-"));
}

/** Get all rotation states for a piece. */
export function getRotations(piece: GamePiece): PieceShape[] {
  const def = findPieceDef(piece);
  if (!def) return [piece.shape];
  return def.rotations.map((rotation) => {
    const shape: PieceShape = Array.from({ length: def.size }, () =>
      Array.from({ length: def.size }, () => null)
    );
    for (const [r, c] of rotation) {
      shape[r][c] = PIECE_COLORS[def.colorName];
    }
    return shape;
  });
}

/** Get current rotation index for a piece. */
export function getRotationIndex(piece: GamePiece): number {
  const rotations = getRotations(piece);
  return rotations.findIndex(
    (r) => JSON.stringify(r) === JSON.stringify(piece.shape)
  );
}

/** Rotate a piece clockwise. Returns a new GamePiece. */
export function rotatePieceCW(piece: GamePiece): GamePiece {
  const def = findPieceDef(piece);
  if (!def) return piece;
  const rotations = getRotations(piece);
  const currentIdx = getRotationIndex(piece);
  const nextIdx = (currentIdx + 1) % rotations.length;
  return { ...piece, shape: rotations[nextIdx] };
}

/** Rotate a piece counter-clockwise. Returns a new GamePiece. */
export function rotatePieceCCW(piece: GamePiece): GamePiece {
  const def = findPieceDef(piece);
  if (!def) return piece;
  const rotations = getRotations(piece);
  const currentIdx = getRotationIndex(piece);
  const nextIdx = (currentIdx - 1 + rotations.length) % rotations.length;
  return { ...piece, shape: rotations[nextIdx] };
}

// ----- Piece Generation with Difficulty Weights -----

/** Weight categories for piece generation. */
interface PieceWeight {
  id: string;
  easy: number;    // weight when player is struggling
  medium: number;  // neutral weight
  hard: number;    // weight when player is doing well
}

const PIECE_WEIGHTS: PieceWeight[] = [
  { id: "single",         easy: 20, medium: 10, hard: 5 },
  { id: "domino",         easy: 20, medium: 12, hard: 6 },
  { id: "tromino-l",      easy: 15, medium: 12, hard: 10 },
  { id: "tromino-i",      easy: 10, medium: 10, hard: 12 },
  { id: "tromino-v",      easy: 12, medium: 10, hard: 8 },
  { id: "tetromino-o",    easy: 8,  medium: 10, hard: 14 },
  { id: "tetromino-i",    easy: 3,  medium: 8,  hard: 15 },
  { id: "tetromino-t",    easy: 4,  medium: 8,  hard: 14 },
  { id: "tetromino-l",    easy: 3,  medium: 8,  hard: 15 },
  { id: "tetromino-j",    easy: 3,  medium: 8,  hard: 15 },
  { id: "tetromino-s",    easy: 2,  medium: 7,  hard: 14 },
  { id: "tetromino-z",    easy: 2,  medium: 7,  hard: 14 },
];

/**
 * Generate a piece using weighted random selection based on difficulty.
 * @param skillRating 0-100, higher = harder pieces
 */
export function generateWeightedPiece(skillRating: number): GamePiece {
  // Interpolate between easy/medium/hard weights based on skill rating
  const t = Math.max(0, Math.min(1, skillRating / 100));

  const weights = PIECE_WEIGHTS.map((pw) => {
    if (t < 0.5) {
      // 0-50: interpolate easy → medium
      const lt = t * 2;
      return pw.easy * (1 - lt) + pw.medium * lt;
    } else {
      // 50-100: interpolate medium → hard
      const lt = (t - 0.5) * 2;
      return pw.medium * (1 - lt) + pw.hard * lt;
    }
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < PIECE_WEIGHTS.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      const def = PIECE_DEFS.find((d) => d.id === PIECE_WEIGHTS[i].id)!;
      return createPiece(def);
    }
  }

  // Fallback
  return createPiece(PIECE_DEFS[0]);
}

/**
 * Generate a batch of pieces for the queue.
 * @param count Number of pieces to generate
 * @param skillRating Player's current skill rating
 */
export function generatePieceBatch(count: number, skillRating: number): GamePiece[] {
  return Array.from({ length: count }, () => generateWeightedPiece(skillRating));
}

/**
 * Generate a piece with a seeded random number (for daily challenges).
 * Uses a simple mulberry32 PRNG.
 */
export function generateSeededPiece(seed: number): GamePiece {
  // Mulberry32 PRNG
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const random = ((t ^ (t >>> 14)) >>> 0) / 4294967296;

  const totalWeight = PIECE_WEIGHTS.reduce((a, b) => a + b.medium, 0);
  let r = random * totalWeight;

  for (let i = 0; i < PIECE_WEIGHTS.length; i++) {
    r -= PIECE_WEIGHTS[i].medium;
    if (r <= 0) {
      const def = PIECE_DEFS.find((d) => d.id === PIECE_WEIGHTS[i].id)!;
      return createPiece(def);
    }
  }
  return createPiece(PIECE_DEFS[0]);
}

/** Get all piece definitions (for reference/testing). */
export function getAllPieceDefs(): PieceDefinition[] {
  return PIECE_DEFS;
}
