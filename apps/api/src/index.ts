import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { coinsRouter } from "./routes/coins.js";
import { watchlistRouter } from "./routes/watchlist.js";
import { alertsRouter } from "./routes/alerts.js";
import { settingsRouter } from "./routes/settings.js";
import { telegramRouter } from "./routes/telegram.js";
import { portfolioRouter } from "./routes/portfolio.js";
import { adminRouter } from "./routes/admin.js";

const app = express();
const PORT = parseInt(process.env.API_PORT || "3002");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/coins", coinsRouter);
app.use("/api/watchlist", watchlistRouter);
app.use("/api/alerts", alertsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/telegram", telegramRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/admin", adminRouter);

app.listen(PORT, () => {
  console.log(`API сервер запущен на порту ${PORT}`);
});
