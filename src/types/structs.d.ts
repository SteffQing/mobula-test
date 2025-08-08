interface CandleStick {
  time: bigint;
  open: bigint;
  close: bigint;
  high: bigint;
  low: bigint;
}

interface MarketDataPoint {
  timestamp: number;
  price: string;
  volume: string;
  liquidity: string;
}

type TokenData = MarketDataPoint & {
  token_address: string;
};
