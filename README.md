# 🧠 Mobula Test

This project is a custom implementation of a token price oracle and liquidity monitoring tool designed to work efficiently with EVM-compatible networks. It fetches real-time and archival data from multiple RPC providers using intelligent fallbacks and optimizations.

## ✨ Features

- **Token Price Calculation**:

  - Calculates token prices by combining raw pool data (e.g., `calculatePrice()`) and SRG price (via `getSRGPrice()`), normalized using standard 18-decimal scaling.
  - Example:

    ```ts
    const APE_price_in_USD = (calculatePrice() * getSRGPrice()) / 10 ** 18;
    ```

- **Liquidity Monitoring**:

  - Monitors and processes token liquidity information using on-chain pool reserves.

- **Block Estimation & Replay**:

  - Capable of fetching and re-processing data for estimated future block numbers (e.g., one hour later) to model future liquidity states.

## ⚙️ Tech Stack

- **RPC Providers**:

  - `GetBlock` (primary for public data)
  - `Ankr` and `QuickNode` (used specifically for **archival data**)

- **Fallback Strategy**:

  - A fallback mechanism ensures that if one RPC fails or doesn’t have archival capabilities, others take over.
  - This increases resilience and reliability across different networks and data types.
  - Public data (latest blocks, reserves) → Queried via **GetBlock**
  - Archival data (past reserves, block-specific states) → Queried via **Ankr**/**QuickNode**

- **Optimizations**:

  - **Multicall**: Aggregates multiple contract calls into a single RPC call, drastically reducing the number of network requests.
  - **Batching with `Promise.all()`**: Used for parallel data fetching scenarios.
  - Combined, these reduce RPC costs—especially important when using freemium tiers from Ankr, QuickNode, and GetBlock.

## 📦 Structure

- `calculatePrice()`: Reads pair reserves and computes price ratios.
- `getSRGPrice()`: Fetches the price of the SRG token in USD (or other base).
- `estimateBlockOneHourLater()`: Projects future block height and replays logic to forecast liquidity/price.
- `getLiquidityAndPrice()`: Combines all steps—fetches reserves, computes prices, and logs results.

## 🧪 Example Usage

```ts
const reserves = await getLiquidityAndPrice(pairAddress);
const futureBlock = await estimateBlockOneHourLater();
await rerunPriceLogicAtBlock(futureBlock);
```

## 📋 Notes

- Ankr and QuickNode **must be configured with archival access** to fetch historical block data.
- Multicall requires the **Multicall2** contract to be deployed on the target network.
# mobula-test
