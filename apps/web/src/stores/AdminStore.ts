import { makeAutoObservable, runInAction } from "mobx";
import { api } from "@/services/api";

export class AdminStore {
  users: any[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchUsers() {
    this.loading = true;
    this.error = null;
    try {
      const result = await api.getAdminUsers();
      runInAction(() => {
        this.users = result.data;
        this.loading = false;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.message;
        this.loading = false;
      });
    }
  }

  async changePassword(userId: string, password: string) {
    await api.adminChangePassword(userId, password);
  }

  async toggleRole(userId: string, isAdmin: boolean) {
    await api.adminToggleRole(userId, isAdmin);
    runInAction(() => {
      const user = this.users.find((u) => u.id === userId);
      if (user) user.isAdmin = isAdmin;
    });
  }
}
