"use strict";
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
exports.estimateBlockOneHourLater = estimateBlockOneHourLater;
var constants_1 = require("../constants");
var client_1 = __importDefault(require("../utils/client"));
function estimateBlockOneHourLater(startBlockNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, startBlock, latestBlockNumber, startTimestamp, targetTimestamp, latest, searchRadius, low, high, closestBlock, closestDiff, blockCache, mid, midTimestamp, midBlock, currentDiff;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        client_1.default.getBlock({ blockNumber: BigInt(startBlockNumber) }),
                        client_1.default.getBlockNumber({ cacheTime: 0 }),
                    ])];
                case 1:
                    _a = _b.sent(), startBlock = _a[0], latestBlockNumber = _a[1];
                    startTimestamp = Number(startBlock.timestamp);
                    targetTimestamp = startTimestamp + constants_1.ONE_HOUR;
                    latest = Number(latestBlockNumber);
                    searchRadius = Math.floor(constants_1.BLOCK_STEPS_PER_HOUR * 0.1);
                    low = startBlockNumber + constants_1.BLOCK_STEPS_PER_HOUR - searchRadius;
                    high = Math.min(startBlockNumber + constants_1.BLOCK_STEPS_PER_HOUR + searchRadius, latest);
                    closestBlock = high;
                    closestDiff = Infinity;
                    blockCache = new Map();
                    _b.label = 2;
                case 2:
                    if (!(low <= high)) return [3 /*break*/, 6];
                    mid = Math.floor((low + high) / 2);
                    midTimestamp = void 0;
                    if (!blockCache.has(mid)) return [3 /*break*/, 3];
                    midTimestamp = blockCache.get(mid);
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, client_1.default.getBlock({ blockNumber: BigInt(mid) })];
                case 4:
                    midBlock = _b.sent();
                    midTimestamp = Number(midBlock.timestamp);
                    blockCache.set(mid, midTimestamp);
                    _b.label = 5;
                case 5:
                    currentDiff = Math.abs(midTimestamp - targetTimestamp);
                    if (currentDiff < closestDiff) {
                        closestBlock = mid;
                        closestDiff = currentDiff;
                    }
                    if (midTimestamp < targetTimestamp) {
                        low = mid + 1;
                    }
                    else if (midTimestamp > targetTimestamp) {
                        high = mid - 1;
                    }
                    else {
                        return [2 /*return*/, { nextBlock: mid, previousTimestamp: startTimestamp }];
                    }
                    return [3 /*break*/, 2];
                case 6: return [2 /*return*/, { nextBlock: closestBlock, previousTimestamp: startTimestamp }];
            }
        });
    });
}
