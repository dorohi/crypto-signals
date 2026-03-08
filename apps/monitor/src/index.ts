import { config } from "./config";
import { createBot } from "./telegramBot";
import { checkPrices } from "./priceChecker";

async function main() {
  if (!config.telegramBotToken) {
    console.error("TELEGRAM_BOT_TOKEN обязателен. Укажите его в .env файле.");
    process.exit(1);
  }

  console.log("Запуск Крипто Сигналы Монитор...");
  console.log(`Интервал проверки: ${config.checkIntervalMs / 1000}с`);

  // Create and start Telegram bot
  const bot = createBot(config.telegramBotToken);

  bot.start({
    onStart: () => console.log("Telegram бот запущен."),
  });

  // Initial price check
  await checkPrices(bot);

  // Schedule recurring checks
  setInterval(() => checkPrices(bot), config.checkIntervalMs);

  // Graceful shutdown
  const shutdown = () => {
    console.log("Завершение работы...");
    bot.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error("Критическая ошибка:", error);
  process.exit(1);
});