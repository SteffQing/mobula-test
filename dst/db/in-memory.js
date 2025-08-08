"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../constants");
var inMemoryVolume = 0;
var inMemoryLastBlock = constants_1.CREATION_BLOCK_NUMBER;
exports.default = { inMemoryVolume: inMemoryVolume, inMemoryLastBlock: inMemoryLastBlock };
