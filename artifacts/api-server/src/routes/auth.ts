import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const DEMO_USERS = [
  {
    id: "1",
    username: "exec@horizon.com",
    password: "demo123",
    name: "Sarah Mitchell",
    role: "executive" as const,
    email: "exec@horizon.com",
    avatar: "SM",
    title: "Chief Executive Officer",
  },
  {
    id: "2",
    username: "ops@horizon.com",
    password: "demo123",
    name: "Michael Torres",
    role: "operations" as const,
    email: "ops@horizon.com",
    avatar: "MT",
    title: "VP Operations",
  },
  {
    id: "3",
    username: "it@horizon.com",
    password: "demo123",
    name: "Jennifer Chen",
    role: "it" as const,
    email: "it@horizon.com",
    avatar: "JC",
    title: "Chief Information Officer",
  },
  {
    id: "4",
    username: "ibm@horizon.com",
    password: "demo123",
    name: "David Kumar",
    role: "ibm_delivery" as const,
    email: "ibm@horizon.com",
    avatar: "DK",
    title: "IBM AMS Delivery Manager",
  },
];

const sessions = new Map<string, (typeof DEMO_USERS)[0]>();

router.post("/auth/login", async (req, res): Promise<void> => {
  const { username, password } = req.body;

  const user = DEMO_USERS.find(
    (u) => u.username === username && u.password === password,
  );

  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
    return;
  }

  const token = `demo_token_${user.id}_${Date.now()}`;
  sessions.set(token, user);

  const { password: _pw, ...safeUser } = user;

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

  const { password: _pw, ...safeUser } = user;
  res.json(safeUser);
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    const token = auth.split(" ")[1];
    sessions.delete(token);
  }
  res.json({ success: true });
});

export default router;
