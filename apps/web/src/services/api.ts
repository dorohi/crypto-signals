const API_BASE = "/api";

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.token = null;
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Не авторизован");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Ошибка запроса");
    }

    return data;
  }

  // Auth
  login(email: string, password: string) {
    return this.request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  register(name: string, email: string, password: string) {
    return this.request<{ token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  }

  getMe() {
    return this.request<any>("/auth/me");
  }

  // Coins
  getCoins(page = 1, limit = 100) {
    return this.request<{ data: any[]; total: number }>(
      `/coins?page=${page}&limit=${limit}`
    );
  }

  searchCoins(query: string) {
    return this.request<{ data: any[] }>(
      `/coins/search?q=${encodeURIComponent(query)}`
    );
  }

  getCoinSnapshots(id: string, minutes?: number) {
    const qs = minutes ? `?minutes=${minutes}` : "";
    return this.request<{ data: { price: number; recordedAt: string }[] }>(
      `/coins/${id}/snapshots${qs}`
    );
  }

  getSparklines(coinIds: string[], minutes = 60) {
    return this.request<{ data: Record<string, number[]> }>("/coins/sparklines", {
      method: "POST",
      body: JSON.stringify({ coinIds, minutes }),
    });
  }

  getCoinDetails(id: string) {
    return this.request<any>(`/coins/${id}/details`);
  }

  // Watchlist
  getWatchlist() {
    return this.request<{ data: any[] }>("/watchlist");
  }

  addToWatchlist(coinId: string, customThreshold?: number) {
    return this.request<any>("/watchlist", {
      method: "POST",
      body: JSON.stringify({ coinId, customThreshold }),
    });
  }

  updateWatchlistItem(id: string, data: { customThreshold?: number | null; customPeriodMinutes?: number | null; isActive?: boolean }) {
    return this.request<any>(`/watchlist/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  removeFromWatchlist(id: string) {
    return this.request<any>(`/watchlist/${id}`, {
      method: "DELETE",
    });
  }

  // Alerts
  getAlerts(page = 1, limit = 50) {
    return this.request<{ data: any[]; total: number }>(
      `/alerts?page=${page}&limit=${limit}`
    );
  }

  // Settings
  getSettings() {
    return this.request<{ defaultThreshold: number; alertOnUp: boolean; alertOnDown: boolean; checkPeriodMinutes: number }>("/settings");
  }

  updateSettings(data: { defaultThreshold?: number; alertOnUp?: boolean; alertOnDown?: boolean; checkPeriodMinutes?: number }) {
    return this.request<{ defaultThreshold: number; alertOnUp: boolean; alertOnDown: boolean; checkPeriodMinutes: number }>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Portfolio
  getPortfolio() {
    return this.request<{ summary: any; positions: any[] }>("/portfolio");
  }

  getPortfolioTransactions(coinId: string) {
    return this.request<{ data: any[] }>(`/portfolio/${coinId}/transactions`);
  }

  addPortfolioTransaction(data: { coinId: string; type: string; quantity: number; price: number; fee?: number; note?: string; date?: string }) {
    return this.request<any>("/portfolio", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updatePortfolioTransaction(id: string, data: { type?: string; quantity?: number; price?: number; fee?: number; note?: string; date?: string }) {
    return this.request<any>(`/portfolio/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deletePortfolioTransaction(id: string) {
    return this.request<any>(`/portfolio/${id}`, {
      method: "DELETE",
    });
  }

  deletePortfolioCoin(coinId: string) {
    return this.request<any>(`/portfolio/coin/${coinId}`, {
      method: "DELETE",
    });
  }

  // Telegram
  generateTelegramCode() {
    return this.request<{ code: string; expiresAt: string }>(
      "/telegram/link",
      { method: "POST" }
    );
  }

  unlinkTelegram() {
    return this.request<{ success: boolean }>("/telegram/unlink", {
      method: "POST",
    });
  }
  // Admin
  getAdminUsers() {
    return this.request<{ data: any[] }>("/admin/users");
  }

  adminChangePassword(userId: string, password: string) {
    return this.request<{ success: boolean }>(`/admin/users/${userId}/password`, {
      method: "PUT",
      body: JSON.stringify({ password }),
    });
  }

  adminToggleRole(userId: string, isAdmin: boolean) {
    return this.request<any>(`/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ isAdmin }),
    });
  }
}

export const api = new ApiClient();
