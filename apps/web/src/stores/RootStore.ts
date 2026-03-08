import { createContext, useContext } from "react";
import { AuthStore } from "./AuthStore";
import { WatchlistStore } from "./WatchlistStore";
import { CoinStore } from "./CoinStore";
import { AlertStore } from "./AlertStore";
import { SettingsStore } from "./SettingsStore";
import { TelegramStore } from "./TelegramStore";

export class RootStore {
  authStore: AuthStore;
  watchlistStore: WatchlistStore;
  coinStore: CoinStore;
  alertStore: AlertStore;
  settingsStore: SettingsStore;
  telegramStore: TelegramStore;

  constructor() {
    this.authStore = new AuthStore();
    this.watchlistStore = new WatchlistStore();
    this.coinStore = new CoinStore();
    this.alertStore = new AlertStore();
    this.settingsStore = new SettingsStore();
    this.telegramStore = new TelegramStore(this);
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
