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

if (!process.env.ROUND_TIMERS_REDIS_URL) {
  throw new Error("ROUND_TIMERS_REDIS_URL environment variable is not set");
}

// Family 0 is for IPv4
export const roundTimerRedis = new Redis(process.env.ROUND_TIMERS_REDIS_URL!, {
  maxRetriesPerRequest: null,
  family: 0,
});

roundTimerRedis.config("SET", "notify-keyspace-events", "Ex").then(() => {
  console.log("Keyspace notifications enabled.");
});

export const roundTimerRedisSubscriber = new Redis(
  process.env.ROUND_TIMERS_REDIS_URL! + "?family=0",
  {
    maxRetriesPerRequest: null,
  }
);
