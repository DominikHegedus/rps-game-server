import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { socketMiddleware } from "../middleware/socket.middleware.js";
import { handleSocketConnection } from "../handlers/socket.handler.js";

export const createSocketServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(socketMiddleware);
  io.on("connection", handleSocketConnection);

  return io;
};
