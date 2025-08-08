"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var viem_1 = require("viem");
var client_1 = __importDefault(require("../utils/client"));
var abi_1 = __importDefault(require("../utils/abi"));
var constants_1 = require("../constants");
var decimals_1 = require("../constants/decimals");
var helpers_1 = require("./helpers");
var neon_1 = __importDefault(require("../db/neon"));
var redis_1 = __importDefault(require("../db/redis"));
var in_memory_1 = __importDefault(require("../db/in-memory"));
function safeRedisSet(key_1, value_1) {
    return __awaiter(this, arguments, void 0, function (key, value, retries) {
        var i, error_1;
        if (retries === void 0) { retries = 3; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < retries)) return [3 /*break*/, 9];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 8]);
                    return [4 /*yield*/, redis_1.default.set(key, value)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
                case 4:
                    error_1 = _a.sent();
                    if (!(i === retries - 1)) return [3 /*break*/, 5];
                    console.error("[Redis Set Failed] Key: ".concat(key), error_1.message);
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, new Promise(function (res) { return setTimeout(res, 1000); })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [3 /*break*/, 8];
                case 8:
                    i++;
                    return [3 /*break*/, 1];
                case 9: return [2 /*return*/];
            }
        });
    });
}
setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    safeRedisSet("cachedVolume", in_memory_1.default.inMemoryVolume),
                    safeRedisSet("cachedLastBlock", in_memory_1.default.inMemoryLastBlock),
                ])];
            case 1:
                _a.sent();
                console.log("[Persisted to Redis]", {
                    volume: in_memory_1.default.inMemoryVolume,
                    lastBlock: in_memory_1.default.inMemoryLastBlock,
                });
                return [2 /*return*/];
        }
    });
}); }, 5 * 60 * 1000);
function track() {
    return __awaiter(this, void 0, void 0, function () {
        var contract, _a, latestBlock, cachedVolume, cachedLastBlock, currentBlockNumber, block, _b, _liquidity, _totalVolume, _calculatePrice, _srgPrice, _c, liquidity, totalVolume, calculatePrice, srgPrice, price, volume, _d, nextBlock, previousTimestamp;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    contract = {
                        abi: abi_1.default,
                        address: constants_1.CONTRACT_ADDRESS,
                    };
                    return [4 /*yield*/, Promise.all([
                            client_1.default.getBlockNumber({ cacheTime: 0 }),
                            redis_1.default.get("cachedVolume"),
                            redis_1.default.get("cachedLastBlock"),
                        ])];
                case 1:
                    _a = _e.sent(), latestBlock = _a[0], cachedVolume = _a[1], cachedLastBlock = _a[2];
                    currentBlockNumber = Number(latestBlock.toString());
                    if (cachedVolume)
                        in_memory_1.default.inMemoryVolume = cachedVolume;
                    if (cachedLastBlock)
                        in_memory_1.default.inMemoryLastBlock = cachedLastBlock;
                    block = in_memory_1.default.inMemoryLastBlock;
                    _e.label = 2;
                case 2:
                    if (!(block <= currentBlockNumber)) return [3 /*break*/, 6];
                    return [4 /*yield*/, client_1.default.multicall({
                            contracts: [
                                __assign(__assign({}, contract), { functionName: "getLiquidity" }),
                                __assign(__assign({}, contract), { functionName: "totalVolume" }),
                                __assign(__assign({}, contract), { functionName: "calculatePrice" }),
                                __assign(__assign({}, contract), { functionName: "getSRGPrice" }),
                            ],
                            blockNumber: BigInt(block),
                            allowFailure: false,
                        })];
                case 3:
                    _b = _e.sent(), _liquidity = _b[0], _totalVolume = _b[1], _calculatePrice = _b[2], _srgPrice = _b[3];
                    _c = [
                        (0, viem_1.formatUnits)(_liquidity, decimals_1.LIQUIDITY_DECIMALS),
                        (0, viem_1.formatUnits)(_totalVolume, decimals_1.TOTAL_VOLUME_DECIMALS),
                        (0, viem_1.formatUnits)(_calculatePrice, decimals_1.CALCULATE_PRICE_DECIMALS),
                        (0, viem_1.formatUnits)(_srgPrice, decimals_1.SRG_PRICE_DECIMALS),
                    ], liquidity = _c[0], totalVolume = _c[1], calculatePrice = _c[2], srgPrice = _c[3];
                    price = Number(calculatePrice) * Number(srgPrice);
                    volume = Number(totalVolume) - in_memory_1.default.inMemoryVolume;
                    return [4 /*yield*/, (0, helpers_1.estimateBlockOneHourLater)(block)];
                case 4:
                    _d = _e.sent(), nextBlock = _d.nextBlock, previousTimestamp = _d.previousTimestamp;
                    return [4 /*yield*/, neon_1.default.addTokenData({
                            token_address: constants_1.CONTRACT_ADDRESS,
                            timestamp: previousTimestamp,
                            price: price.toFixed(8),
                            volume: volume.toFixed(8),
                            liquidity: parseFloat(liquidity).toFixed(8),
                        })];
                case 5:
                    _e.sent();
                    if (nextBlock <= block) {
                        console.warn("Next block estimate (".concat(nextBlock, ") not ahead of current (").concat(block, "). Exiting."));
                        return [3 /*break*/, 6];
                    }
                    in_memory_1.default.inMemoryVolume = Number(totalVolume);
                    in_memory_1.default.inMemoryLastBlock = block;
                    block = nextBlock;
                    return [3 /*break*/, 2];
                case 6:
                    console.log("Completed fetching liquidity data.");
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = track;
