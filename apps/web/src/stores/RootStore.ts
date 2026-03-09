import { createContext, useContext } from "react";
import { AuthStore } from "./AuthStore";
import { WatchlistStore } from "./WatchlistStore";
import { CoinStore } from "./CoinStore";
import { AlertStore } from "./AlertStore";
import { SettingsStore } from "./SettingsStore";
import { TelegramStore } from "./TelegramStore";
import { ThemeStore } from "./ThemeStore";

export class RootStore {
  authStore: AuthStore;
  watchlistStore: WatchlistStore;
  coinStore: CoinStore;
  alertStore: AlertStore;
  settingsStore: SettingsStore;
  telegramStore: TelegramStore;
  themeStore: ThemeStore;

  constructor() {
    this.authStore = new AuthStore();
    this.watchlistStore = new WatchlistStore();
    this.coinStore = new CoinStore();
    this.alertStore = new AlertStore();
    this.settingsStore = new SettingsStore();
    this.telegramStore = new TelegramStore(this);
    this.themeStore = new ThemeStore();
  }
}

let clientStore: RootStore | undefined;

export function getStore(): RootStore {
  if (!clientStore) {
    clientStore = new RootStore();
  }
  return clientStore;
}

export const StoreContext = createContext<RootStore>(new RootStore());

export function useStore(): RootStore {
  return useContext(StoreContext);
}
