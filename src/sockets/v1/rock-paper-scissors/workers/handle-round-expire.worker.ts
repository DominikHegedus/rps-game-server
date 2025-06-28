import { Worker, Job } from "bullmq";
import { roundTimerRedis } from "../../../../db/redis.js";
import { logger } from "../../../../utils/logger.js";
import {
  communicateResultToUsers,
  evaluateRound,
} from "../../../../handlers/gameplay/rock-paper-scissors.js";

export const roundExpiredRPSWorker = new Worker(
  "round-expired-rps",
  async (job: Job) => {
    try {
      logger(
        `[Round Expired RPS Worker] Job data: ${JSON.stringify(job.data)}`
      );
      const { roomId } = job.data;

      const { winner, player1Action, player2Action } = await evaluateRound(
        roomId
      );

      logger(
        `[Round Expired RPS Worker] Winner for ${roomId}: ${winner}, player1Action: ${player1Action}, player2Action: ${player2Action}`
      );

      await communicateResultToUsers(
        roomId,
        winner,
        player1Action,
        player2Action
      );

      logger(
        `[Round Expired RPS Worker] Job completed successfully in for roomId: ${roomId}`
      );
      return;
    } catch (error) {
      logger(
        `[Round Expired RPS Worker] Error in worker job for roomId: ${job.data.roomId}: ${error}`
      );
    }
  },
  {
    connection: roundTimerRedis,
    autorun: false,
    concurrency: 5,
    removeOnComplete: {
      count: 0,
    },
    removeOnFail: {
      count: 0,
    },
    stalledInterval: 30000,
    maxStalledCount: 1,
  }
);
