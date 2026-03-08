import { useEffect, useRef } from "react";
import { StoreContext, RootStore, getStore } from "@/stores/RootStore";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<RootStore>(undefined);
  if (!storeRef.current) {
    storeRef.current = getStore();
  }

  useEffect(() => {
    storeRef.current?.authStore.loadFromStorage();
  }, []);

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
}
