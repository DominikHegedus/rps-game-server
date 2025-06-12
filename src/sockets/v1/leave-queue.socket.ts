import { Socket } from "socket.io";
import { removeFromQueue } from "src/handlers/matchmaking.js";
import { Game } from "src/types/game.types.js";

const createLeaveQueueSocket = (socket: Socket) => {
  socket.on("leaveQueue", ({ game }: { game: Game }) => {
    if (!game) return;
    removeFromQueue(socket, game);
  });
};

export default createLeaveQueueSocket;
