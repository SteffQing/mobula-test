import { Redis } from "@upstash/redis";
import { getEnvVariable } from "../utils/config";

const redis = new Redis({
  url: getEnvVariable("REDIS_URL"),
  token: getEnvVariable("REDIS_TOKEN"),
});

export default redis;
