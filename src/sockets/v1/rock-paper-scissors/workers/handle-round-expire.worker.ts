import { Worker } from "bullmq";
import { roundTimerRedis } from "../../../../db/redis.js";
import {
  communicateResultToUsers,
  evaluateRound,
} from "../../../../handlers/gameplay/rock-paper-scissors.js";

let workerInstance: Worker | null = null;

export function createRoundExpiredRPSWorker() {
  // Return existing worker if already created
  if (workerInstance) {
    console.log(
      `[${new Date().toUTCString()}] Returning existing worker instance`
    );
    return workerInstance;
  }

  console.log(`[${new Date().toUTCString()}] Creating new worker instance`);

  const worker = new Worker(
    "round-expired-rps",
    async (job) => {
      console.log(
        `[${new Date().toUTCString()}] Worker job started for roomId: ${
          job.data.roomId
        }`
      );

      try {
        const { roomId } = job.data;

        console.log(
          `[${new Date().toUTCString()}] Evaluating round for roomId: ${roomId}`
        );

        const { winner, player1Action, player2Action } = await evaluateRound(
          roomId
        );

        console.log(
          `[${new Date().toUTCString()}] Winner for ${roomId}: ${winner}, player1Action: ${player1Action}, player2Action: ${player2Action}`
        );

        console.log(
          `[${new Date().toUTCString()}] About to call communicateResultToUsers for roomId: ${roomId}`
        );

        await communicateResultToUsers(
          roomId,
          winner,
          player1Action,
          player2Action
        );

        console.log(
          `[${new Date().toUTCString()}] Successfully communicated results for roomId: ${roomId}`
        );
      } catch (error) {
        console.error(
          `[${new Date().toUTCString()}] Error in worker job:`,
          error
        );
        throw error; // Re-throw to mark job as failed
      }
    },
    { connection: roundTimerRedis }
  );

  // Add event listeners for debugging
  worker.on("ready", () => {
    console.log(
      `[${new Date().toUTCString()}] Round expired RPS worker is ready`
    );
  });

  worker.on("active", (job) => {
    console.log(
      `[${new Date().toUTCString()}] Worker processing job ${
        job.id
      } for roomId: ${job.data.roomId}`
    );
  });

  worker.on("completed", (job) => {
    console.log(
      `[${new Date().toUTCString()}] Worker completed job ${
        job.id
      } for roomId: ${job.data.roomId}`
    );
  });

  worker.on("failed", (job, err) => {
    console.error(
      `[${new Date().toUTCString()}] Worker failed job ${job?.id} for roomId: ${
        job?.data.roomId
      }:`,
      err
    );
  });

  // Store the worker instance
  workerInstance = worker;

  return worker;
}
