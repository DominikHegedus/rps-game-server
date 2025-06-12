import { Socket } from "socket.io";
import { removeFromQueue } from "../../handlers/matchmaking.js";
import { Game } from "../../types/game.types.js";

const createLeaveQueueSocket = (socket: Socket) => {
  socket.on("leaveQueue", ({ game }: { game: Game }) => {
    if (!game) return;
    removeFromQueue(socket, game);
  });
};

export default createLeaveQueueSocket;
