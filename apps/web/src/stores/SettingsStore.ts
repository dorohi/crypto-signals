import { makeAutoObservable, runInAction } from "mobx";
import { api } from "@/services/api";

export class SettingsStore {
  defaultThreshold = 10;
  loading = false;
  saving = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchSettings() {
    this.loading = true;
    try {
      const result = await api.getSettings();
      runInAction(() => {
        this.defaultThreshold = result.defaultThreshold;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async updateThreshold(value: number) {
    this.saving = true;
    try {
      const result = await api.updateSettings(value);
      runInAction(() => {
        this.defaultThreshold = result.defaultThreshold;
        this.saving = false;
      });
    } catch {
      runInAction(() => {
        this.saving = false;
      });
    }
  }
}
