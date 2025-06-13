import "dotenv/config";
import { Redis } from "ioredis";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL environment variable is not set");
}

// Family 0 is for IPv4
export const redis = new Redis(process.env.REDIS_URL! + "?family=0");
