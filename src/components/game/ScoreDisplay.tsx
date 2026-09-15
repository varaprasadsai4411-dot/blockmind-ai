// ============================================================
// BlockMind — Score Display Component
// ============================================================

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number;
  level: number;
  combo: number;
  streak: number;
  showCombo: number | null;
}

export function ScoreDisplay({
  score,
  level,
  combo,
  streak,
  showCombo,
}: ScoreDisplayProps) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-4 px-1">
        {/* Score */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Score
          </span>
          <motion.span
            key={score}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-xl font-bold text-white tabular-nums"
          >
            {score.toLocaleString()}
          </motion.span>
        </div>

        {/* Combo */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Combo
          </span>
          <span
            className={cn(
              "text-xl font-bold tabular-nums transition-all",
              combo > 0 ? "text-amber-400" : "text-slate-500"
            )}
          >
            {combo > 0 ? `\u00d7${combo}` : "\u2014"}
          </span>
        </div>

        {/* Streak */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Streak
          </span>
          <span
            className={cn(
              "text-xl font-bold tabular-nums transition-all",
              streak > 0 ? "text-emerald-400" : "text-slate-500"
            )}
          >
            {streak > 0 ? streak : "\u2014"}
          </span>
        </div>

        {/* Level */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Level
          </span>
          <span className="text-xl font-bold tabular-nums text-blue-400">
            {level}
          </span>
        </div>
      </div>

      {/* Combo popup animation */}
      <AnimatePresence>
        {showCombo && showCombo >= 2 && (
          <motion.div
            key={`combo-${showCombo}-${Date.now()}`}
            initial={{ scale: 0.5, opacity: 0, y: 0 }}
            animate={{ scale: 1.2, opacity: 1, y: -20 }}
            exit={{ scale: 0.8, opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-x-0 top-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div className="text-3xl font-black text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]">
              COMBO {"\u00d7"}{showCombo}!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
