import { Router } from "express";
import { prisma } from "@crypto-signals/db";
import { requireAuth } from "../auth.js";

export const settingsRouter = Router();

settingsRouter.use(requireAuth);

const SETTINGS_SELECT = {
  defaultThreshold: true,
  alertOnUp: true,
  alertOnDown: true,
  checkPeriodMinutes: true,
};

settingsRouter.get("/", async (req, res) => {
  const auth = (req as any).auth;

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: SETTINGS_SELECT,
  });

  res.json(user);
});

settingsRouter.put("/", async (req, res) => {
  const auth = (req as any).auth;
  const { defaultThreshold, alertOnUp, alertOnDown, checkPeriodMinutes } = req.body;

  if (defaultThreshold !== undefined && (typeof defaultThreshold !== "number" || defaultThreshold <= 0)) {
    res.status(400).json({ error: "Порог должен быть положительным числом" });
    return;
  }

  if (checkPeriodMinutes !== undefined && (typeof checkPeriodMinutes !== "number" || checkPeriodMinutes < 1)) {
    res.status(400).json({ error: "Период должен быть не менее 1 минуты" });
    return;
  }

  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: {
      ...(defaultThreshold !== undefined && { defaultThreshold }),
      ...(alertOnUp !== undefined && { alertOnUp }),
      ...(alertOnDown !== undefined && { alertOnDown }),
      ...(checkPeriodMinutes !== undefined && { checkPeriodMinutes }),
    },
    select: SETTINGS_SELECT,
  });

  res.json(user);
});
