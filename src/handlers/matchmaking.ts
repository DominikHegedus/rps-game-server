import { Socket } from "socket.io";
import { redis } from "../db/redis.js";
import { getQueueKey } from "../db/redis-schema.js";
import { Game } from "../types/game.types.js";
import { getIO } from "../socket.js";

// Add player to specific game queue
export async function addToQueue(socket: Socket, game: Game) {
  const queueKey = getQueueKey(game);
  await redis.rpush(queueKey, socket.id);
  console.log(
    `[${new Date().toUTCString()}] [Matchmaker] ${
      socket.id
    } added to ${game} queue`
  );

  await tryMatch(game);
}

// Remove from specific queue (or all if needed)
export async function removeFromQueue(socket: Socket, game: Game) {
  const queueKey = getQueueKey(game);
  await redis.lrem(queueKey, 0, socket.id);
  console.log(
    `[${new Date().toUTCString()}] [Matchmaker] ${
      socket.id
    } removed from ${game} queue`
  );
}

// Match 2 players from a game-specific queue
async function tryMatch(game: Game) {
  const queueKey = getQueueKey(game);

  const queueLength = await redis.llen(queueKey);
  console.log(
    `[${new Date().toUTCString()}] [Matchmaker] Queue length: ${queueLength} in ${game} queue`
  );

  if (!queueLength) {
    return;
  }

  if (queueLength === 1) {
    // If we only got one player, requeue them
    const id1 = await redis.lpop(queueKey);
    if (id1) {
      await redis.rpush(queueKey, id1);

      console.log(
        `[${new Date().toUTCString()}] [Matchmaker] Requeued player ${id1} in ${game} queue`
      );
    }
    return;
  }

  const id1 = await redis.lpop(queueKey);
  const id2 = await redis.lpop(queueKey);

  if (!id1 || !id2) {
    return;
  }

  console.log("ID1:", id1);
  console.log("ID2:", id2);

  const ioServer = getIO();

  const s1 = ioServer.sockets.sockets.get(id1);
  const s2 = ioServer.sockets.sockets.get(id2);

  console.log("IDs:", id1, id2);
  console.log("Sockets:", ioServer.sockets.sockets.keys());

  if (!s1 || !s2) return;

  const roomId = `room:${game}:${id1}:${id2}`;
  await redis.zrem(queueKey, id1, id2);

  s1.join(roomId);
  s2.join(roomId);

  s1.emit("matchFound", { game, opponent: id2, roomId });
  s2.emit("matchFound", { game, opponent: id1, roomId });

  console.log(
    `[${new Date().toUTCString()}] [Matchmaker] ${id1} and ${id2} matched in ${roomId} for ${game}`
  );
}
