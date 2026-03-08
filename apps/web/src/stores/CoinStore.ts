import { makeAutoObservable, runInAction } from "mobx";
import { api } from "@/services/api";

export class CoinStore {
  coins: any[] = [];
  searchResults: any[] = [];
  total = 0;
  loading = false;
  searching = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchCoins(page = 1, limit = 100) {
    this.loading = true;
    try {
      const result = await api.getCoins(page, limit);
      runInAction(() => {
        this.coins = result.data;
        this.total = result.total;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async searchCoins(query: string) {
    if (!query) {
      this.searchResults = [];
      return;
    }
    this.searching = true;
    try {
      const result = await api.searchCoins(query);
      runInAction(() => {
        this.searchResults = result.data;
        this.searching = false;
      });
    } catch {
      runInAction(() => {
        this.searching = false;
      });
    }
  }

  clearSearch() {
    this.searchResults = [];
  }
}
