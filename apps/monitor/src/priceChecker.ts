import type { Bot } from "grammy";
import { prisma } from "@crypto-signals/db";
import { fetchCoinPrices } from "./coingecko";
import { sendAlertNotification } from "./notifier";

export async function checkPrices(bot: Bot): Promise<void> {
  console.log(`[${new Date().toISOString()}] Проверка цен...`);

  try {
    // 1. Все уникальные монеты которые кто-то отслеживает
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

    // 2. Получить текущие цены с CoinGecko
    const marketData = await fetchCoinPrices(coinIds);

    // 3. Обновить цены и сохранить снапшоты
    for (const data of marketData) {
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

      await prisma.priceSnapshot.create({
        data: {
          coinId: data.id,
          price: data.current_price,
        },
      });
    }

    // 4. Для каждого пользователя — проверить пороги за его период
    const users = await prisma.user.findMany({
      where: {
        watchlistItems: { some: { isActive: true } },
      },
      include: {
        watchlistItems: {
          where: { isActive: true },
          select: { coinId: true, customThreshold: true, customPeriodMinutes: true, id: true },
        },
      },
    });

    for (const user of users) {
      for (const item of user.watchlistItems) {
        const coinData = marketData.find((d) => d.id === item.coinId);
        if (!coinData) continue;

        const periodMinutes = item.customPeriodMinutes ?? user.checkPeriodMinutes;
        const periodAgo = new Date(Date.now() - periodMinutes * 60 * 1000);

        // Все снапшоты за период
        const snapshots = await prisma.priceSnapshot.findMany({
          where: {
            coinId: item.coinId,
            recordedAt: { gte: periodAgo },
          },
          select: { price: true },
        });

        if (snapshots.length === 0) continue;

        const prices = snapshots.map((s) => s.price);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const currentPrice = coinData.current_price;
        const threshold = item.customThreshold ?? user.defaultThreshold;

        // Падение: сравниваем текущую цену с MAX за период
        const dropPercent = maxPrice > 0
          ? ((currentPrice - maxPrice) / maxPrice) * 100
          : 0;

        // Рост: сравниваем текущую цену с MIN за период
        const risePercent = minPrice > 0
          ? ((currentPrice - minPrice) / minPrice) * 100
          : 0;

        // Выбираем самое значительное изменение
        let changePercent = 0;
        let referencePrice = 0;

        if (Math.abs(dropPercent) >= Math.abs(risePercent)) {
          changePercent = dropPercent;
          referencePrice = maxPrice;
        } else {
          changePercent = risePercent;
          referencePrice = minPrice;
        }

        const isUp = changePercent > 0;
        const isDown = changePercent < 0;
        const directionAllowed =
          (isUp && user.alertOnUp) || (isDown && user.alertOnDown);

        if (directionAllowed && Math.abs(changePercent) >= threshold) {
          // Проверить что не отправляли алерт за последний период для этой монеты
          const recentAlert = await prisma.alert.findFirst({
            where: {
              userId: user.id,
              coinId: item.coinId,
              createdAt: { gte: periodAgo },
            },
          });

          if (recentAlert) continue; // уже отправляли

          const alert = await prisma.alert.create({
            data: {
              userId: user.id,
              coinId: item.coinId,
              previousPrice: referencePrice,
              currentPrice: currentPrice,
              changePercent,
              threshold,
            },
          });

          if (user.telegramChatId) {
            const sent = await sendAlertNotification(bot, {
              chatId: user.telegramChatId,
              coinName: coinData.name,
              coinSymbol: coinData.symbol,
              previousPrice: referencePrice,
              currentPrice: currentPrice,
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
            `ОПОВЕЩЕНИЕ: ${coinData.symbol.toUpperCase()} изменился на ${changePercent.toFixed(2)}% ` +
              `за ${user.checkPeriodMinutes} мин (${referencePrice} -> ${currentPrice}) ` +
              `для ${user.email}`
          );
        }
      }
    }

    // 5. Очистка старых снапшотов (хранить 7 дней)
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
