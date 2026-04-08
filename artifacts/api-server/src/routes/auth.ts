import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const sessions = new Map<string, Omit<typeof usersTable.$inferSelect, "passwordHash" | "createdAt">>();

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
  sessions.set(token, safeUser);

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
  const user = sessions.get(token);

  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
    return;
  }

  res.json(user);
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    sessions.delete(auth.split(" ")[1]);
  }
  res.json({ success: true });
});

export default router;
