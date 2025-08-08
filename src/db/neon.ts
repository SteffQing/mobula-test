/// <reference path="../types/structs.d.ts" />

import { neon } from "@neondatabase/serverless";
import { getEnvVariable } from "../utils/config";

class NeonDB {
  private sql: ReturnType<typeof neon>;
  constructor() {
    this.sql = neon(getEnvVariable("DATABASE_URL"));
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    await this.sql(`
      CREATE TABLE IF NOT EXISTS market_data (
        token_address VARCHAR(42) NOT NULL,
        timestamp INTEGER NOT NULL,
        price DECIMAL(18,8) NOT NULL,
        volume DECIMAL(28,8) NOT NULL,
        liquidity DECIMAL(28,8) NOT NULL,
        PRIMARY KEY (token_address, timestamp)
      )
    `);
  }

  async addTokenData(data: TokenData) {
    const { token_address, timestamp, price, volume, liquidity } = data;

    await this.sql(
      `
      INSERT INTO market_data (token_address, timestamp, price, volume, liquidity)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (token_address, timestamp)
      DO UPDATE SET price = $3, volume = $4, liquidity = $5
      `,
      [token_address, timestamp, price, volume, liquidity]
    );
  }

  async getPrice(token_address: string, from: number, to: number) {
    const rows = (await this.sql`
      SELECT timestamp, price
      FROM market_data
      WHERE token_address = ${token_address}
        AND timestamp BETWEEN ${from} AND ${to}
      ORDER BY timestamp ASC
    `) as MarketDataPoint[];

    return rows;
  }

  async getVolume(token_address: string, from: number, to: number) {
    const rows = (await this.sql`
      SELECT timestamp, volume
      FROM market_data
      WHERE token_address = ${token_address}
        AND timestamp BETWEEN ${from} AND ${to}
      ORDER BY timestamp ASC
    `) as MarketDataPoint[];

    return rows;
  }

  async getLiquidity(token_address: string, from: number, to: number) {
    const rows = (await this.sql`
      SELECT timestamp, liquidity
      FROM market_data
      WHERE token_address = ${token_address}
        AND timestamp BETWEEN ${from} AND ${to}
      ORDER BY timestamp ASC
    `) as MarketDataPoint[];

    return rows;
  }

  async getAll(token_address: string, from: number, to: number) {
    const rows = (await this.sql`
      SELECT timestamp, price, volume, liquidity
      FROM market_data
      WHERE token_address = ${token_address}
        AND timestamp BETWEEN ${from} AND ${to}
      ORDER BY timestamp ASC
    `) as MarketDataPoint[];

    return rows;
  }
}

const db = new NeonDB();
export default db;
