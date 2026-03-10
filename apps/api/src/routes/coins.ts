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

  // Сначала ищем в нашей БД
  const local = await prisma.coin.findMany({
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

  // Если нашли достаточно — отдаём
  if (local.length >= 5) {
    res.json({ data: local });
    return;
  }

  // Иначе дополняем из CoinGecko
  try {
    const cgRes = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
    if (cgRes.ok) {
      const cgData = await cgRes.json();
      const cgCoins = (cgData.coins || []).slice(0, 10);

      const localIds = new Set(local.map((c) => c.id));
      const extra = cgCoins
        .filter((c: any) => !localIds.has(c.id))
        .map((c: any) => ({
          id: c.id,
          symbol: c.symbol,
          name: c.name,
          image: c.large || c.thumb || null,
          currentPrice: null,
          marketCap: null,
          marketCapRank: c.market_cap_rank || null,
        }));

      res.json({ data: [...local, ...extra] });
      return;
    }
  } catch { /* fallback to local */ }

  res.json({ data: local });
});

// Снапшоты из нашей БД (для графиков)
coinsRouter.get("/:id/snapshots", requireAuth, async (req, res) => {
  const id = req.params.id as string;
  const minutesParam = req.query.minutes as string | undefined;
  const minutes = minutesParam ? parseInt(minutesParam) : undefined;

  const where: any = { coinId: id };
  if (minutes) {
    where.recordedAt = { gte: new Date(Date.now() - minutes * 60 * 1000) };
  }

  const snapshots = await prisma.priceSnapshot.findMany({
    where,
    orderBy: { recordedAt: "asc" },
    select: { price: true, recordedAt: true },
  });

  res.json({ data: snapshots });
});

// Спарклайны для списка монет (batch)
coinsRouter.post("/sparklines", requireAuth, async (req, res) => {
  const { coinIds, minutes = 60 } = req.body;
  if (!Array.isArray(coinIds) || coinIds.length === 0) {
    res.json({ data: {} });
    return;
  }

  const since = new Date(Date.now() - minutes * 60 * 1000);

  const snapshots = await prisma.priceSnapshot.findMany({
    where: { coinId: { in: coinIds }, recordedAt: { gte: since } },
    orderBy: { recordedAt: "asc" },
    select: { coinId: true, price: true },
  });

  // Группируем по coinId, оставляем только массив цен
  const result: Record<string, number[]> = {};
  for (const s of snapshots) {
    if (!result[s.coinId]) result[s.coinId] = [];
    result[s.coinId].push(s.price);
  }

  res.json({ data: result });
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
