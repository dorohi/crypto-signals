export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string | null;
  currentPrice: number | null;
  marketCap: number | null;
  marketCapRank: number | null;
  priceUpdatedAt: string | null;
}
