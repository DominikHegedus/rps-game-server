import { Socket } from "socket.io";
import { getIO } from "../../../socket.js";
import { roomRedis } from "../../../db/redis.js";

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
      let opponentId = await roomRedis.hget(roomId, "player1");

      if (socket.id === opponentId) {
        opponentId = await roomRedis.hget(roomId, "player2");
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
