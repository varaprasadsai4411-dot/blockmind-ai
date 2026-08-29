// ============================================================
// BlockMind — Landing Page
// ============================================================

import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  Zap,
  Trophy,
  Brain,
  Calendar,
  Sparkles,
  ArrowRight,
  Star,
  Grid3X3,
  RotateCw,
  ChevronRight,
} from "lucide-react";

const BLOCK_COLORS = [
  "#E53E3E", "#F59E0B", "#10B981", "#3B82F6",
  "#8B5CF6", "#EC4899", "#14B8A6",
];

function FloatingBlock({
  color, size, x, y, delay, rotation,
}: {
  color: string; size: number; x: string; y: string; delay: number; rotation: number;
}) {
  return (
    <motion.div
      className="absolute rounded-lg shadow-lg hidden sm:block"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        left: x,
        top: y,
        boxShadow: `inset 0 2px 0 rgba(255,255,255,0.3), 0 4px 12px ${color}40`,
      }}
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{
        opacity: [0, 0.7, 0.7, 0],
        scale: [0, 1, 1, 0.8],
        rotate: [0, rotation],
        y: [0, -20, -20, -40],
      }}
      transition={{
        duration: 4, delay, repeat: Infinity, repeatDelay: 2, ease: "easeInOut",
      }}
    />
  );
}

