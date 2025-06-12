import { Socket } from "socket.io";
import { addToQueue } from "../../handlers/matchmaking.js";
import { Game } from "../../types/game.types.js";

const createJoinQueueSocket = (socket: Socket) => {
  socket.on("joinQueue", ({ game }: { game: Game }) => {
    if (!game) return;
    addToQueue(socket, game);
  });
};

export default createJoinQueueSocket;
