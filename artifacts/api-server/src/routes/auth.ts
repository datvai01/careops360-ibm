import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";
import { db, usersTable, pool } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

interface SessionData {
  user: Omit<typeof usersTable.$inferSelect, "passwordHash" | "createdAt">;
  loggedInAt: Date;
}

const sessions = new Map<string, SessionData>();

export function getSessionUser(authHeader: string | undefined): SessionData["user"] | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  const session = sessions.get(token);
  return session?.user ?? null;
}

async function ensureSessionLogsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_session_logs (
        id serial PRIMARY KEY,
        user_id text NOT NULL,
        username varchar(255) NOT NULL,
        login_at timestamp DEFAULT now() NOT NULL,
        logout_at timestamp,
        session_duration_seconds integer,
        token text NOT NULL
      )
    `);
  } catch {
    // non-critical
  }
}
ensureSessionLogsTable();

async function logLogin(userId: string, username: string, token: string): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO user_session_logs (user_id, username, token) VALUES ($1, $2, $3)`,
      [userId, username, token]
    );
  } catch {
    // non-critical
  }
}

async function logLogout(token: string): Promise<void> {
  try {
    await pool.query(
      `UPDATE user_session_logs
       SET logout_at = now(),
           session_duration_seconds = EXTRACT(EPOCH FROM (now() - login_at))::integer
       WHERE token = $1 AND logout_at IS NULL`,
      [token]
    );
  } catch {
    // non-critical
  }
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const { username, password } = req.body;

  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  if (!user.length || user[0].passwordHash !== password) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
    return;
  }

  const { passwordHash: _pw, createdAt: _ca, ...safeUser } = user[0];
  const token = `demo_token_${safeUser.id}_${Date.now()}`;

  sessions.set(token, { user: safeUser, loggedInAt: new Date() });
  await logLogin(safeUser.id, safeUser.username, token);

  logger.info({ username }, "login success");
  res.json({ user: safeUser, token });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized", message: "No token provided" });
    return;
  }

  const token = auth.split(" ")[1];
  const session = sessions.get(token);

  if (!session) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
    return;
  }

  res.json({ ...session.user, loginAt: session.loggedInAt.toISOString() });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    const token = auth.split(" ")[1];
    sessions.delete(token);
    await logLogout(token);
  }
  res.json({ success: true });
});

export default router;
