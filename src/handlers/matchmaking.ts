import { Socket } from "socket.io";
import { getQueueKey } from "../db/redis-schema.js";
import { Game } from "../types/game.types.js";
import { getIO } from "../socket.js";
import { matchmakingRedis, roomRedis } from "../db/redis.js";
import { startRoundTimer } from "./gameplay/rock-paper-scissors.js";

export interface MatchmakingServerToClient {
  matchFound: ({
    game,
    opponent,
    roomId,
  }: {
    game: Game;
    opponent: string;
    roomId: string;
  }) => void;
}

// Add player to specific game queue
export async function addToQueue(socket: Socket, game: Game) {
  const queueKey = getQueueKey(game);
  await matchmakingRedis.rpush(queueKey, socket.id);

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
  await matchmakingRedis.lrem(queueKey, 0, socket.id);
  console.log(
    `[${new Date().toUTCString()}] [Matchmaker] ${
      socket.id
    } removed from ${game} queue`
  );
}

export async function removeFromAllQueues(socket: Socket) {
  await removeFromQueue(socket, "rock-paper-scissors");
  await removeFromQueue(socket, "duel");
}

// TODO: This is highly not optiomal
export async function removeFromAllRooms(socket: Socket) {
  const rooms = await roomRedis.keys("room:*");
  for (const room of rooms) {
    const player1 = await roomRedis.hget(room, "player1");
    const player2 = await roomRedis.hget(room, "player1");
    if ([player1, player2].includes(socket.id)) {
      await roomRedis.del(room);
    }
  }
}

// Match 2 players from a game-specific queue
async function tryMatch(game: Game) {
  const queueKey = getQueueKey(game);

  const queueLength = await matchmakingRedis.llen(queueKey);
  console.log(
    `[${new Date().toUTCString()}] [Matchmaker] Queue length: ${queueLength} in ${game} queue`
  );

  if (!queueLength) {
    return;
  }

  if (queueLength === 1) {
    // If we only got one player, requeue them
    const id1 = await matchmakingRedis.lpop(queueKey);
    if (id1) {
      await matchmakingRedis.rpush(queueKey, id1);

      console.log(
        `[${new Date().toUTCString()}] [Matchmaker] Requeued player ${id1} in ${game} queue`
      );
    }
    return;
  }

  const id1 = await matchmakingRedis.lpop(queueKey);
  const id2 = await matchmakingRedis.lpop(queueKey);

  if (!id1 || !id2) {
    return;
  }

  const ioServer = getIO();

  const s1 = ioServer.sockets.sockets.get(id1);
  const s2 = ioServer.sockets.sockets.get(id2);

  if (!s1 || !s2) return;

  const roomId = `room:${game}:${id1}:${id2}`;
  await matchmakingRedis.zrem(queueKey, [id1, id2]);

  s1.join(roomId);
  s2.join(roomId);

  await roomRedis.hset(roomId, {
    player1: id1,
    player2: id2,
    game,
    player1Action: null,
    player2Action: null,
  });

  s1.emit("matchFound", { game, opponent: id2, roomId });
  s2.emit("matchFound", { game, opponent: id1, roomId });

  const winner = await startRoundTimer(s1, s2, roomId);

  console.log("Winner:", winner);

  console.log(
    `[${new Date().toUTCString()}] [Matchmaker] ${id1} and ${id2} matched in ${roomId} for ${game}`
  );
}
