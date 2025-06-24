import { Socket } from "socket.io";
import { roomRedis } from "../../../db/redis.js";
import { getIO } from "../../../socket.js";

const createUserReadySocket = (socket: Socket) => {
  socket.on(
    "userReady",
    async ({ roomId, opponentId }: { roomId: string; opponentId: string }) => {
      //   const [player1, player1Ready, player2Ready] = await roomRedis.hmget(
      //     roomId,
      //     "player1",
      //     "player2",
      //     "player1Ready",
      //     "player2Ready"
      //   );
      //   let player = "player1";
      //   if (socket.id !== player1) {
      //     player = "player2";
      //   }
      //   await roomRedis.hset(roomId, { [`${player}Ready`]: true });
      //   if (!opponentId) {
      //     return;
      //   }
      //   if (
      //     (player === "player1" && player2Ready) ||
      //     (player === "player2" && player1Ready)
      //   ) {
      //     const opponentSocket = getIO().sockets.sockets.get(opponentId);
      //     opponentSocket?.emit("startRound");
      //     socket?.emit("startRound");
      //   }
    }
  );
};

export default createUserReadySocket;
