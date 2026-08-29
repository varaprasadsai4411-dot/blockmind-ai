import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router";
import {
  LogOut,
  Trophy,
  Zap,
  Target,
  Flame,
  Crown,
  X,
  Check,
  Clock,
  Gamepad2,
  Sparkles,
} from "lucide-react";

const AVATARS = [
  { id: "gem-ruby", emoji: "💎", label: "Ruby" },
  { id: "gem-emerald", emoji: "💚", label: "Emerald" },
  { id: "gem-sapphire", emoji: "💙", label: "Sapphire" },
  { id: "gem-amethyst", emoji: "💜", label: "Amethyst" },
  { id: "gem-amber", emoji: "🧡", label: "Amber" },
  { id: "gem-diamond", emoji: "✨", label: "Diamond" },
  { id: "block-red", emoji: "🟥", label: "Red Block" },
  { id: "block-blue", emoji: "🟦", label: "Blue Block" },
  { id: "block-green", emoji: "🟩", label: "Green Block" },
  { id: "block-purple", emoji: "🟪", label: "Purple Block" },
  { id: "star", emoji: "⭐", label: "Star" },
  { id: "fire", emoji: "🔥", label: "Fire" },
];

const MODES = [
  {
    id: "endless" as const,
    name: "Endless",
    icon: "♾️",
    description: "Infinite play with AI-tuned difficulty",
    gradient: "from-blue-500 to-purple-500",
    borderColor: "border-blue-500/30",
    hoverBorder: "hover:border-blue-400/50",
  },
  {
    id: "daily" as const,
    name: "Daily Challenge",
    icon: "📅",
    description: "One board, one day — compete globally",
    gradient: "from-amber-500 to-orange-500",
    borderColor: "border-amber-500/30",
    hoverBorder: "hover:border-amber-400/50",
  },
  {
    id: "zen" as const,
    name: "Zen Mode",
    icon: "☀️",
    description: "No pressure, no game over — just flow",
    gradient: "from-emerald-500 to-teal-500",
    borderColor: "border-emerald-500/30",
    hoverBorder: "hover:border-emerald-400/50",
  },
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const profile = useQuery(api.game.getProfile);
  const globalLeaderboard = useQuery(api.game.getGlobalLeaderboard);
  const updateProfile = useMutation(api.game.updateProfile);

  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editAvatar, setEditAvatar] = useState("gem-ruby");

  useEffect(() => {
    if (profile) {
      setEditUsername(profile.username || "");
      setEditAvatar(profile.avatar || "gem-ruby");
    }
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handlePlayMode = (mode: string) => {
    navigate(`/play?mode=${mode}`);
  };

  const handleSaveProfile = async () => {
    await updateProfile({
      username: editUsername.trim() || undefined,
      avatar: editAvatar,
    });
    setShowProfileEditor(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-black">
              <span className="text-gradient">Block</span>Mind
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProfileEditor(true)}
              className="text-slate-300 hover:text-white hover:bg-white/10 gap-1.5 sm:gap-2 text-xs sm:text-sm"
            >
              <span className="text-base sm:text-lg">
                {profile
                  ? AVATARS.find((a) => a.id === profile.avatar)?.emoji || "💎"
                  : "💎"}
              </span>
              <span className="hidden sm:inline">
                {profile?.username || user?.name || "Player"}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-slate-400 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Stats Overview */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6 sm:mb-8"
          >
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4 text-center">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-amber-400" />
              <div className="text-xl sm:text-2xl font-bold tabular-nums">
                {(profile.highScore || 0).toLocaleString()}
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">
                High Score
              </div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4 text-center">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-orange-400" />
              <div className="text-xl sm:text-2xl font-bold tabular-nums">
                {profile.currentStreak || 0}
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">
                Day Streak
              </div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4 text-center">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-emerald-400" />
              <div className="text-xl sm:text-2xl font-bold tabular-nums">
                {profile.totalGamesPlayed || 0}
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">
                Games Played
              </div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4 text-center">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-purple-400" />
              <div className="text-xl sm:text-2xl font-bold tabular-nums">
                {Math.round(profile.skillRating || 35)}
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">
                Skill Rating
              </div>
            </div>
          </motion.div>
        )}

        {/* Game Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <h2 className="text-base sm:text-lg font-bold">Choose Your Mode</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handlePlayMode(mode.id)}
                className={`group relative rounded-2xl border ${mode.borderColor} ${mode.hoverBorder} bg-white/5 hover:bg-white/10 p-4 sm:p-6 text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${mode.gradient}`}
                />
                <span className="text-2xl sm:text-3xl mb-2 sm:mb-3 block">{mode.icon}</span>
                <h3 className="text-base sm:text-lg font-bold mb-0.5 sm:mb-1">{mode.name}</h3>
                <p className="text-xs sm:text-sm text-slate-400">{mode.description}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Leaderboard & Daily Challenge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Global Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold">Top Players</h2>
            </div>
            <Card className="bg-white/5 border-white/10 overflow-hidden">
              <CardContent className="p-0">
                {globalLeaderboard && globalLeaderboard.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {globalLeaderboard.slice(0, 10).map((entry) => (
                      <div
                        key={`${entry.username}-${entry.score}-${entry.rank}`}
                        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3"
                      >
                        <span
                          className={`w-5 sm:w-6 text-center font-bold text-xs sm:text-sm ${
                            entry.rank === 1
                              ? "text-amber-400"
                              : entry.rank === 2
                                ? "text-slate-300"
                                : entry.rank === 3
                                  ? "text-orange-400"
                                  : "text-slate-500"
                          }`}
                        >
                          {entry.rank <= 3
                            ? ["🥇", "🥈", "🥉"][entry.rank - 1]
                            : `#${entry.rank}`}
                        </span>
                        <span className="flex-1 text-xs sm:text-sm font-medium truncate">
                          {entry.username}
                        </span>
                        <span className="text-xs sm:text-sm font-bold tabular-nums text-amber-400">
                          {entry.score.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 sm:p-8 text-center text-xs sm:text-sm text-slate-400">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-30" />
                    No scores yet. Be the first!
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Daily Challenge Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold">Daily Challenge</h2>
            </div>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4 sm:p-6">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">
                    <span role="img" aria-label="calendar">
                      {"📅"}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2">Today&apos;s Challenge</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4">
                    Same board, same pieces for everyone. How high can you score?
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-amber-400 mb-3 sm:mb-4">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Resets at midnight UTC
                  </div>
                  <Button
                    onClick={() => handlePlayMode("daily")}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs sm:text-sm"
                  >
                    Play Today&apos;s Challenge
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Profile Editor Modal */}
      <AnimatePresence>
        {showProfileEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowProfileEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-slate-800 border border-slate-700 p-5 sm:p-6 shadow-2xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <h3 className="text-base sm:text-lg font-bold">Edit Profile</h3>
                <button
                  onClick={() => setShowProfileEditor(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                </button>
              </div>

              {/* Username */}
              <div className="mb-4 sm:mb-5">
                <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 sm:mb-2 block">
                  Username
                </label>
                <Input
                  value={editUsername}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditUsername(e.target.value)
                  }
                  placeholder="Enter username"
                  maxLength={20}
                  className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Avatar Picker */}
              <div className="mb-5 sm:mb-6">
                <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 sm:mb-2 block">
                  Avatar
                </label>
                <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => setEditAvatar(avatar.id)}
                      className={`relative flex items-center justify-center w-full aspect-square rounded-lg sm:rounded-xl text-lg sm:text-2xl transition-all ${
                        editAvatar === avatar.id
                          ? "bg-primary/20 border-2 border-primary scale-110"
                          : "bg-slate-900 border border-slate-600 hover:bg-slate-700"
                      }`}
                      title={avatar.label}
                    >
                      {avatar.emoji}
                      {editAvatar === avatar.id && (
                        <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowProfileEditor(false)}
                  className="flex-1 text-slate-300 hover:text-white hover:bg-white/10 text-xs sm:text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold text-xs sm:text-sm"
                >
                  Save Profile
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
