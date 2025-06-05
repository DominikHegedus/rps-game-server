import Fastify from "fastify";
import cors from "@fastify/cors";
import { Server } from "socket.io";
import { createServer } from "http";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { users } from "./db/schema.js";
import { db } from "./db/index.js";
import { socketMiddleware } from "./middleware/socket.middleware.js";

// Load environment variables
config();

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

// Create HTTP server
const httpServer = createServer(server.server);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use(socketMiddleware);

// Socket.IO connection handler
io.on("connection", async (socket) => {
  console.log("Client connected:", socket.id);

  // Handle disconnection
  socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);
    // Update user's last seen timestamp
    if (socket.data.userId) {
      await db
        .update(users)
        .set({ lastSeen: new Date() })
        .where(eq(users.id, socket.data.userId));
    }
  });

  // Handle game events
  socket.on("join_game", async (data) => {
    console.log("Player joining game:", data);
    // TODO: Implement game joining logic using db
  });

  socket.on("make_move", async (data) => {
    console.log("Player made move:", data);
    // TODO: Implement game move logic using db
  });
});

// Start the server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || "3000");
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`Server is running on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
