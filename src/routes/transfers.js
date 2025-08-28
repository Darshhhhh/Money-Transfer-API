import express from "express";
import { z } from "zod";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const transferSchema = z.object({
  amountMinor: z.number().int().positive(),
  currency: z.string().length(3),
});

router.post("/", requireAuth, (req, res) => {
  const idKey = req.get("Idempotency-Key");
  if (!idKey)
    return res.status(400).json({ error: "Idempotency-Key required" });

  const existing = db.idempotency.find((i) => i.key === idKey);
  if (existing) return res.json(existing.response);

  const result = transferSchema.safeParse(req.body);
  if (!result.success)
    return res.status(400).json({ error: result.error.issues });

  const transfer = {
    id: db.transfers.length + 1,
    userId: req.user.userId,
    ...result.data,
    state: "COMMITTED",
  };

  db.transfers.push(transfer);
  const response = { transfer };
  db.idempotency.push({ key: idKey, response });

  res.json(response);
});

router.get("/", requireAuth, (req, res) => {
  const transfers = db.transfers.filter((t) => t.userId === req.user.userId);
  res.json(transfers);
});

export default router;
