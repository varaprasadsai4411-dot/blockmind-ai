// ============================================================
// BlockMind — Scoring System
// ============================================================

import type { PerformanceSignals, DifficultyProfile } from "./types";

/** Calculate the combo multiplier based on lines cleared in a single move. */
export function getComboMultiplier(linesCleared: number, currentCombo: number): number {
  if (linesCleared === 0) return 0;
  if (linesCleared === 1) return 1;
  // Multi-line clears increase the combo counter
  return 1 + (currentCombo + (linesCleared - 1)) * 0.5;
}

/** Points per line cleared (base values). */
const LINE_POINTS = [0, 10, 30, 60, 100];

/** Calculate score for a move. */
export function calculateMoveScore(
  linesCleared: number,
  combo: number,
  level: number,
  streak: number
): number {
  if (linesCleared === 0) return 0;

  const base = LINE_POINTS[Math.min(linesCleared, 4)];
  const comboMult = 1 + combo * 0.5;
  const levelMult = 1 + (level - 1) * 0.1;
  // Streak bonus: +5% per streak, capped at +50%
  const streakBonus = 1 + Math.min(streak, 10) * 0.05;

  return Math.round(base * comboMult * levelMult * streakBonus);
}

/** Calculate level from total lines cleared. */
export function calculateLevel(totalLines: number): number {
  return Math.floor(totalLines / 10) + 1;
}

/** Update difficulty profile based on performance signals. */
export function updateDifficultyProfile(
  profile: DifficultyProfile,
  signals: PerformanceSignals
): DifficultyProfile {
  // Blend new signals into the profile (exponential moving average)
  const alpha = 0.3; // learning rate

  // Skill rating is influenced by clear rate and near-death frequency
  const targetSkill =
    signals.clearRate * 0.5 +
    (100 - signals.boardFillPct) * 0.2 +
    Math.min(signals.streakLength * 5, 30) * 0.3;

  const newSkillRating = Math.max(0, Math.min(100,
    profile.skillRating * (1 - alpha) + targetSkill * alpha
  ));

  const newAvgClearRate = profile.avgClearRate * (1 - alpha) + signals.clearRate * alpha;
  const newAvgTimeToPlace =
    profile.avgTimeToPlace * (1 - alpha) + signals.avgTimeToPlace * alpha;

  return {
    skillRating: newSkillRating,
    avgClearRate: newAvgClearRate,
    avgTimeToPlace: newAvgTimeToPlace,
    gamesPlayed: profile.gamesPlayed + 1,
  };
}

/** Default difficulty profile for new players. */
export function createDefaultProfile(): DifficultyProfile {
  return {
    skillRating: 35, // Start slightly below neutral (50)
    avgClearRate: 30,
    avgTimeToPlace: 3000,
    gamesPlayed: 0,
  };
}

/** Get performance signals from raw game data. */
export function computePerformanceSignals(data: {
  placements: number;
  clears: number;
  nearDeathBoards: number;
  streakLength: number;
  boardFillPct: number;
  placementTimes: number[];
  placementsSinceClear: number;
}): PerformanceSignals {
  const clearRate = data.placements > 0
    ? (data.clears / data.placements) * 100
    : 0;

  const avgTimeToPlace = data.placementTimes.length > 0
    ? data.placementTimes.reduce((a, b) => a + b, 0) / data.placementTimes.length
    : 3000;

  return {
    clearRate,
    avgTimeToPlace,
    nearDeathCount: data.nearDeathBoards,
    streakLength: data.streakLength,
    boardFillPct: data.boardFillPct,
    placementsSinceClear: data.placementsSinceClear,
  };
}

/** Cosmetics unlock milestones (streak-based). */
export const STREAK_MILESTONES = [
  { days: 3, name: "Emerald Blocks", color: "#10B981" },
  { days: 7, name: "Ruby Blocks", color: "#E53E3E" },
  { days: 14, name: "Sapphire Blocks", color: "#3B82F6" },
  { days: 30, name: "Diamond Blocks", color: "#A78BFA" },
] as const;

/** Get unlocked cosmetics based on streak. */
export function getUnlockedCosmetics(streak: number): string[] {
  return STREAK_MILESTONES
    .filter((m) => streak >= m.days)
    .map((m) => m.name);
}

/** Daily challenge seed based on date. */
export function getDailyChallengeSeed(date: Date): number {
  const str = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

/** Get today's date string (UTC). */
export function getTodayUTC(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

/** Get milliseconds until next daily challenge (midnight UTC). */
export function msUntilNextDaily(): number {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return tomorrow.getTime() - now.getTime();
}

/** Format milliseconds as HH:MM:SS. */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
