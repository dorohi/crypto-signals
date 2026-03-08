import { makeAutoObservable, runInAction } from "mobx";
import { api } from "@/services/api";

export class AlertStore {
  alerts: any[] = [];
  total = 0;
  page = 1;
  loading = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchAlerts(page = 1) {
    this.loading = true;
    try {
      const result = await api.getAlerts(page);
      runInAction(() => {
        this.alerts = result.data;
        this.total = result.total;
        this.page = page;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}
