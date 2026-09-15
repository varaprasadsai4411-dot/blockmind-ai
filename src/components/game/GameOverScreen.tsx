// ============================================================
// BlockMind — Game Over Screen
// ============================================================

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw, Trophy, Target, Zap, BarChart3, Home } from "lucide-react";

interface GameOverScreenProps {
  score: number;
  level: number;
  linesCleared: number;
  bestStreak: number;
  gameMode: "endless" | "daily" | "zen";
  onPlayAgain: () => void;
  onModeSelect: () => void;
  coachTip?: string;
  isHighScore?: boolean;
}

export function GameOverScreen({
  score,
  level,
  linesCleared,
  bestStreak,
  gameMode,
  onPlayAgain,
  onModeSelect,
  coachTip,
  isHighScore,
}: GameOverScreenProps) {
  const stats = [
    {
      icon: Trophy,
      label: "Score",
      value: score.toLocaleString(),
      color: "text-amber-400",
    },
    {
      icon: Target,
      label: "Lines",
      value: linesCleared,
      color: "text-emerald-400",
    },
    {
      icon: Zap,
      label: "Best Streak",
      value: bestStreak,
      color: "text-blue-400",
    },
    {
      icon: BarChart3,
      label: "Level",
      value: level,
      color: "text-purple-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="mx-4 w-full max-w-xs rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/50 p-5 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", damping: 12 }}
            className="text-4xl mb-2"
          >
            {gameMode === "daily"
              ? "\uD83C\uDFC6"
              : isHighScore
                ? "\u2B50"
                : "\uD83D\uDCAE"}
          </motion.div>
          <h2 className="text-xl font-bold text-white">
            {gameMode === "daily"
              ? "Challenge Complete"
              : isHighScore
                ? "New High Score!"
                : "Game Over"}
          </h2>
          {isHighScore && gameMode !== "daily" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="mt-1 inline-block rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/30"
            >
              ★ New Personal Best!
            </motion.div>
          )}
        </div>

        {/* Score highlight */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-center mb-4"
        >
          <div className="text-4xl font-black text-white tabular-nums">
            {score.toLocaleString()}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            Final Score
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {stats.map(({ icon: Icon, label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="rounded-lg bg-white/5 border border-white/5 p-2.5 text-center"
            >
              <Icon className={cn("w-4 h-4 mx-auto mb-1", color)} />
              <div className="text-base font-bold text-white tabular-nums">
                {value}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                {label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Coach Tip */}
        {coachTip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-3"
          >
            <div className="flex items-start gap-2">
              <span className="text-sm shrink-0">
                <span role="img" aria-label="lightbulb">{"\uD83D\uDCA1"}</span>
              </span>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 mb-1">
                  AI Coach
                </div>
                <p className="text-xs text-blue-200/90 leading-relaxed">
                  {coachTip}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-blue-500/20"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
          {gameMode === "daily" && (
            <Button
              onClick={onModeSelect}
              variant="ghost"
              className="w-full text-slate-300 hover:text-white hover:bg-white/10 gap-2"
            >
              <Trophy className="w-4 h-4" />
              View Leaderboard
            </Button>
          )}
          <Button
            onClick={onModeSelect}
            variant="ghost"
            className="w-full text-slate-400 hover:text-white hover:bg-white/10 gap-2"
          >
            <Home className="w-4 h-4" />
            Mode Select
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Generate a personalized coach tip based on game data. */
export function generateCoachTip(data: {
  score: number;
  linesCleared: number;
  bestStreak: number;
  level: number;
  gameMode: string;
}): string {
  // Per-game specific tips based on actual performance data
  if (data.linesCleared === 0) {
    return "Your board filled up before clearing any lines — try placing smaller pieces in corners first to keep rows open for bigger clears.";
  }

  if (data.bestStreak >= 5) {
    return `Incredible ${data.bestStreak}-clear streak! You have a great eye for chaining clears — focus on keeping that rhythm longer.`;
  }

  if (data.bestStreak >= 3) {
    return `Nice ${data.bestStreak}-clear streak! You're building momentum well. Try stacking pieces to set up even longer chains.`;
  }

  if (data.linesCleared < 5 && data.score < 100) {
    return "Your board filled up fast — try spreading pieces across the board instead of clustering. Empty space is your best friend.";
  }

  if (data.level >= 8) {
    return `Reaching level ${data.level} shows real skill! At higher levels, prioritize clearing lines over perfect placement — speed matters more.`;
  }

  if (data.level >= 4) {
    return `Level ${data.level} is solid progress! Watch the edges and corners — that's where boards tend to get stuck and fill up.`;
  }

  if (data.score > 500) {
    return `Great score of ${data.score.toLocaleString()}! You're reading the board well — keep building toward multi-line combos for even bigger payouts.`;
  }

  // Fallback tips based on score ranges
  if (data.score > 200) {
    return "You're clearing lines consistently — try to set up 2-3 line clears at once for combo multipliers that really boost your score.";
  }

  return "Every game teaches you something. Try to keep at least 2 rows partially open — that gives you room to maneuver when big pieces show up.";
}
