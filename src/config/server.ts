import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "dotenv";
import { Server } from "socket.io";
import { registerStatusRoutes } from "../routes/status.js";
import { FastifyInstance } from "fastify";

// Load environment variables
config();

export const createFastifyServer = () => {
  const server = Fastify({
    logger: true,
  });

  // Register plugins
  server.register(cors, {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  });

  // Health check route
  server.get("/health", async () => {
    return { status: "ok" };
  });

  return server;
};

export const setupSocketIO = (server: FastifyInstance, io: Server) => {
  // Register status routes with Socket.IO
  registerStatusRoutes(server, io);
};
