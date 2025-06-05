import { eq } from "drizzle-orm";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase64url, encodeHexLowerCase } from "@oslojs/encoding";
import * as table from "../db/schema.js";
import { Session, User } from "../db/types.js";
import { db } from "@/db/index.js";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = "auth-session";

export async function validateSessionToken(token: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const [result] = await db
    .select({
      // Adjust users table here to tweak returned data
      users: { id: table.users.id, username: table.users.email },
      session: table.session,
    })
    .from(table.session)
    .innerJoin(table.users, eq(table.session.userId, table.users.id))
    .where(eq(table.session.id, sessionId));

  if (!result) {
    return { session: null, users: null };
  }
  const { session, users } = result;

  const sessionExpired = Date.now() >= session.expiresAt.getTime();
  if (sessionExpired) {
    await db.delete(table.session).where(eq(table.session.id, session.id));
    return { session: null, users: null };
  }

  const renewSession =
    Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
  if (renewSession) {
    session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
    await db
      .update(table.session)
      .set({ expiresAt: session.expiresAt })
      .where(eq(table.session.id, session.id));
  }

  return { session, users };
}

export type SessionValidationResult = Awaited<
  ReturnType<typeof validateSessionToken>
>;

export async function invalidateSession(sessionId: string) {
  await db.delete(table.session).where(eq(table.session.id, sessionId));
}
