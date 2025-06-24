import { Socket } from "socket.io";
import { roomRedis } from "../../../db/redis.js";
import { getIO } from "../../../socket.js";

const createAssetsLoadedSocket = (socket: Socket) => {
  socket.on(
    "assetsLoadedForUser",
    async ({
      roomId,
      opponentId,
    }: {
      action: "rock" | "paper" | "scissors";
      roomId: string;
      opponentId: string;
    }) => {
      let [player1, player1Loaded, player2Loaded] = await roomRedis.hmget(
        roomId,
        "player1",
        "player2",
        "player1Loaded",
        "player2Loaded"
      );

      let player = "player1";
      if (socket.id !== player1) {
        player = "player2";
      }

      await roomRedis.hset(roomId, { [`${player}Loaded`]: "true" });

      if (!opponentId) {
        return;
      }

      [player1Loaded, player2Loaded] = await roomRedis.hmget(
        roomId,
        "player1Loaded",
        "player2Loaded"
      );

      console.log(`[##########] player1Loaded ${player1Loaded}`);
      console.log(`[##########] player2Loaded ${player2Loaded}`);

      if (!!player1Loaded && !!player2Loaded) {
        const opponentSocket = getIO().sockets.sockets.get(opponentId);

        opponentSocket?.emit("startRound");
        socket?.emit("startRound");
      }
    }
  );
};

export default createAssetsLoadedSocket;
