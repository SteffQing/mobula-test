import { createPublicClient, fallback, http } from "viem";
import { bsc } from "viem/chains";
import { getEnvVariable } from "./config";

const bscRpc = [
  "https://bsc-rpc.publicnode.com",
  "https://bsc-dataseed.binance.org/",
  getEnvVariable("ANKR_RPC"),
  getEnvVariable("QUICKNODE_RPC"),
  getEnvVariable("GETBLOCK_RPC"),
];

const client = createPublicClient({
  chain: bsc,
  transport: fallback(
    bscRpc.map((rpc) =>
      http(rpc, {
        // onFetchResponse(response) {
        //   console.log(response.statusText, rpc);
        // },
      })
    )
  ),
  batch: {
    multicall: true,
  },
});

export default client;
