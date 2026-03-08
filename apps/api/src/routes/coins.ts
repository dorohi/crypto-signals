import { Router } from "express";
import { prisma } from "@crypto-signals/db";
import { requireAuth } from "../auth.js";

export const coinsRouter = Router();

coinsRouter.get("/", requireAuth, async (req, res) => {
  const page = parseInt((req.query.page as string) || "1");
  const limit = parseInt((req.query.limit as string) || "100");
  const skip = (page - 1) * limit;

  const [coins, total] = await Promise.all([
    prisma.coin.findMany({
      orderBy: { marketCapRank: "asc" },
      skip,
      take: limit,
    }),
    prisma.coin.count(),
  ]);

  res.json({ data: coins, total, page, limit });
});

coinsRouter.get("/search", requireAuth, async (req, res) => {
  const query = (req.query.q as string) || "";
  if (query.length < 1) {
    res.json({ data: [] });
    return;
  }

  const coins = await prisma.coin.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { symbol: { contains: query } },
        { id: { contains: query } },
      ],
    },
    orderBy: { marketCapRank: "asc" },
    take: 20,
  });

  res.json({ data: coins });
});
