import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
}

async function main() {
  console.log("Fetching top 100 coins from CoinGecko...");

  const response = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1"
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
  }

  const coins: CoinGeckoMarket[] = await response.json();
  console.log(`Fetched ${coins.length} coins`);

  for (const coin of coins) {
    await prisma.coin.upsert({
      where: { id: coin.id },
      update: {
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image,
        currentPrice: coin.current_price,
        marketCap: coin.market_cap,
        marketCapRank: coin.market_cap_rank,
        priceUpdatedAt: new Date(),
      },
      create: {
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image,
        currentPrice: coin.current_price,
        marketCap: coin.market_cap,
        marketCapRank: coin.market_cap_rank,
        priceUpdatedAt: new Date(),
      },
    });
  }

  console.log("Seeded top 100 coins successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
