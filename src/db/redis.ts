import "dotenv/config";
import { Redis } from "ioredis";

if (!process.env.MATCHMAKING_REDIS_URL) {
  throw new Error("MATCHMAKING_REDIS_URL environment variable is not set");
}

// Family 0 is for IPv4
export const matchmakingRedis = new Redis(
  process.env.MATCHMAKING_REDIS_URL! + "?family=0"
);

if (!process.env.ROOM_REDIS_URL) {
  throw new Error("ROOM_REDIS_URL environment variable is not set");
}

// Family 0 is for IPv4
export const roomRedis = new Redis(process.env.ROOM_REDIS_URL! + "?family=0");
