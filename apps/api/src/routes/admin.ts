import { Router } from "express";
import { prisma } from "@crypto-signals/db";
import { requireAuth, requireAdmin, hashPassword } from "../auth.js";

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

adminRouter.get("/users", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        telegramChatId: true,
        createdAt: true,
        _count: {
          select: {
            watchlistItems: true,
            alerts: true,
            portfolioTransactions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        isAdmin: u.isAdmin,
        telegramLinked: !!u.telegramChatId,
        createdAt: u.createdAt.toISOString(),
        stats: {
          watchlist: u._count.watchlistItems,
          alerts: u._count.alerts,
          transactions: u._count.portfolioTransactions,
        },
      })),
    });
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

adminRouter.put("/users/:id/password", async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || typeof password !== "string" || password.length < 6) {
      res.status(400).json({ error: "Пароль должен быть не менее 6 символов" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({ where: { id }, data: { passwordHash } });

    res.json({ success: true });
  } catch (error) {
    console.error("Admin change password error:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

adminRouter.put("/users/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;
    const auth = (req as any).auth;

    if (typeof isAdmin !== "boolean") {
      res.status(400).json({ error: "isAdmin должен быть boolean" });
      return;
    }

    if (auth.userId === id && !isAdmin) {
      res.status(400).json({ error: "Нельзя снять права администратора у себя" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isAdmin },
      select: { id: true, isAdmin: true },
    });

    res.json(updated);
  } catch (error) {
    console.error("Admin toggle role error:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});
