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

  // Watchlist
  getWatchlist(page = 1, limit = 20) {
    return this.request<{ data: any[]; total: number; page: number; limit: number }>(
      `/watchlist?page=${page}&limit=${limit}`
    );
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
}

export const api = new ApiClient();
