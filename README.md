# 📊 $APE Market Data Service – Mobula Technical Test

This project was built as part of the **Mobula Technical Test**. The goal was to implement a data collection service and API for a token’s **price**, **volume**, and **liquidity**, tracked at an **hourly resolution**.

It includes:

- A backend API to serve the processed market data
- A PostgreSQL-backed caching layer (NeonDB)
- A Redis + in-memory fallback setup
- Optional web-based dashboard (WIP) for visual inspection of results

---

## ⚙️ Design Philosophy

Mobula works at the intersection of **on-chain data** and **real-time querying**, which demands efficient and reliable access to EVM state across time. To handle that, this project:

- Collects data **hourly**, using a block-by-block simulation loop
- Stores clean hourly snapshots in a Postgres DB
- Exposes multiple endpoints to read data
- Uses **fallback RPC strategy** to navigate provider limits

---

## 🛠️ Architecture Overview

```text
             +------------------------+
             |  Express Server (API) |
             +-----------+------------+
                         |
         +---------------+----------------+
         | getPrice / getVolume / getAll  |
         +---------------+----------------+
                         |
                 +-------v-------+
                 |   NeonDB      |
                 +-------+-------+
                         |
        +----------------+-----------------+
        | Redis (cache)      In-memory fallback
        +--------------------------------------+
```

---

## 🚀 Features

- **API Endpoints**

  - `/price`: Token price over time (hourly)
  - `/volume`: Trading volume snapshots
  - `/liquidity`: Liquidity snapshots
  - `/all`: Returns price, volume, and liquidity combined

- **Hourly Timeframe Tracking**

  - Fetches market data per hour using constant block-step simulation
  - Normalizes all values (price, volume, liquidity) using token-specific decimal math

- **Backend Components**

  - Express.js REST API
  - NeonDB (PostgreSQL) for persistent market data storage
  - Redis + in-memory as cache layer
  - Type-safe constants for precision handling

- **Node Fallback Strategy**

  - Prioritizes reliable archival access while staying within rate limits:

    ```
    [ Ankr ➝ QuickNode ➝ Public RPCs ➝ GetBlock ]
    ```

    - `Ankr` & `QuickNode`: Used for archival access and performance
    - `Public RPCs`: Used for low-cost access to recent block data
    - `GetBlock`: Additional freemium-tier backup

---

## 🧠 Why This Setup?

Freemium accounts on providers like Ankr or QuickNode come with **request limits and latency risks**. To ensure resilience, a fallback transport using `viem`'s `fallback()` strategy dynamically rotates between working nodes.

This ensures:

- ✅ Reliable data fetches even under provider downtime
- ✅ Cost control under API key rate limits
- ✅ Smooth archival access to blocks as far back as token creation

---

## 📦 Tech Stack

### Backend

- **TypeScript**, **Node.js**
- **Express** for the API
- **@neondatabase/serverless** for PostgreSQL
- **@upstash/redis** for Redis
- **Viem** for EVM contract and blockchain interaction
- **dotenv**, **axios**, **node-cron**

---

## 🧮 Constants & Math

Token-specific decimal handling:

| Metric           | Decimal Precision |
| ---------------- | ----------------- |
| Volume           | 36                |
| Liquidity        | 9                 |
| Price            | 27                |
| Calculated Price | 18                |

Block-based simulation constants:

| Constant              | Value      |
| --------------------- | ---------- |
| Creation Block Number | 26,087,006 |
| Block Steps/Hour      | 1,200      |
| One Hour (seconds)    | 3600       |

---

## 📁 SRC Folder Structure

```
.
├── constants/
│   ├── decimals.ts
│   └── index.ts
├── db/
│   ├── neon.ts
│   ├── redis.ts
│   └── in-memory.ts
├── utils/
│   ├── abi.ts
│   ├── client.ts
│   ├── config.ts
│   └── index.ts
├── index.ts
```

---

## 📊 API Endpoints

| Endpoint     | Query Params              | Description                       |
| ------------ | ------------------------- | --------------------------------- |
| `/price`     | `from`, `to` (DD-MM-YYYY) | Fetches price chart data          |
| `/volume`    | `from`, `to`              | Volume per hour                   |
| `/liquidity` | `from`, `to`              | Liquidity over time               |
| `/all`       | `from`, `to`              | Combined price, volume, liquidity |

⏳ **Note**: Date ranges are capped at 30 days to optimize performance.

---

## 📦 Installation & Setup

1. **Install dependencies**

```bash
npm install
```

2. **Add your environment variables in `.env`**

```env
DATABASE_URL=your_neon_url
ANKR_RPC=https://rpc.ankr.com/bsc
QUICKNODE_RPC=https://your-node-url
GETBLOCK_RPC=https://eth.getblock.io/mainnet/?api_key=...
```

3. **Run the app**

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Example Query

```http
GET /all?from=01-08-2025&to=05-08-2025
```

```json
{
  "data": [
    {
      "timestamp": 1722556800,
      "price": "0.002435",
      "volume": "1520.2039482",
      "liquidity": "10423.5"
    },
    ...
  ]
}
```

---

## 📝 License

ISC License
