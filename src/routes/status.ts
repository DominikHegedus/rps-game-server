import { FastifyInstance } from "fastify";
import { Server } from "socket.io";

export const registerStatusRoutes = (server: FastifyInstance, io: Server) => {
  // Get WebSocket server status
  server.get("/api/v1/status", async () => {
    const sockets = await io.fetchSockets();
    return {
      status: "ok",
      connections: {
        total: sockets.length,
        active: sockets.map((socket) => ({
          id: socket.id,
          userId: socket.data.userId,
          connectedAt: socket.handshake.time,
        })),
      },
    };
  });

  // Test WebSocket connection
  server.get("/api/v1/test-connection", async (request, reply) => {
    return {
      message: "WebSocket server is running",
      endpoint: `ws://${request.headers.host}`,
      cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
    };
  });
};
