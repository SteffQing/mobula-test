"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var redis_1 = require("@upstash/redis");
var config_1 = require("../utils/config");
var redis = new redis_1.Redis({
    url: (0, config_1.getEnvVariable)("REDIS_URL"),
    token: (0, config_1.getEnvVariable)("REDIS_TOKEN"),
});
exports.default = redis;
