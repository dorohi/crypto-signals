import { makeAutoObservable, runInAction } from "mobx";
import { api } from "@/services/api";

export class AlertStore {
  alerts: any[] = [];
  total = 0;
  page = 1;
  loading = false;
  initialized = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchAlerts(page = 1) {
    if (!this.initialized) this.loading = true;
    try {
      const result = await api.getAlerts(page);
      runInAction(() => {
        this.alerts = result.data;
        this.total = result.total;
        this.page = page;
        this.loading = false;
        this.initialized = true;
      });
    } catch {
      runInAction(() => {
        this.loading = false;
        this.initialized = true;
      });
    }
  }
}
