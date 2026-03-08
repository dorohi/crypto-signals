import { Bot } from "grammy";
import { prisma } from "@crypto-signals/db";

export function createBot(token: string): Bot {
  const bot = new Bot(token);

  bot.command("start", async (ctx) => {
    await ctx.reply(
      "Добро пожаловать в Крипто Сигналы Бот!\n\n" +
        "Чтобы привязать аккаунт, сгенерируйте код в веб-приложении и отправьте:\n" +
        "/link ВАШ_КОД\n\n" +
        "Команды:\n" +
        "/link <код> - Привязать аккаунт\n" +
        "/status - Просмотреть список наблюдения\n" +
        "/unlink - Отвязать аккаунт"
    );
  });

  bot.command("link", async (ctx) => {
    const code = ctx.match?.trim().toUpperCase();
    if (!code) {
      await ctx.reply("Использование: /link ВАШ_КОД");
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        telegramLinkCode: code,
        telegramLinkExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      await ctx.reply("Неверный или истёкший код. Сгенерируйте новый в веб-приложении.");
      return;
    }

    const chatId = ctx.chat.id.toString();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        telegramChatId: chatId,
        telegramLinkCode: null,
        telegramLinkExpiresAt: null,
      },
    });

    await ctx.reply(
      `Аккаунт успешно привязан! Привет, ${user.name}.\n` +
        "Теперь вы будете получать уведомления о ценовых изменениях здесь."
    );
  });

  bot.command("status", async (ctx) => {
    const chatId = ctx.chat.id.toString();
    const user = await prisma.user.findUnique({
      where: { telegramChatId: chatId },
      include: {
        watchlistItems: {
          where: { isActive: true },
          include: { coin: true },
          take: 10,
          orderBy: { coin: { marketCapRank: "asc" } },
        },
      },
    });

    if (!user) {
      await ctx.reply("Ваш аккаунт не привязан. Используйте /link <код> для привязки.");
      return;
    }

    const totalItems = await prisma.watchlistItem.count({
      where: { userId: user.id, isActive: true },
    });

    const lines = user.watchlistItems.map((item) => {
      const price = item.coin.currentPrice
        ? `$${item.coin.currentPrice.toLocaleString("ru-RU")}`
        : "Н/Д";
      const threshold = item.customThreshold ?? user.defaultThreshold;
      return `${item.coin.symbol.toUpperCase()} - ${price} (порог: ${threshold}%)`;
    });

    await ctx.reply(
      `Отслеживается ${totalItems} монет (порог: ${user.defaultThreshold}%)\n\n` +
        `Топ 10:\n${lines.join("\n")}` +
        (totalItems > 10 ? `\n\n...и ещё ${totalItems - 10}` : "")
    );
  });

  bot.command("unlink", async (ctx) => {
    const chatId = ctx.chat.id.toString();
    const user = await prisma.user.findUnique({
      where: { telegramChatId: chatId },
    });

    if (!user) {
      await ctx.reply("Ваш аккаунт не привязан.");
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { telegramChatId: null },
    });

    await ctx.reply("Аккаунт отвязан. Вы больше не будете получать уведомления.");
  });

  return bot;
}