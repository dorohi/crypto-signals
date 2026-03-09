import { Router } from "express";
import { prisma } from "@crypto-signals/db";
import { requireAuth } from "../auth.js";

export const coinsRouter = Router();

// Простой in-memory кеш
const cache = new Map<string, { data: any; expiresAt: number }>();

async function cachedFetch(url: string, ttlSeconds: number): Promise<any> {
  const cached = cache.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const response = await fetch(url);
  if (response.status === 429) {
    // Если rate limited и есть старый кеш — вернуть его
    if (cached) return cached.data;
    throw new Error("429");
  }
  if (!response.ok) {
    throw new Error(`${response.status}`);
  }

  const data = await response.json();
  cache.set(url, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
  return data;
}

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

// Детальная информация о монете (кеш 5 мин)
coinsRouter.get("/:id/details", requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const data = await cachedFetch(
      `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=true&developer_data=false`,
      300
    );
    res.json(data);
  } catch (error: any) {
    res.status(error.message === "429" ? 429 : 500).json({ error: `CoinGecko: ${error.message}` });
  }
});

// История цен для графика (кеш 2 мин)
coinsRouter.get("/:id/chart", requireAuth, async (req, res) => {
  const { id } = req.params;
  const days = req.query.days || "7";
  try {
    const data = await cachedFetch(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
      120
    );
    res.json(data);
  } catch (error: any) {
    res.status(error.message === "429" ? 429 : 500).json({ error: `CoinGecko: ${error.message}` });
  }
});

// OHLC свечи (кеш 2 мин)
coinsRouter.get("/:id/ohlc", requireAuth, async (req, res) => {
  const { id } = req.params;
  const days = req.query.days || "7";
  try {
    const data = await cachedFetch(
      `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=${days}`,
      120
    );
    res.json(data);
  } catch (error: any) {
    res.status(error.message === "429" ? 429 : 500).json({ error: `CoinGecko: ${error.message}` });
  }
});
