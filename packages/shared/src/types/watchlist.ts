import type { CoinData } from "./coin";

export interface WatchlistItem {
  id: string;
  coinId: string;
  customThreshold: number | null;
  isActive: boolean;
  createdAt: string;
  coin: CoinData;
}

export interface AddToWatchlistRequest {
  coinId: string;
  customThreshold?: number;
}

export interface UpdateWatchlistItemRequest {
  customThreshold?: number | null;
  isActive?: boolean;
}
