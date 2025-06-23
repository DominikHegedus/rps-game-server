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
};

export default createStartRoundTimerSocket;
