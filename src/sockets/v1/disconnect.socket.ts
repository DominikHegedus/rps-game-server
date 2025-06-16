import { Socket } from "socket.io";
import {
  removeFromAllQueues,
  removeFromAllRooms,
} from "../../handlers/matchmaking.js";

const createDisconnectSocket = (socket: Socket) => {
  socket.on("disconnect", () => {
    removeFromAllQueues(socket);

    removeFromAllRooms(socket);

    console.log(
      `[${new Date().toUTCString()}] Socket disconnected: ${socket.id}`
    );
  });
};

export default createDisconnectSocket;
