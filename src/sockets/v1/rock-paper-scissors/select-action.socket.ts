import { Socket } from "socket.io";
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
      let player = "player2";

      if (socket.id === opponentId) {
        player = "player1";
        opponentId = await roomRedis.hget(roomId, "player2");
      }

      if (!opponentId) {
        return;
      }

      await roomRedis.hset(roomId, `${player}Action`, action);
    }
  );
};

export default createSelectActionSocket;
