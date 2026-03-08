import "dotenv/config";

export const config = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  checkIntervalMs: parseInt(process.env.CHECK_INTERVAL_MS || "60000"),
  defaultThreshold: parseFloat(process.env.DEFAULT_THRESHOLD_PERCENT || "10"),
};
