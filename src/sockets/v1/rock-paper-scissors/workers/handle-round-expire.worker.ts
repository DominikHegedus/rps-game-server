import { Worker } from "bullmq";
import { roundTimerRedis } from "src/db/redis.js";
import {
  communicateResultToUsers,
  evaluateRound,
} from "../../../../handlers/gameplay/rock-paper-scissors.js";

export function createRoundExpiredRPSWorker() {
  return new Worker(
    "round-expired-rps",
    async (job) => {
      const { roomId } = job.data;

      const winner = await evaluateRound(roomId);
      await communicateResultToUsers(roomId, winner);
    },
    { connection: roundTimerRedis }
  );
}
