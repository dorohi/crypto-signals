import { Router } from "express";
import { prisma } from "@crypto-signals/db";
import { requireAuth } from "../auth.js";

export const portfolioRouter = Router();

portfolioRouter.use(requireAuth);

// Сводка портфеля — позиции с расчётами
portfolioRouter.get("/", async (req, res) => {
  const auth = (req as any).auth;

  try {
    const transactions = await prisma.portfolioTransaction.findMany({
      where: { userId: auth.userId },
      include: { coin: true },
      orderBy: { date: "desc" },
    });

    // Группируем транзакции по монете
    const coinMap = new Map<string, { coin: any; buys: any[]; sells: any[] }>();

    for (const tx of transactions) {
      if (!coinMap.has(tx.coinId)) {
        coinMap.set(tx.coinId, { coin: tx.coin, buys: [], sells: [] });
      }
      const entry = coinMap.get(tx.coinId)!;
      if (tx.type === "buy") {
        entry.buys.push(tx);
      } else {
        entry.sells.push(tx);
      }
    }

    const positions = [];
    let totalValue = 0;
    let totalInvested = 0;

    for (const [coinId, { coin, buys, sells }] of coinMap) {
      const buyQty = buys.reduce((s, t) => s + t.quantity, 0);
      const sellQty = sells.reduce((s, t) => s + t.quantity, 0);
      const holdings = buyQty - sellQty;

      const buyValue = buys.reduce((s, t) => s + t.quantity * t.price, 0);
      const sellValue = sells.reduce((s, t) => s + t.quantity * t.price, 0);
      const totalFees = [...buys, ...sells].reduce((s, t) => s + t.fee, 0);
      const invested = buyValue - sellValue + totalFees;

      const avgBuyPrice = buyQty > 0 ? buyValue / buyQty : 0;
      const currentPrice = coin.currentPrice || 0;
      const currentValue = holdings * currentPrice;
      const pnl = currentValue - invested;
      const pnlPercent = invested !== 0 ? (pnl / Math.abs(invested)) * 100 : 0;

      positions.push({
        coinId,
        coin,
        holdings,
        avgBuyPrice,
        totalInvested: invested,
        currentPrice,
        currentValue,
        pnl,
        pnlPercent,
        transactionCount: buys.length + sells.length,
      });

      totalValue += currentValue;
      totalInvested += invested;
    }

    // Сортируем по текущей стоимости позиции
    positions.sort((a, b) => b.currentValue - a.currentValue);

    const totalPnl = totalValue - totalInvested;
    const totalPnlPercent = totalInvested !== 0 ? (totalPnl / Math.abs(totalInvested)) * 100 : 0;

    // Лучший и худший актив
    const withHoldings = positions.filter((p) => p.holdings > 0);
    const best = withHoldings.length > 0
      ? withHoldings.reduce((a, b) => (a.pnlPercent > b.pnlPercent ? a : b))
      : null;
    const worst = withHoldings.length > 0
      ? withHoldings.reduce((a, b) => (a.pnlPercent < b.pnlPercent ? a : b))
      : null;

    res.json({
      summary: {
        totalValue,
        totalInvested,
        totalPnl,
        totalPnlPercent,
        best: best ? { name: best.coin.name, symbol: best.coin.symbol, pnlPercent: best.pnlPercent } : null,
        worst: worst ? { name: worst.coin.name, symbol: worst.coin.symbol, pnlPercent: worst.pnlPercent } : null,
      },
      positions,
    });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// Транзакции по монете
portfolioRouter.get("/:coinId/transactions", async (req, res) => {
  const auth = (req as any).auth;
  const { coinId } = req.params;

  const transactions = await prisma.portfolioTransaction.findMany({
    where: { userId: auth.userId, coinId },
    include: { coin: true },
    orderBy: { date: "desc" },
  });

  res.json({ data: transactions });
});

// Добавить транзакцию
portfolioRouter.post("/", async (req, res) => {
  const auth = (req as any).auth;

  try {
    const { coinId, type, quantity, price, fee, note, date } = req.body;

    if (!coinId || !type || !quantity || !price) {
      res.status(400).json({ error: "Обязательные поля: coinId, type, quantity, price" });
      return;
    }

    if (!["buy", "sell"].includes(type)) {
      res.status(400).json({ error: "Тип должен быть buy или sell" });
      return;
    }

    // Проверяем что монета существует, если нет — создаём из CoinGecko
    let coin = await prisma.coin.findUnique({ where: { id: coinId } });
    if (!coin) {
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

    const transaction = await prisma.portfolioTransaction.create({
      data: {
        userId: auth.userId,
        coinId,
        type,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        fee: fee ? parseFloat(fee) : 0,
        note: note || null,
        date: date ? new Date(date) : new Date(),
      },
      include: { coin: true },
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Add transaction error:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// Обновить транзакцию
portfolioRouter.put("/:id", async (req, res) => {
  const auth = (req as any).auth;
  const { id } = req.params;
  const { type, quantity, price, fee, note, date } = req.body;

  const tx = await prisma.portfolioTransaction.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!tx) {
    res.status(404).json({ error: "Транзакция не найдена" });
    return;
  }

  const updated = await prisma.portfolioTransaction.update({
    where: { id },
    data: {
      ...(type !== undefined && { type }),
      ...(quantity !== undefined && { quantity: parseFloat(quantity) }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(fee !== undefined && { fee: parseFloat(fee) }),
      ...(note !== undefined && { note: note || null }),
      ...(date !== undefined && { date: new Date(date) }),
    },
    include: { coin: true },
  });

  res.json(updated);
});

// Удалить транзакцию
portfolioRouter.delete("/:id", async (req, res) => {
  const auth = (req as any).auth;
  const { id } = req.params;

  const tx = await prisma.portfolioTransaction.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!tx) {
    res.status(404).json({ error: "Транзакция не найдена" });
    return;
  }

  await prisma.portfolioTransaction.delete({ where: { id } });
  res.json({ success: true });
});

// Удалить все транзакции по монете
portfolioRouter.delete("/coin/:coinId", async (req, res) => {
  const auth = (req as any).auth;
  const { coinId } = req.params;

  await prisma.portfolioTransaction.deleteMany({
    where: { userId: auth.userId, coinId },
  });

  res.json({ success: true });
});
