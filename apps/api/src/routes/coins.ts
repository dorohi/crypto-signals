import { Router } from "express";
import { prisma } from "@crypto-signals/db";
import { requireAuth } from "../auth.js";

export const coinsRouter = Router();

// Кеш для деталей монет (1 час)
const detailsCache = new Map<string, { data: any; expiresAt: number }>();

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

// Снапшоты из нашей БД (для графиков)
coinsRouter.get("/:id/snapshots", requireAuth, async (req, res) => {
  const { id } = req.params;
  const minutes = parseInt((req.query.minutes as string) || "60");
  const since = new Date(Date.now() - minutes * 60 * 1000);

  const snapshots = await prisma.priceSnapshot.findMany({
    where: { coinId: id, recordedAt: { gte: since } },
    orderBy: { recordedAt: "asc" },
    select: { price: true, recordedAt: true },
  });

  res.json({ data: snapshots });
});

// Детальная информация о монете (кеш 1 час)
coinsRouter.get("/:id/details", requireAuth, async (req, res) => {
  const { id } = req.params;

  const cached = detailsCache.get(id);
  if (cached && cached.expiresAt > Date.now()) {
    res.json(cached.data);
    return;
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=true&developer_data=false`
    );

    if (response.status === 429) {
      // Rate limited — вернуть старый кеш если есть
      if (cached) {
        res.json(cached.data);
        return;
      }
      res.status(429).json({ error: "Слишком много запросов, попробуйте позже" });
      return;
    }

    if (!response.ok) {
      res.status(response.status).json({ error: `CoinGecko: ${response.status}` });
      return;
    }

    const data = await response.json();
    detailsCache.set(id, { data, expiresAt: Date.now() + 3600_000 }); // 1 час
    res.json(data);
  } catch (error) {
    if (cached) {
      res.json(cached.data);
      return;
    }
    res.status(500).json({ error: "Ошибка получения данных монеты" });
  }
});
