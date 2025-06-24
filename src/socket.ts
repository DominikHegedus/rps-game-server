import { Server as HTTPServer } from "http";
import { Server as IOServer, Socket } from "socket.io";

// V1 Sockets
import createDisconnectSocket from "./sockets/v1/disconnect.socket.js";
import createJoinQueueSocket from "./sockets/v1/join-queue.socket.js";
import createLeaveQueueSocket from "./sockets/v1/leave-queue.socket.js";
import createSelectActionSocket from "./sockets/v1/rock-paper-scissors/select-action.socket.js";
import { ClientToServerTypes } from "./types/client-to-server.types.js";
import { ServerToClientTypes } from "./types/server-to-client.types.js";
import createAssetsLoadedSocket from "./sockets/v1/rock-paper-scissors/assets-loaded.socket.js";
import createStartRoundTimerSocket from "./sockets/v1/rock-paper-scissors/start-round-timer.socket.js";
import createUserReadySocket from "./sockets/v1/rock-paper-scissors/user-ready.socket.js";
import {
  roomRedis,
  roomRedisSubscriber,
  roundTimerRedis,
  roundTimerRedisSubscriber,
} from "./db/redis.js";
import { createRoundExpiredRPSWorker } from "./sockets/v1/rock-paper-scissors/workers/handle-round-expire.worker.js";
import { Queue } from "bullmq";

let io: IOServer | null = null;

// TODO: Add contract and payload system to sockets. Contract is the name of the action, payload is the data sent to the socket.
export function createSocketServer(server: HTTPServer) {
  if (!process.env.CORS_ORIGIN) {
    throw new Error("CORS_ORIGIN environment variable is not set");
  }

  io = new IOServer<ClientToServerTypes, ServerToClientTypes>(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ["GET", "POST"],
      allowedHeaders: ["Access-Control-Allow-Origin"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[${new Date().toUTCString()}] Socket connected: ${socket.id}`);

    // V1 Sockets
    createDisconnectSocket(socket);

    // Matchmaking Queue Sockets
    createJoinQueueSocket(socket);
    createLeaveQueueSocket(socket);

    // Rock Paper Scissors Sockets
    createSelectActionSocket(socket);
    createAssetsLoadedSocket(socket);
    createStartRoundTimerSocket(socket);
    createUserReadySocket(socket);

    // Redis Subscriptions
    createRoundTimerRedisSubscriptions();
    createRoomRedisSubscription();
  });
}

export function getIO(): IOServer {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}

async function createRoundTimerRedisSubscriptions() {
  await roundTimerRedis
    .config("SET", "notify-keyspace-events", "Ex")
    .then(() => {
      console.log("Keyspace notifications enabled.");
    });

  await roundTimerRedisSubscriber.subscribe(
    "__keyevent@0__:expired",
    (err, count) => {
      if (err) {
        console.error("Failed to subscribe:", err);
        return;
      }
      console.log(
        `${new Date().toUTCString()} Subscribed to expired key events.`
      );
    }
  );

  console.log(`${new Date().toUTCString()} Round Queue is being created!`);
  const roundQueue = new Queue("round-expired-rps", {
    connection: roundTimerRedis,
  });

  // TODO: attach this to fastify in the future
  const worker = createRoundExpiredRPSWorker();

  roundTimerRedisSubscriber.on("message", async (_, message) => {
    if (message.startsWith("room:rock-paper-scissors")) {
      console.log(
        `${new Date().toUTCString()} Round timer expired! ${message}`
      );
      await roundQueue.add(
        "handleRoundEndRPS",
        { roomId: message },
        {
          removeOnComplete: true,
          removeOnFail: true,
        }
      );
    }
  });
}

async function createRoomRedisSubscription() {
  await roomRedis.config("SET", "notify-keyspace-events", "KhEAh");
  await roomRedisSubscriber.psubscribe("__keyevent@0__:*");

  roomRedisSubscriber.on("pmessage", (pattern, channel, message) => {
    // console.log(
    //   `${new Date().toUTCString()} [ROOM REDIS] ${channel} -> ${message}`
    // );
  });
}
