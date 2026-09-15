// ============================================================
// BlockMind — Convex Game Functions
// ============================================================

import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ----- User Profile Queries -----

/** Get the current user's game profile. */
export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      id: user._id,
      username: user.username || user.name || "Player",
      avatar: user.avatar || "default",
      country: user.country,
      highScore: user.highScore || 0,
      totalGamesPlayed: user.totalGamesPlayed || 0,
      currentStreak: user.currentStreak || 0,
      bestStreak: user.bestStreak || 0,
      skillRating: user.skillRating || 35,
      avgClearRate: user.avgClearRate || 0,
      avgTimeToPlace: user.avgTimeToPlace || 0,
      lastPlayedDate: user.lastPlayedDate,
    };
  },
});

/** Update profile fields (username, avatar, country). */
export const updateProfile = mutation({
  args: {
    username: v.optional(v.string()),
    avatar: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const updates: Record<string, unknown> = {};
    if (args.username !== undefined) updates.username = args.username;
    if (args.avatar !== undefined) updates.avatar = args.avatar;
    if (args.country !== undefined) updates.country = args.country;
    await ctx.db.patch(userId, updates);
  },
});

/** Save game results after game over. */
export const saveGameResults = mutation({
  args: {
    score: v.number(),
    level: v.number(),
    linesCleared: v.number(),
    streak: v.number(),
    bestStreak: v.number(),
    gameMode: v.union(
      v.literal("endless"),
      v.literal("daily"),
      v.literal("zen")
    ),
    skillRating: v.number(),
    avgClearRate: v.number(),
    avgTimeToPlace: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const today = new Date().toISOString().split("T")[0];
    const lastPlayed = user.lastPlayedDate;

    // Calculate streak
    let newStreak = user.currentStreak || 0;
    if (lastPlayed) {
      const lastDate = new Date(lastPlayed);
      const todayDate = new Date(today);
      const diffDays = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
      // diffDays === 0 means same day, streak unchanged
    } else {
      newStreak = 1;
    }

    const newBestStreak = Math.max(user.bestStreak || 0, newStreak);
    const newHighScore = Math.max(user.highScore || 0, args.score);

    // Update user profile
    await ctx.db.patch(userId, {
      highScore: newHighScore,
      totalGamesPlayed: (user.totalGamesPlayed || 0) + 1,
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      lastPlayedDate: today,
      skillRating: args.skillRating,
      avgClearRate: args.avgClearRate,
      avgTimeToPlace: args.avgTimeToPlace,
    });

    // Add to global leaderboard
    await ctx.db.insert("globalScores", {
      userId,
      username: user.username || user.name || "Player",
      score: args.score,
      level: args.level,
      linesCleared: args.linesCleared,
    });

    // Add to daily leaderboard if daily mode
    if (args.gameMode === "daily") {
      await ctx.db.insert("dailyScores", {
        date: today,
        userId,
        username: user.username || user.name || "Player",
        score: args.score,
        linesCleared: args.linesCleared,
        streak: args.streak,
      });
    }

    return {
      newHighScore: args.score >= newHighScore,
      newStreak,
    };
  },
});

// ----- Leaderboard Queries -----

/** Get global endless leaderboard (top 100). */
export const getGlobalLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const scores = await ctx.db
      .query("globalScores")
      .withIndex("by_score")
      .order("desc")
      .take(100);

    return scores.map((s, i) => ({
      rank: i + 1,
      username: s.username,
      score: s.score,
      level: s.level,
      linesCleared: s.linesCleared,
    }));
  },
});

/** Get daily challenge leaderboard. */
export const getDailyLeaderboard = query({
  args: {
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const scores = await ctx.db
      .query("dailyScores")
      .withIndex("by_date_score", (q) => q.eq("date", args.date))
      .order("desc")
      .take(100);

    return scores.map((s, i) => ({
      rank: i + 1,
      username: s.username,
      score: s.score,
      linesCleared: s.linesCleared,
      streak: s.streak,
    }));
  },
});

/** Get today's daily challenge. Creates one if it doesn't exist. */
export const getTodayChallenge = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];

    let challenge = await ctx.db
      .query("dailyChallenges")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    if (!challenge) {
      // Generate a deterministic seed from the date
      let hash = 0;
      for (let i = 0; i < today.length; i++) {
        hash = ((hash << 5) - hash + today.charCodeAt(i)) | 0;
      }
      const boardSeed = Math.abs(hash);
      const pieceSeed = Math.abs(hash * 1664525 + 1013904223);

      // We'd insert via mutation, but in a query we can't write.
      // Return the generated values for the client to use.
      return {
        date: today,
        boardSeed,
        pieceSeed,
        pieceCount: 20,
        exists: false,
      };
    }

    return {
      date: challenge.date,
      boardSeed: challenge.boardSeed,
      pieceSeed: challenge.pieceSeed,
      pieceCount: challenge.pieceCount,
      exists: true,
    };
  },
});

/** Ensure today's challenge exists (call on first play of the day). */
export const ensureDailyChallenge = mutation({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];

    const existing = await ctx.db
      .query("dailyChallenges")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    if (existing) return existing;

    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash + today.charCodeAt(i)) | 0;
    }
    const boardSeed = Math.abs(hash);
    const pieceSeed = Math.abs(hash * 1664525 + 1013904223);

    const id = await ctx.db.insert("dailyChallenges", {
      date: today,
      boardSeed,
      pieceSeed,
      pieceCount: 20,
    });

    return await ctx.db.get(id);
  },
});
