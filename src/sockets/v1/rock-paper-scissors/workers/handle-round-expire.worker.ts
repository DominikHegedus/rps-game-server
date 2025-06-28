import { Worker } from "bullmq";
import { roundTimerRedis } from "../../../../db/redis.js";
import {
  communicateResultToUsers,
  evaluateRound,
} from "../../../../handlers/gameplay/rock-paper-scissors.js";
import { logger } from "../../../../utils/logger.js";

let workerInstance: Worker | null = null;

export function createRoundExpiredRPSWorker() {
  // Return existing worker if already created
  if (workerInstance) {
    logger("Returning existing worker instance");
    return workerInstance;
  }

  logger("Creating new worker instance");

  const worker = new Worker(
    "round-expired-rps",
    async (job) => {
      logger(`Worker job started for roomId: ${job.data.roomId}`);
      try {
        const { roomId } = job.data;

        logger(`Evaluating round for roomId: ${roomId}`);

        const { winner, player1Action, player2Action } = await evaluateRound(
          roomId
        );

        logger(
          `Winner for ${roomId}: ${winner}, player1Action: ${player1Action}, player2Action: ${player2Action}`
        );

        logger(`About to call communicateResultToUsers for roomId: ${roomId}`);

        await communicateResultToUsers(
          roomId,
          winner,
          player1Action,
          player2Action
        );

        logger(`Successfully communicated results for roomId: ${roomId}`);
      } catch (error) {
        logger(`Error in worker job: ${error}`);
        throw error; // Re-throw to mark job as failed
      }
    },
    { connection: roundTimerRedis }
  );

  // Add event listeners for debugging
  worker.on("ready", () => {
    logger("Round expired RPS worker is ready");
  });

  worker.on("active", (job) => {
    logger(`Worker processing job ${job.id} for roomId: ${job.data.roomId}`);
  });

  worker.on("completed", (job) => {
    logger(`Worker completed job ${job.id} for roomId: ${job.data.roomId}`);
  });

  worker.on("failed", (job, err) => {
    logger(
      `Worker failed job ${job?.id} for roomId: ${job?.data.roomId}: ${err}`
    );
  });

  // Store the worker instance
  workerInstance = worker;

  return worker;
}