function BoardPreview() {
  const cells = [
    [0, 0, null, 0, 0, null, null, null],
    [null, 1, 1, null, 2, 2, null, null],
    [null, null, null, null, null, 3, 3, null],
    [4, 4, null, null, null, null, 5, 5],
    [null, 6, 6, null, null, null, null, null],
    [null, null, null, 1, 1, 1, null, null],
    [null, null, 0, null, null, 4, 4, null],
    [null, null, null, 3, null, null, null, null],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative mx-auto w-full max-w-[240px] sm:max-w-[300px] md:max-w-[320px]"
    >
      <div className="rounded-2xl bg-slate-900/90 p-2 sm:p-3 shadow-2xl border border-white/10 backdrop-blur-sm">
        <div className="grid grid-cols-8 gap-[1.5px] sm:gap-[2px]">
          {cells.flat().map((colorIdx, i) => {
            const color = colorIdx !== null ? BLOCK_COLORS[colorIdx] : null;
            return (
              <motion.div
                key={i}
                className="aspect-square rounded-[2px] sm:rounded-[3px] relative"
                style={
                  color
                    ? {
                        backgroundColor: color,
                        boxShadow: [
                          "inset 0 2px 0 rgba(255,255,255,0.45)",
                          "inset 2px 0 0 rgba(255,255,255,0.25)",
                          "inset 0 -2px 0 rgba(0,0,0,0.35)",
                          "inset -2px 0 0 rgba(0,0,0,0.2)",
                          "0 3px 0 rgba(0,0,0,0.4)",
                          "0 4px 8px rgba(0,0,0,0.3)",
                        ].join(", "),
                      }
                    : { backgroundColor: "rgba(51, 65, 85, 0.4)" }
                }
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.008, duration: 0.3 }}
              >
                {color && (
                  <div className="absolute inset-0 rounded-[3px] bg-gradient-to-br from-white/30 via-white/5 to-black/20 pointer-events-none" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-blue-500/20 blur-xl" />
    </motion.div>
  );
}

const FEATURES = [
  {
    icon: Brain,
    title: "AI Adaptive Difficulty",
    description:
      "The game learns your skill level and adjusts piece difficulty in real-time — keeping you in the perfect challenge zone.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Calendar,
    title: "Daily Challenges",
    description:
      "One puzzle per day, identical for all players. Compete on the leaderboard and track your rank.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Sparkles,
    title: "AI Coach",
    description:
      "Get personalized tips after every game based on your actual play patterns.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Trophy,
    title: "Cloud Synced",
    description:
      "Your high scores, streaks, and difficulty profile follow you across devices.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

const GAME_MODES = [
  { name: "Endless", icon: "♾️", description: "Infinite play with AI-tuned difficulty", color: "from-blue-500 to-purple-500" },
  { name: "Daily", icon: "📅", description: "One board, one day, global leaderboard", color: "from-amber-500 to-orange-500" },
  { name: "Zen", icon: "☀️", description: "No pressure, pure relaxation", color: "from-emerald-500 to-teal-500" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handlePlay = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth?returnTo=/dashboard");
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pb-12 sm:pb-16 pt-20 sm:pt-24">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-background to-background" />
        <div className="absolute inset-0 bg-grid-pattern" />

        <FloatingBlock color="#E53E3E" size={40} x="10%" y="20%" delay={0} rotation={45} />
        <FloatingBlock color="#F59E0B" size={32} x="85%" y="15%" delay={0.5} rotation={-30} />
        <FloatingBlock color="#10B981" size={36} x="75%" y="65%" delay={1} rotation={60} />
        <FloatingBlock color="#3B82F6" size={28} x="15%" y="70%" delay={1.5} rotation={-45} />
        <FloatingBlock color="#8B5CF6" size={34} x="50%" y="10%" delay={0.8} rotation={30} />
        <FloatingBlock color="#EC4899" size={26} x="90%" y="45%" delay={2} rotation={-60} />
        <FloatingBlock color="#14B8A6" size={30} x="5%" y="45%" delay={1.2} rotation={40} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-purple-300 mb-6 sm:mb-8"
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            AI-Powered Puzzle Game
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-4 sm:mb-6"
          >
            <span className="text-gradient">Block</span>
            <span className="text-foreground">Mind</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2"
          >
            A block puzzle game that{" "}
            <span className="text-foreground font-semibold">learns how you play</span>{" "}
            and adapts in real-time. Place blocks, clear lines, beat your high score.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12"
          >
            <Button
              size="lg"
              onClick={handlePlay}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
            >
              {isAuthenticated ? "Dashboard" : "Play Now"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            {!isAuthenticated && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth?returnTo=/dashboard")}
                className="w-full sm:w-auto border-white/20 hover:bg-white/5 text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6"
              >
                Sign In
              </Button>
            )}
          </motion.div>

          <BoardPreview />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center gap-4 sm:gap-8 mt-6 sm:mt-10 text-xs sm:text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span>3 Game Modes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
              <span>AI Adaptive</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span>Leaderboards</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-3 sm:mb-4">
              More Than Just Blocks
            </h2>
            <p className="text-muted-foreground text-sm sm:text-lg max-w-xl mx-auto">
              Every feature is designed to keep you engaged, improving, and coming
              back for one more game.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-2xl border border-border/60 bg-card p-5 sm:p-6 hover:border-border transition-all hover:shadow-lg"
              >
                <div className={`inline-flex items-center justify-center rounded-xl ${feature.bg} p-2.5 sm:p-3 mb-3 sm:mb-4`}>
                  <feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.color}`} />
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Modes */}
      <section className="relative py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-3 sm:mb-4">
              Three Ways to Play
            </h2>
            <p className="text-muted-foreground text-sm sm:text-lg max-w-xl mx-auto">
              Whether you're competitive, casual, or somewhere in between.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {GAME_MODES.map((mode, i) => (
              <motion.div
                key={mode.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative group rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={handlePlay}
              >
                <div className={`h-2 bg-gradient-to-r ${mode.color}`} />
                <div className="p-5 sm:p-6">
                  <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 block">{mode.icon}</span>
                  <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2">{mode.name} Mode</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{mode.description}</p>
                </div>
                <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                  <div className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                    Play now <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-3 sm:mb-4">
              How to Play
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: "1", icon: Grid3X3, title: "Pick a piece", desc: "Choose from three available pieces at the bottom" },
              { step: "2", icon: RotateCw, title: "Place it", desc: "Rotate if needed, then tap the board to place it" },
              { step: "3", icon: Zap, title: "Clear lines", desc: "Fill a complete row or column to score points" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary font-bold text-base sm:text-lg mb-3 sm:mb-4">
                  {item.step}
                </div>
                <item.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-muted-foreground" />
                <h3 className="font-bold mb-1.5 sm:mb-2 text-sm sm:text-base">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 sm:py-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center rounded-3xl bg-gradient-to-br from-purple-900/40 via-slate-900 to-pink-900/40 border border-white/10 p-8 sm:p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-50" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-3 sm:mb-4 text-white">
              Ready to Test Your Brain?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-lg mb-6 sm:mb-8 max-w-lg mx-auto">
              Jump into a game in seconds. No download, no install — just play.
            </p>
            <Button
              size="lg"
              onClick={handlePlay}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
            >
              {isAuthenticated ? "Go to Dashboard" : "Start Playing"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 sm:py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">BlockMind</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-1">
            Built with{" "}
            <a
              href="https://freebuff.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary transition-colors"
            >
              Freebuff
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
