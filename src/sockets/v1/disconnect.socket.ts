import { Socket } from "socket.io";
import { removeFromQueue } from "../../handlers/matchmaking.js";

const createDisconnectSocket = (socket: Socket) => {
  socket.on("disconnect", () => {
    removeFromQueue(socket, "rock-paper-scissors");
    removeFromQueue(socket, "duel");
    console.log(
      `[${new Date().toUTCString()}] Socket disconnected: ${socket.id}`
    );
  });
};

export default createDisconnectSocket;
