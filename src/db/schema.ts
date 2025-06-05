import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  age: integer("age"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

// Games table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  status: text("status", { enum: ["waiting", "in_progress", "completed"] })
    .notNull()
    .default("waiting"),
  winnerId: integer("winner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Game players table (for tracking players in each game)
export const gamePlayers = pgTable("game_players", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id")
    .references(() => games.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  score: integer("score").default(0).notNull(),
  isReady: boolean("is_ready").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Game moves table (for tracking moves in each game)
export const gameMoves = pgTable("game_moves", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id")
    .references(() => games.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  move: text("move", { enum: ["rock", "paper", "scissors"] }).notNull(),
  round: integer("round").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
