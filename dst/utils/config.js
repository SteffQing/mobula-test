"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvVariable = getEnvVariable;
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getEnvVariable(variableName) {
    var value = process.env[variableName];
    if (value === undefined) {
        throw new Error("".concat(variableName, " is not defined"));
    }
    return value;
}
