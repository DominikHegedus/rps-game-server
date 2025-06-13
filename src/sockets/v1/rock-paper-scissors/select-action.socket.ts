import { Socket } from "socket.io";
import { redis } from "../../../db/redis.js";
import { getRoomKey } from "../../../db/redis-schema.js";
import { getIO } from "../../../socket.js";

const createSelectActionSocket = (socket: Socket) => {
  socket.on(
    "selectAction",
    async ({
      action,
      roomId,
    }: {
      action: "rock" | "paper" | "scissors";
      roomId: string;
    }) => {
      let opponentId = await redis.hget(getRoomKey(roomId), "player1");
      if (socket.id !== opponentId) {
        opponentId = await redis.hget(getRoomKey(roomId), "player2");
      }

      if (!opponentId) {
        return;
      }

      const ioServer = getIO();
      const opponentSocket = ioServer.sockets.sockets.get(opponentId);

      opponentSocket?.emit("opponentActionSelected", {
        action,
      });
    }
  );
};

export default createSelectActionSocket;
