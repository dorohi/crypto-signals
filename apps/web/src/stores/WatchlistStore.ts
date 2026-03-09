import { makeAutoObservable, runInAction } from "mobx";
import { api } from "@/services/api";

export class WatchlistStore {
  items: any[] = [];
  total = 0;
  page = 1;
  limit = 20;
  loading = false;
  initialized = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchWatchlist(page = this.page) {
    if (!this.initialized) this.loading = true;
    try {
      const result = await api.getWatchlist(page, this.limit);
      runInAction(() => {
        this.items = result.data;
        this.total = result.total;
        this.page = result.page;
        this.loading = false;
        this.initialized = true;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.message;
        this.loading = false;
        this.initialized = true;
      });
    }
  }

  async addCoin(coinId: string, customThreshold?: number) {
    try {
      await api.addToWatchlist(coinId, customThreshold);
      await this.fetchWatchlist(this.page);
    } catch (e: any) {
      runInAction(() => { this.error = e.message; });
      throw e;
    }
  }

  async removeCoin(itemId: string) {
    try {
      await api.removeFromWatchlist(itemId);
      await this.fetchWatchlist(this.page);
    } catch (e: any) {
      runInAction(() => { this.error = e.message; });
    }
  }

  async updateItem(
    itemId: string,
    data: { customThreshold?: number | null; customPeriodMinutes?: number | null; isActive?: boolean }
  ) {
    try {
      const updated = await api.updateWatchlistItem(itemId, data);
      runInAction(() => {
        const idx = this.items.findIndex((i) => i.id === itemId);
        if (idx !== -1) this.items[idx] = updated;
      });
    } catch (e: any) {
      runInAction(() => { this.error = e.message; });
    }
  }
}
