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
let isHandlerRegistered = false;
let isSubscriptionSetUp = false;
let roundQueue: any = null;

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
  if (isHandlerRegistered) {
    return;
  }

  // Only set up Redis configuration and subscription once
  if (!isSubscriptionSetUp) {
    await roundTimerRedis
      .config("SET", "notify-keyspace-events", "Ex")
      .then(() => {
        console.log("Keyspace notifications enabled.");
      });

    await roundTimerRedisSubscriber.psubscribe(
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
    roundQueue = new Queue("round-expired-rps", {
      connection: roundTimerRedis,
    });

    // Set up the event listener only once
    roundTimerRedisSubscriber.on("pmessage", async (_p, _c, message) => {
      if (message.startsWith("room:rock-paper-scissors")) {
        console.log(
          `${new Date().toUTCString()} Round timer expired! ${message}`
        );

        try {
          const job = await roundQueue.add(
            "handleRoundEndRPS",
            { roomId: message },
            {
              removeOnComplete: true,
              removeOnFail: true,
            }
          );
          console.log(
            `${new Date().toUTCString()} Job added to queue with ID: ${job.id}`
          );
        } catch (error) {
          console.error(
            `${new Date().toUTCString()} Failed to add job to queue:`,
            error
          );
        }
      }
    });

    isSubscriptionSetUp = true;
    console.log(
      `${new Date().toUTCString()} Redis subscription event listener set up`
    );
  }

  // TODO: attach this to fastify in the future
  // Create and start the worker (singleton pattern handled in worker file)
  try {
    const worker = createRoundExpiredRPSWorker();

    // Worker starts automatically when created, no need to call run()
    console.log(
      `${new Date().toUTCString()} Round expired RPS worker created and ready!`
    );
  } catch (error) {
    console.error(`${new Date().toUTCString()} Error with worker:`, error);
  }

  isHandlerRegistered = true;
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
