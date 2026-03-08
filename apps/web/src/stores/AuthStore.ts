import { makeAutoObservable, runInAction } from "mobx";
import { api } from "@/services/api";

export class AuthStore {
  user: any = null;
  token: string | null = null;
  loading = false;
  error: string | null = null;
  initialized = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isAuthenticated() {
    return !!this.token;
  }

  loadFromStorage() {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (token) {
      this.token = token;
      api.setToken(token);
      this.fetchMe();
    }
    this.initialized = true;
  }

  async login(email: string, password: string) {
    this.loading = true;
    this.error = null;
    try {
      const result = await api.login(email, password);
      runInAction(() => {
        this.token = result.token;
        this.user = result.user;
        this.loading = false;
      });
      localStorage.setItem("token", result.token);
      api.setToken(result.token);
    } catch (e: any) {
      runInAction(() => {
        this.error = e.message;
        this.loading = false;
      });
      throw e;
    }
  }

  async register(name: string, email: string, password: string) {
    this.loading = true;
    this.error = null;
    try {
      const result = await api.register(name, email, password);
      runInAction(() => {
        this.token = result.token;
        this.user = result.user;
        this.loading = false;
      });
      localStorage.setItem("token", result.token);
      api.setToken(result.token);
    } catch (e: any) {
      runInAction(() => {
        this.error = e.message;
        this.loading = false;
      });
      throw e;
    }
  }

  async fetchMe() {
    try {
      const user = await api.getMe();
      runInAction(() => {
        this.user = user;
      });
    } catch {
      this.logout();
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("token");
    api.setToken(null);
  }
}
