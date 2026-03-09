import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { StoreProvider } from "@/components/StoreProvider";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import { App } from "@/App";
import "@/app/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <ThemeWrapper>
          <App />
        </ThemeWrapper>
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>
);
