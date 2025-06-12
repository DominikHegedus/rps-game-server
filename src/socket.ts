import { Server as HTTPServer } from "http";
import { Server as IOServer, Socket } from "socket.io";

// V1 Sockets
import createJoinRoomSocket from "./sockets/v1/join-room.socket.js";
import createRoomMessageSocket from "./sockets/v1/room-message.socket.js";
import createDisconnectSocket from "./sockets/v1/disconnect.socket.js";
import createJoinQueueSocket from "./sockets/v1/join-queue.socket.js";
import createLeaveQueueSocket from "./sockets/v1/leave-queue.socket.js";

let io: IOServer | null = null;

export function createSocketServer(server: HTTPServer) {
  io = new IOServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // V1 Sockets
    // Room Sockets
    createJoinRoomSocket(socket);
    createRoomMessageSocket(socket);
    createDisconnectSocket(socket);

    // Matchmaking Queue Sockets
    createJoinQueueSocket(socket, io!);
    createLeaveQueueSocket(socket);
  });
}

export function getIO(): IOServer {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}
