import { session, users } from "./schema.js";

export type Session = typeof session.$inferSelect;
export type User = typeof users.$inferSelect;
