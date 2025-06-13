// Fastify
import Fastify from "fastify";
import cors from "@fastify/cors";
import "dotenv/config";

// Handlers
import { createSocketServer } from "./socket.js";

// V1 Routes
import testConnectionRoute from "./routes/v1/test-connection.route.js";

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: "*", // or set to your frontend URL like 'https://your-app.com'
  methods: ["GET", "POST"],
});

// V1 Routes
fastify.register(testConnectionRoute, { prefix: "/api/v1" });

async function start() {
  try {
    await fastify.listen({
      host: "::",
      port: Number(process.env.PORT) || 3000,
    });

    // Initialize Socket.IO
    createSocketServer(fastify.server);

    fastify.log.info("Server started");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
