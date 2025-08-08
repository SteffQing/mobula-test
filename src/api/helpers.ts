import { ONE_HOUR, BLOCK_STEPS_PER_HOUR } from "../constants";
import client from "../utils/client";

async function estimateBlockOneHourLater(startBlockNumber: number) {
  const [startBlock, latestBlockNumber] = await Promise.all([
    client.getBlock({ blockNumber: BigInt(startBlockNumber) }),
    client.getBlockNumber({ cacheTime: 0 }),
  ]);

  const startTimestamp = Number(startBlock.timestamp);
  const targetTimestamp = startTimestamp + ONE_HOUR;
  const latest = Number(latestBlockNumber);

  const searchRadius = Math.floor(BLOCK_STEPS_PER_HOUR * 0.1);
  let low = startBlockNumber + BLOCK_STEPS_PER_HOUR - searchRadius;
  let high = Math.min(startBlockNumber + BLOCK_STEPS_PER_HOUR + searchRadius, latest);

  let closestBlock = high;
  let closestDiff = Infinity;

  const blockCache = new Map<number, number>();

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    let midTimestamp: number;
    if (blockCache.has(mid)) {
      midTimestamp = blockCache.get(mid)!;
    } else {
      const midBlock = await client.getBlock({ blockNumber: BigInt(mid) });
      midTimestamp = Number(midBlock.timestamp);
      blockCache.set(mid, midTimestamp);
    }

    const currentDiff = Math.abs(midTimestamp - targetTimestamp);
    if (currentDiff < closestDiff) {
      closestBlock = mid;
      closestDiff = currentDiff;
    }

    if (midTimestamp < targetTimestamp) {
      low = mid + 1;
    } else if (midTimestamp > targetTimestamp) {
      high = mid - 1;
    } else {
      return { nextBlock: mid, previousTimestamp: startTimestamp };
    }
  }

  return { nextBlock: closestBlock, previousTimestamp: startTimestamp };
}

export { estimateBlockOneHourLater };
