"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var viem_1 = require("viem");
var chains_1 = require("viem/chains");
var config_1 = require("./config");
var bscRpc = [
    "https://bsc-rpc.publicnode.com",
    "https://bsc-dataseed.binance.org/",
    (0, config_1.getEnvVariable)("ANKR_RPC"),
    (0, config_1.getEnvVariable)("QUICKNODE_RPC"),
    (0, config_1.getEnvVariable)("GETBLOCK_RPC"),
];
var client = (0, viem_1.createPublicClient)({
    chain: chains_1.bsc,
    transport: (0, viem_1.fallback)(bscRpc.map(function (rpc) {
        return (0, viem_1.http)(rpc, {
        // onFetchResponse(response) {
        //   console.log(response.statusText, rpc);
        // },
        });
    })),
    batch: {
        multicall: true,
    },
});
exports.default = client;
