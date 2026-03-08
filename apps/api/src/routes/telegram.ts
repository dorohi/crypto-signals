import { Router } from "express";
import crypto from "crypto";
import { prisma } from "@crypto-signals/db";
import { requireAuth } from "../auth.js";

export const telegramRouter = Router();

telegramRouter.use(requireAuth);

telegramRouter.post("/link", async (req, res) => {
  const auth = (req as any).auth;

  const code = crypto.randomBytes(3).toString("hex").toUpperCase();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: auth.userId },
    data: {
      telegramLinkCode: code,
      telegramLinkExpiresAt: expiresAt,
    },
  });

  res.json({ code, expiresAt: expiresAt.toISOString() });
});

telegramRouter.post("/unlink", async (req, res) => {
  const auth = (req as any).auth;

  await prisma.user.update({
    where: { id: auth.userId },
    data: {
      telegramChatId: null,
      telegramLinkCode: null,
      telegramLinkExpiresAt: null,
    },
  });

  res.json({ success: true });
});
