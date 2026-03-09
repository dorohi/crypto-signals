import { makeAutoObservable, runInAction } from "mobx";
import { api } from "@/services/api";

export class PortfolioStore {
  summary: any = null;
  positions: any[] = [];
  loading = false;
  initialized = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchPortfolio() {
    if (!this.initialized) this.loading = true;
    try {
      const result = await api.getPortfolio();
      runInAction(() => {
        this.summary = result.summary;
        this.positions = result.positions;
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

  async addTransaction(data: { coinId: string; type: string; quantity: number; price: number; fee?: number; note?: string; date?: string }) {
    try {
      await api.addPortfolioTransaction(data);
      await this.fetchPortfolio();
    } catch (e: any) {
      runInAction(() => { this.error = e.message; });
      throw e;
    }
  }

  async updateTransaction(id: string, data: { type?: string; quantity?: number; price?: number; fee?: number; note?: string; date?: string }) {
    try {
      await api.updatePortfolioTransaction(id, data);
      await this.fetchPortfolio();
    } catch (e: any) {
      runInAction(() => { this.error = e.message; });
      throw e;
    }
  }

  async deleteTransaction(id: string) {
    try {
      await api.deletePortfolioTransaction(id);
      await this.fetchPortfolio();
    } catch (e: any) {
      runInAction(() => { this.error = e.message; });
    }
  }

  async deleteCoin(coinId: string) {
    try {
      await api.deletePortfolioCoin(coinId);
      runInAction(() => {
        this.positions = this.positions.filter((p) => p.coinId !== coinId);
      });
      await this.fetchPortfolio();
    } catch (e: any) {
      runInAction(() => { this.error = e.message; });
    }
  }
}
