import { formatUnits } from "viem";
import client from "../utils/client";
import abi from "../utils/abi";
import { CONTRACT_ADDRESS } from "../constants";
import {
  LIQUIDITY_DECIMALS,
  SRG_PRICE_DECIMALS,
  TOTAL_VOLUME_DECIMALS,
  CALCULATE_PRICE_DECIMALS,
} from "../constants/decimals";
import { estimateBlockOneHourLater } from "./helpers";
import db from "../db/neon";
import redis from "../db/redis";
import memory from "../db/in-memory";

async function safeRedisSet(key: string, value: any, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await redis.set(key, value);
      return;
    } catch (error) {
      if (i === retries - 1) {
        console.error(`[Redis Set Failed] Key: ${key}`, (error as Error).message);
      } else {
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
  }
}

setInterval(async () => {
  await Promise.all([
    safeRedisSet("cachedVolume", memory.inMemoryVolume),
    safeRedisSet("cachedLastBlock", memory.inMemoryLastBlock),
  ]);
  console.log("[Persisted to Redis]", {
    volume: memory.inMemoryVolume,
    lastBlock: memory.inMemoryLastBlock,
  });
}, 5 * 60 * 1000);

async function track() {
  const contract = {
    abi,
    address: CONTRACT_ADDRESS,
  } as const;

  const [latestBlock, cachedVolume, cachedLastBlock] = await Promise.all([
    client.getBlockNumber({ cacheTime: 0 }),
    redis.get<number>("cachedVolume"),
    redis.get<number>("cachedLastBlock"),
  ]);
  const currentBlockNumber = Number(latestBlock.toString());

  if (cachedVolume) memory.inMemoryVolume = cachedVolume;
  if (cachedLastBlock) memory.inMemoryLastBlock = cachedLastBlock;

  let block = memory.inMemoryLastBlock;
  while (block <= currentBlockNumber) {
    const [_liquidity, _totalVolume, _calculatePrice, _srgPrice] = await client.multicall({
      contracts: [
        { ...contract, functionName: "getLiquidity" },
        { ...contract, functionName: "totalVolume" },
        { ...contract, functionName: "calculatePrice" },
        { ...contract, functionName: "getSRGPrice" },
      ],
      blockNumber: BigInt(block),
      allowFailure: false,
    });

    const [liquidity, totalVolume, calculatePrice, srgPrice] = [
      formatUnits(_liquidity, LIQUIDITY_DECIMALS),
      formatUnits(_totalVolume, TOTAL_VOLUME_DECIMALS),
      formatUnits(_calculatePrice, CALCULATE_PRICE_DECIMALS),
      formatUnits(_srgPrice, SRG_PRICE_DECIMALS),
    ];
    const price = Number(calculatePrice) * Number(srgPrice);
    const volume = Number(totalVolume) - memory.inMemoryVolume;

    const { nextBlock, previousTimestamp } = await estimateBlockOneHourLater(block);

    await db.addTokenData({
      token_address: CONTRACT_ADDRESS,
      timestamp: previousTimestamp,
      price: price.toFixed(8),
      volume: volume.toFixed(8),
      liquidity: parseFloat(liquidity).toFixed(8),
    });

    if (nextBlock <= block) {
      console.warn(`Next block estimate (${nextBlock}) not ahead of current (${block}). Exiting.`);
      break;
    }

    memory.inMemoryVolume = Number(totalVolume);
    memory.inMemoryLastBlock = block;

    block = nextBlock;
  }

  console.log("Completed fetching liquidity data.");
}

export default track;
