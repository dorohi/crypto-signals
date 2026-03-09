import { makeAutoObservable } from "mobx";
import type { ThemeKey } from "@/lib/theme";

const STORAGE_KEY = "theme";

export class ThemeStore {
  current: ThemeKey = "matrix";

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "matrix" || saved === "spiderman") {
      this.current = saved;
    }
  }

  setTheme(key: ThemeKey) {
    this.current = key;
    localStorage.setItem(STORAGE_KEY, key);
  }
}
