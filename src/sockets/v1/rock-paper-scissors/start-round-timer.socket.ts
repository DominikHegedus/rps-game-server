import { Socket } from "socket.io";
import {
  evaluateRound,
  startRoundTimer,
} from "../../../handlers/gameplay/rock-paper-scissors.js";
import { getIO } from "../../../socket.js";
import {
  roundTimerRedis,
  roundTimerRedisSubscriber,
} from "../../../db/redis.js";
import { Queue } from "bullmq";
import { createRoundExpiredRPSWorker } from "./workers/handle-round-expire.worker.js";

const createStartRoundTimerSocket = (socket: Socket) => {
  const activeRooms = new Set<string>([]);

  socket.on(
    "startRoundTimer",
    async ({ roomId }: { roomId: string; opponentId: string }) => {
      console.log(
        `${new Date().toUTCString()} Start round timer for ${roomId}`
      );
      await startRoundTimer(roomId, activeRooms);
    }
  );

  roundTimerRedisSubscriber.subscribe(
    "__keyevent@0__:expired",
    (err, count) => {
      if (err) {
        console.error("Failed to subscribe:", err);
        return;
      }
      console.log(
        `${new Date().toUTCString()} Subscribed to expired key events.`
      );
    }
  );

  console.log(`${new Date().toUTCString()} Round Queue is being created!`);
  const roundQueue = new Queue("round-expired-rps", {
    connection: roundTimerRedis,
  });

  // TODO: attach this to fastify in the future
  const worker = createRoundExpiredRPSWorker();

  roundTimerRedisSubscriber.on("message", async (_, message) => {
    if (message.startsWith("room:rock-paper-scissors")) {
      console.log(
        `${new Date().toUTCString()} Round timer expired! ${message}`
      );
      await roundQueue.add(
        "handleRoundEndRPS",
        { roomId: message },
        {
          removeOnComplete: true,
          removeOnFail: true,
        }
      );
    }
  });
};

export default createStartRoundTimerSocket;
