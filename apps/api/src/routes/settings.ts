import { Router } from "express";
import { prisma } from "@crypto-signals/db";
import { requireAuth } from "../auth.js";

export const settingsRouter = Router();

settingsRouter.use(requireAuth);

settingsRouter.get("/", async (req, res) => {
  const auth = (req as any).auth;

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { defaultThreshold: true },
  });

  res.json(user);
});

settingsRouter.put("/", async (req, res) => {
  const auth = (req as any).auth;
  const { defaultThreshold } = req.body;

  if (typeof defaultThreshold !== "number" || defaultThreshold <= 0) {
    res.status(400).json({ error: "Порог должен быть положительным числом" });
    return;
  }

  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: { defaultThreshold },
    select: { defaultThreshold: true },
  });

  res.json(user);
});
