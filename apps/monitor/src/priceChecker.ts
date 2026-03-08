import type { Bot } from "grammy";
import { prisma } from "@crypto-signals/db";
import { fetchCoinPrices } from "./coingecko";
import { sendAlertNotification } from "./notifier";

export async function checkPrices(bot: Bot): Promise<void> {
  console.log(`[${new Date().toISOString()}] Проверка цен...`);

  try {
    // 1. Get all distinct coin IDs that any user is watching
    const watchedCoins = await prisma.watchlistItem.findMany({
      where: { isActive: true },
      select: { coinId: true },
      distinct: ["coinId"],
    });

    const coinIds = watchedCoins.map((w) => w.coinId);
    if (coinIds.length === 0) {
      console.log("Нет отслеживаемых монет. Пропуск.");
      return;
    }

    console.log(`Получение цен для ${coinIds.length} монет...`);

    // 2. Fetch current prices from CoinGecko
    const marketData = await fetchCoinPrices(coinIds);

    // 3. For each coin, update price and check for alerts
    for (const data of marketData) {
      // Get previous price from the coin record
      const coin = await prisma.coin.findUnique({
        where: { id: data.id },
      });

      const previousPrice = coin?.currentPrice;

      // Update coin with latest price
      await prisma.coin.update({
        where: { id: data.id },
        data: {
          currentPrice: data.current_price,
          marketCap: data.market_cap,
          marketCapRank: data.market_cap_rank,
          image: data.image,
          priceUpdatedAt: new Date(),
        },
      });

      // Record price snapshot
      await prisma.priceSnapshot.create({
        data: {
          coinId: data.id,
          price: data.current_price,
        },
      });

      // Skip alert check if no previous price
      if (!previousPrice || previousPrice === 0) continue;

      // Calculate change percentage
      const changePercent =
        ((data.current_price - previousPrice) / previousPrice) * 100;

      // 4. Find all users watching this coin and check thresholds
      const watchers = await prisma.watchlistItem.findMany({
        where: { coinId: data.id, isActive: true },
        include: { user: true },
      });

      for (const watcher of watchers) {
        const threshold =
          watcher.customThreshold ?? watcher.user.defaultThreshold;

        if (Math.abs(changePercent) >= threshold) {
          // Create alert record
          const alert = await prisma.alert.create({
            data: {
              userId: watcher.userId,
              coinId: data.id,
              previousPrice,
              currentPrice: data.current_price,
              changePercent,
              threshold,
            },
          });

          // Send Telegram notification if user has linked account
          if (watcher.user.telegramChatId) {
            const sent = await sendAlertNotification(bot, {
              chatId: watcher.user.telegramChatId,
              coinName: data.name,
              coinSymbol: data.symbol,
              previousPrice,
              currentPrice: data.current_price,
              changePercent,
              threshold,
            });

            if (sent) {
              await prisma.alert.update({
                where: { id: alert.id },
                data: { notifiedViaTg: true },
              });
            }
          }

          console.log(
            `ОПОВЕЩЕНИЕ: ${data.symbol.toUpperCase()} изменился на ${changePercent.toFixed(2)}% ` +
              `(${previousPrice} -> ${data.current_price}) для пользователя ${watcher.user.email}`
          );
        }
      }
    }

    // 5. Cleanup old price snapshots (keep last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const deleted = await prisma.priceSnapshot.deleteMany({
      where: { recordedAt: { lt: sevenDaysAgo } },
    });
    if (deleted.count > 0) {
      console.log(`Очищено ${deleted.count} старых снимков цен.`);
    }

    console.log(`Проверка цен завершена. Проверено ${marketData.length} монет.`);
  } catch (error) {
    console.error("Ошибка проверки цен:", error);
  }
}