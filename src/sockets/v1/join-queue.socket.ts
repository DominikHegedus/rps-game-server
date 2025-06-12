import { Socket, Server as IOServer } from "socket.io";
import { addToQueue } from "src/handlers/matchmaking.js";
import { Game } from "src/types/game.types.js";

const createJoinQueueSocket = (socket: Socket, ioServer: IOServer) => {
  socket.on("joinQueue", ({ game }: { game: Game }) => {
    if (!game) return;
    addToQueue(socket, game, ioServer);
  });
};

export default createJoinQueueSocket;
