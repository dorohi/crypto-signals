import { makeAutoObservable, runInAction } from "mobx";
import { api } from "@/services/api";

export class WatchlistStore {
  items: any[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchWatchlist() {
    this.loading = true;
    try {
      const result = await api.getWatchlist();
      runInAction(() => {
        this.items = result.data;
        this.loading = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.message;
        this.loading = false;
      });
    }
  }

  async addCoin(coinId: string, customThreshold?: number) {
    try {
      const item = await api.addToWatchlist(coinId, customThreshold);
      runInAction(() => {
        this.items.push(item);
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.message;
      });
      throw e;
    }
  }

  async removeCoin(itemId: string) {
    try {
      await api.removeFromWatchlist(itemId);
      runInAction(() => {
        this.items = this.items.filter((i) => i.id !== itemId);
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.message;
      });
    }
  }

  async updateItem(
    itemId: string,
    data: { customThreshold?: number | null; isActive?: boolean }
  ) {
    try {
      const updated = await api.updateWatchlistItem(itemId, data);
      runInAction(() => {
        const idx = this.items.findIndex((i) => i.id === itemId);
        if (idx !== -1) this.items[idx] = updated;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.message;
      });
    }
  }
}
