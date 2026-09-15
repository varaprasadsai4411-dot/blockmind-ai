import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove

      // BlockMind game fields
      username: v.optional(v.string()),
      avatar: v.optional(v.string()), // preset avatar id
      country: v.optional(v.string()), // country code
      highScore: v.optional(v.number()), // endless mode high score
      totalGamesPlayed: v.optional(v.number()),
      currentStreak: v.optional(v.number()), // days played in a row
      bestStreak: v.optional(v.number()), // best streak ever
      lastPlayedDate: v.optional(v.string()), // ISO date string
      skillRating: v.optional(v.number()), // adaptive difficulty rating 0-100
      avgClearRate: v.optional(v.number()),
      avgTimeToPlace: v.optional(v.number()),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Daily challenge board and piece sequence
    dailyChallenges: defineTable({
      date: v.string(), // YYYY-MM-DD
      boardSeed: v.number(), // seed for board generation
      pieceSeed: v.number(), // seed for piece sequence
      pieceCount: v.number(), // number of pieces in sequence (20)
    }).index("by_date", ["date"]),

    // Daily challenge scores
    dailyScores: defineTable({
      date: v.string(), // YYYY-MM-DD
      userId: v.id("users"),
      username: v.optional(v.string()),
      score: v.number(),
      linesCleared: v.number(),
      streak: v.number(),
    }).index("by_date_score", ["date", "score"]),
    // Query a user's score for a specific day
    // .index("by_date_user", ["date", "userId"])

    // Global endless leaderboard
    globalScores: defineTable({
      userId: v.id("users"),
      username: v.optional(v.string()),
      score: v.number(),
      level: v.number(),
      linesCleared: v.number(),
    }).index("by_score", ["score"]),

    // add other tables here

    // tableName: defineTable({
    //   ...
    //   // table fields
    // }).index("by_field", ["field"])
  },
  {
    schemaValidation: false,
  },
);

export default schema;
