import { Router } from "express";
import { prisma } from "@crypto-signals/db";
import { requireAuth } from "../auth.js";

export const alertsRouter = Router();

alertsRouter.get("/", requireAuth, async (req, res) => {
  const auth = (req as any).auth;
  const page = parseInt((req.query.page as string) || "1");
  const limit = parseInt((req.query.limit as string) || "50");
  const skip = (page - 1) * limit;

  const [alerts, total] = await Promise.all([
    prisma.alert.findMany({
      where: { userId: auth.userId },
      include: { coin: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.alert.count({ where: { userId: auth.userId } }),
  ]);

  res.json({ data: alerts, total, page, limit });
});
