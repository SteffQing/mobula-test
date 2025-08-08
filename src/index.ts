import express from "express";
import cors from "cors";
import { CONTRACT_ADDRESS } from "./constants";
import db from "./db/neon";
import { parseDate } from "./utils";

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

const getTimestamps = (req: express.Request) => {
  const { from, to } = req.query as { from: string; to: string };

  if (!from || !to) {
    throw new Error("Missing 'from' or 'to' query parameter.");
  }

  const fromTimestamp = parseDate(from);
  let toTimestamp = parseDate(to);

  const maxRangeSeconds = 30 * 24 * 3600;
  if (toTimestamp - fromTimestamp > maxRangeSeconds) {
    toTimestamp = fromTimestamp + maxRangeSeconds;
  }

  return { from: fromTimestamp, to: toTimestamp };
};

app.get("/price", async (req, res) => {
  try {
    const { from, to } = getTimestamps(req);
    const data = await db.getPrice(CONTRACT_ADDRESS, from, to);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch token price", details: (error as Error).message });
  }
});

app.get("/volume", async (req, res) => {
  try {
    const { from, to } = getTimestamps(req);
    const data = await db.getVolume(CONTRACT_ADDRESS, from, to);
    res.json({ data });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch token volume",
      details: (error as Error).message,
    });
  }
});

app.get("/liquidity", async (req, res) => {
  try {
    const { from, to } = getTimestamps(req);
    const data = await db.getLiquidity(CONTRACT_ADDRESS, from, to);
    res.json({ data });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch token liquidity",
      details: (error as Error).message,
    });
  }
});

app.get("/all", async (req, res) => {
  try {
    const { from, to } = getTimestamps(req);
    const data = await db.getAll(CONTRACT_ADDRESS, from, to);
    res.json({ data });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch token data",
      details: (error as Error).message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
