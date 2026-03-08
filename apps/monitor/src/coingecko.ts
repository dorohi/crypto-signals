interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
}

const BASE_URL = "https://api.coingecko.com/api/v3";

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url);

    if (response.ok) return response;

    if (response.status === 429) {
      const waitMs = Math.pow(2, i) * 10_000; // 10s, 20s, 40s
      console.log(`Превышен лимит запросов, ожидание ${waitMs / 1000}с...`);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }

    throw new Error(`Ошибка CoinGecko API: ${response.status}`);
  }

  throw new Error("CoinGecko API: превышено максимальное число попыток");
}

export async function fetchCoinPrices(
  coinIds: string[]
): Promise<CoinMarketData[]> {
  if (coinIds.length === 0) return [];

  const allResults: CoinMarketData[] = [];

  // CoinGecko allows up to 250 IDs per request
  const batchSize = 250;
  for (let i = 0; i < coinIds.length; i += batchSize) {
    const batch = coinIds.slice(i, i + batchSize);
    const ids = batch.join(",");
    const url = `${BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=${batchSize}&page=1`;

    const response = await fetchWithRetry(url);
    const data: CoinMarketData[] = await response.json();
    allResults.push(...data);

    // Small delay between batches
    if (i + batchSize < coinIds.length) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  return allResults;
}

export async function searchCoins(query: string): Promise<CoinMarketData[]> {
  const url = `${BASE_URL}/search?query=${encodeURIComponent(query)}`;
  const response = await fetchWithRetry(url);
  const data = await response.json();
  return data.coins || [];
}