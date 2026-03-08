import { Router } from "express";
import { prisma } from "@crypto-signals/db";
import { hashPassword, comparePassword, signToken, requireAuth } from "../auth.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Необходимо указать эл. почту и пароль" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Неверные учётные данные" });
      return;
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Неверные учётные данные" });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        defaultThreshold: user.defaultThreshold,
        telegramChatId: user.telegramChatId,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

authRouter.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: "Необходимо указать эл. почту, пароль и имя" });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Эл. почта уже зарегистрирована" });
      return;
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    const topCoins = await prisma.coin.findMany({
      where: { marketCapRank: { not: null } },
      orderBy: { marketCapRank: "asc" },
      take: 100,
      select: { id: true },
    });

    if (topCoins.length > 0) {
      await prisma.watchlistItem.createMany({
        data: topCoins.map((coin) => ({
          userId: user.id,
          coinId: coin.id,
        })),
      });
    }

    const token = signToken({ userId: user.id, email: user.email });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        defaultThreshold: user.defaultThreshold,
        telegramChatId: user.telegramChatId,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({ error: error?.message || "Внутренняя ошибка сервера" });
  }
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const auth = (req as any).auth;

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      email: true,
      name: true,
      defaultThreshold: true,
      telegramChatId: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ error: "Пользователь не найден" });
    return;
  }

  res.json({ ...user, createdAt: user.createdAt.toISOString() });
});
