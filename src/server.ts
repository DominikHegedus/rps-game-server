// Fastify
import Fastify from "fastify";
import cors from "@fastify/cors";

// Handlers
import { createSocketServer } from "./socket.js";

// V1 Routes
import testConnectionRoute from "./routes/v1/test-connection.route.js";
import notifyRoomRoute from "./routes/v1/notify-room.route.js";

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: "*", // or set to your frontend URL like 'https://your-app.com'
  methods: ["GET", "POST"],
});

// V1 Routes
fastify.register(testConnectionRoute, { prefix: "/api/v1" });
fastify.register(notifyRoomRoute, { prefix: "/api/v1" });

async function start() {
  try {
    await fastify.listen({ port: 3000 });

    // Initialize Socket.IO
    createSocketServer(fastify.server);

    fastify.log.info("Server started");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
