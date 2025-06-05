import { createClient } from "redis";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const redis = createClient({
  url: process.env.REDIS_URL,
});

export async function connectRedis(): Promise<void> {
  await redis.connect();
}

export const pg = new Pool({
  connectionString: process.env.DATABASE_URL,
});
