import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  player1Id: text("player1_id").notNull(),
  player2Id: text("player2_id").notNull(),
  player1Move: text("player1_move").$type<"rock" | "paper" | "scissors">(),
  player2Move: text("player2_move").$type<"rock" | "paper" | "scissors">(),
  winnerId: text("winner_id"),
  result: text("result").$type<"win" | "lose" | "draw">(),
  playedAt: timestamp("played_at", { withTimezone: true }).defaultNow(),
});
