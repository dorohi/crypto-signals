import type { Bot } from "grammy";

interface AlertNotification {
  chatId: string;
  coinName: string;
  coinSymbol: string;
  previousPrice: number;
  currentPrice: number;
  changePercent: number;
  threshold: number;
}

function formatPrice(price: number): string {
  if (price >= 1) return `$${price.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${price.toPrecision(4)}`;
}

export async function sendAlertNotification(
  bot: Bot,
  alert: AlertNotification
): Promise<boolean> {
  const direction = alert.changePercent > 0 ? "ВВЕРХ" : "ВНИЗ";
  const emoji = alert.changePercent > 0 ? "\u{1F7E2}" : "\u{1F534}";
  const sign = alert.changePercent > 0 ? "+" : "";

  const message = [
    `${emoji} <b>${alert.coinName} (${alert.coinSymbol.toUpperCase()}) ${direction}</b>`,
    ``,
    `Цена: ${formatPrice(alert.previousPrice)} -> ${formatPrice(alert.currentPrice)}`,
    `Изменение: <b>${sign}${alert.changePercent.toFixed(2)}%</b>`,
    `Порог: ${alert.threshold}%`,
    ``,
    `<a href="https://www.coingecko.com/en/coins/${alert.coinName.toLowerCase().replace(/\s+/g, "-")}">Смотреть на CoinGecko</a>`,
  ].join("\n");

  try {
    await bot.api.sendMessage(alert.chatId, message, {
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    });
    return true;
  } catch (error) {
    console.error(
      `Не удалось отправить TG уведомление ${alert.chatId}:`,
      error
    );
    return false;
  }
}