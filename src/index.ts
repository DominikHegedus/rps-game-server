import { createServer } from "http";
import { createFastifyServer, setupSocketIO } from "./config/server.js";
import { createSocketServer } from "./config/socket.js";

// Create Fastify server
const server = createFastifyServer();

// Create HTTP server with Fastify
const httpServer = createServer(server.server);

// Initialize Socket.IO
const io = createSocketServer(httpServer);

// Setup Socket.IO with Fastify
setupSocketIO(server, io);

// Start the server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || "3000");
    await server.listen({ port, host: "0.0.0.0" });

    console.log(`Server is running on port ${port}`);
    console.log(`HTTP endpoint: http://localhost:${port}`);
    console.log(`WebSocket endpoint: ws://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`Status check: http://localhost:${port}/api/status`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
