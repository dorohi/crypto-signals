import type { CoinData } from "./coin";

export interface AlertData {
  id: string;
  coinId: string;
  previousPrice: number;
  currentPrice: number;
  changePercent: number;
  threshold: number;
  notifiedViaTg: boolean;
  createdAt: string;
  coin: CoinData;
}
