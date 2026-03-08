import { makeAutoObservable, runInAction } from "mobx";
import { api } from "@/services/api";
import type { RootStore } from "./RootStore";

export class TelegramStore {
  linkCode: string | null = null;
  expiresAt: string | null = null;
  loading = false;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isLinked() {
    return !!this.rootStore.authStore.user?.telegramChatId;
  }

  async generateCode() {
    this.loading = true;
    try {
      const result = await api.generateTelegramCode();
      runInAction(() => {
        this.linkCode = result.code;
        this.expiresAt = result.expiresAt;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async unlink() {
    this.loading = true;
    try {
      await api.unlinkTelegram();
      runInAction(() => {
        this.linkCode = null;
        this.expiresAt = null;
        this.loading = false;
      });
      // Refresh user data
      await this.rootStore.authStore.fetchMe();
    } catch {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}
