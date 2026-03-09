import { Router } from "express";
import { prisma } from "@crypto-signals/db";
import { requireAuth } from "../auth.js";

export const watchlistRouter = Router();

watchlistRouter.use(requireAuth);

watchlistRouter.get("/", async (req, res) => {
  const auth = (req as any).auth;

  const items = await prisma.watchlistItem.findMany({
    where: { userId: auth.userId },
    include: { coin: true },
    orderBy: { coin: { marketCapRank: "asc" } },
  });

  res.json({ data: items });
});

watchlistRouter.post("/", async (req, res) => {
  const auth = (req as any).auth;

  try {
    const { coinId, customThreshold } = req.body;

    if (!coinId) {
      res.status(400).json({ error: "Необходимо указать coinId" });
      return;
    }

    let coin = await prisma.coin.findUnique({ where: { id: coinId } });
    if (!coin) {
      // Монеты нет в БД — попробуем получить из CoinGecko и создать
      try {
        const cgRes = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
        );
        if (!cgRes.ok) {
          res.status(404).json({ error: "Монета не найдена" });
          return;
        }
        const cgData = await cgRes.json();
        coin = await prisma.coin.create({
          data: {
            id: cgData.id,
            symbol: cgData.symbol,
            name: cgData.name,
            image: cgData.image?.large || cgData.image?.small || null,
            currentPrice: cgData.market_data?.current_price?.usd || null,
            marketCap: cgData.market_data?.market_cap?.usd || null,
            marketCapRank: cgData.market_data?.market_cap_rank || null,
            priceUpdatedAt: new Date(),
          },
        });
      } catch {
        res.status(404).json({ error: "Монета не найдена" });
        return;
      }
    }

    const existing = await prisma.watchlistItem.findUnique({
      where: { userId_coinId: { userId: auth.userId, coinId } },
    });
    if (existing) {
      res.status(409).json({ error: "Монета уже в списке наблюдения" });
      return;
    }

    const item = await prisma.watchlistItem.create({
      data: {
        userId: auth.userId,
        coinId,
        customThreshold: customThreshold ?? null,
      },
      include: { coin: true },
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("Add to watchlist error:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

watchlistRouter.put("/:id", async (req, res) => {
  const auth = (req as any).auth;
  const { id } = req.params;
  const { customThreshold, customPeriodMinutes, isActive } = req.body;

  const item = await prisma.watchlistItem.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!item) {
    res.status(404).json({ error: "Элемент списка наблюдения не найден" });
    return;
  }

  const updated = await prisma.watchlistItem.update({
    where: { id },
    data: {
      ...(customThreshold !== undefined && { customThreshold }),
      ...(customPeriodMinutes !== undefined && { customPeriodMinutes }),
      ...(isActive !== undefined && { isActive }),
    },
    include: { coin: true },
  });

  res.json(updated);
});

watchlistRouter.delete("/:id", async (req, res) => {
  const auth = (req as any).auth;
  const { id } = req.params;

  const item = await prisma.watchlistItem.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!item) {
    res.status(404).json({ error: "Элемент списка наблюдения не найден" });
    return;
  }

  await prisma.watchlistItem.delete({ where: { id } });
  res.json({ success: true });
});
