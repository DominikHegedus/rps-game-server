// Fastify
import Fastify from "fastify";
import cors from "@fastify/cors";
import "dotenv/config";

// Handlers
import { createSocketServer } from "./socket.js";

// V1 Routes
import testConnectionRoute from "./routes/v1/test-connection.route.js";
import { createServer } from "http";

const fastify = Fastify({ logger: true });

if (!process.env.CORS_ORIGIN) {
  throw new Error("CORS_ORIGIN environment variable is not set");
}

await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN, // or set to your frontend URL like 'https://your-app.com'
  allowedHeaders: ["Access-Control-Allow-Origin"],
  credentials: true,
  methods: ["GET", "POST"],
});

// V1 Routes
fastify.register(testConnectionRoute, { prefix: "/api/v1" });

async function start() {
  try {
    const httpServer = createServer(fastify.server);

    // Initialize Socket.IO
    createSocketServer(httpServer);

    const port = Number(process.env.PORT) || 3000;
    await httpServer.listen({
      port,
    });

    fastify.log.info(`Server started on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
