export interface ApiError {
  error: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SettingsData {
  defaultThreshold: number;
}

export interface TelegramLinkResponse {
  code: string;
  expiresAt: string;
}
