import { makeAutoObservable, runInAction } from "mobx";
import { api } from "@/services/api";

export class SettingsStore {
  defaultThreshold = 10;
  alertOnUp = true;
  alertOnDown = true;
  checkPeriodMinutes = 10;
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
        this.alertOnUp = result.alertOnUp;
        this.alertOnDown = result.alertOnDown;
        this.checkPeriodMinutes = result.checkPeriodMinutes;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async updateSettings(data: { defaultThreshold?: number; alertOnUp?: boolean; alertOnDown?: boolean; checkPeriodMinutes?: number }) {
    this.saving = true;
    try {
      const result = await api.updateSettings(data);
      runInAction(() => {
        this.defaultThreshold = result.defaultThreshold;
        this.alertOnUp = result.alertOnUp;
        this.alertOnDown = result.alertOnDown;
        this.checkPeriodMinutes = result.checkPeriodMinutes;
        this.saving = false;
      });
    } catch {
      runInAction(() => {
        this.saving = false;
      });
    }
  }
}
