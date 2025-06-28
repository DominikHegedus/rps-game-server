import { Socket } from "socket.io";
import {
  removeFromAllQueues,
  removeFromAllRooms,
} from "../../handlers/matchmaking.js";
import { logger } from "../../utils/logger.js";

const createDisconnectSocket = (socket: Socket) => {
  socket.on("disconnect", () => {
    removeFromAllQueues(socket);

    removeFromAllRooms(socket);

    logger(`Socket disconnected: ${socket.id}`);
  });
};

export default createDisconnectSocket;
