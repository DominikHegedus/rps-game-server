import { Worker } from "bullmq";
import { roundTimerRedis } from "../../../../db/redis.js";
import {
  communicateResultToUsers,
  evaluateRound,
} from "../../../../handlers/gameplay/rock-paper-scissors.js";

export function createRoundExpiredRPSWorker() {
  return new Worker(
    "round-expired-rps",
    async (job) => {
      const { roomId } = job.data;

      const { winner, player1Action, player2Action } = await evaluateRound(
        roomId
      );

      console.log(
        `[${new Date().toUTCString()}] Winner for ${roomId}: ${winner}`
      );

      await communicateResultToUsers(
        roomId,
        winner,
        player1Action,
        player2Action
      );
    },
    { connection: roundTimerRedis }
  );
}
