import { Socket } from "socket.io";
import { roomRedis } from "../../../db/redis.js";
import { getIO } from "../../../socket.js";
import { stopRoundTimer } from "../../../handlers/gameplay/rock-paper-scissors.js";
import { logger } from "../../../utils/logger.js";

const createUserReadySocket = (socket: Socket) => {
  socket.on(
    "userReady",
    async ({ roomId, opponentId }: { roomId: string; opponentId: string }) => {
      let [player1, player1Ready, player2Ready] = await roomRedis.hmget(
        roomId,
        "player1",
        "player2",
        "player1Ready",
        "player2Ready"
      );
      let player = "player1";
      if (socket.id !== player1) {
        player = "player2";
      }

      await roomRedis.hset(roomId, { [`${player}Ready`]: "true" });

      if (!opponentId) {
        return;
      }

      [player1Ready, player2Ready] = await roomRedis.hmget(
        roomId,
        "player1Ready",
        "player2Ready"
      );

      if (!!player1Ready && !!player2Ready) {
        const opponentSocket = getIO().sockets.sockets.get(opponentId);

        await stopRoundTimer(roomId);

        opponentSocket?.emit("bothReady");
        socket?.emit("bothReady");

        logger(`Both Users are ready in ${roomId}!`);
      }
    }
  );
};

export default createUserReadySocket;
