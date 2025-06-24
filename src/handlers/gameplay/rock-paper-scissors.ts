// Store the game state in redis in Hash format

import { roomRedis } from "../../db/redis.js";
import { roundTimerRedis } from "../../db/redis.js";
import { getIO } from "../../socket.js";

export interface RockPaperScissorsGameplayServerToClient {
  roundEnded: (result: "won" | "lost" | "draw") => void;
  timer: (remainingSeconds: number) => void;
}

export async function startRoundTimer(roomId: string) {
  let roundTimer: number = 10_000;

  await roundTimerRedis.set(roomId, roundTimer);
  await roundTimerRedis.expire(roomId, 10);

  console.log(
    `${new Date().toUTCString()} Round Timer has been set for ${roomId}`
  );
}

export async function communicateResultToUsers(
  roomId: string,
  winner: "draw" | "player1" | "player2" | null,
  player1Action: string | null,
  player2Action: string | null
) {
  if (!winner) {
    throw new Error(`${new Date().toUTCString()} Something went wrong!`);
  }

  const [_, game, p1, p2] = roomId.split(":");

  const io = getIO();

  const socket1 = io.sockets.sockets.get(p1);
  const socket2 = io.sockets.sockets.get(p2);

  if (!socket1 || !socket2) {
    throw new Error(`${new Date().toUTCString()} Sockets could not be found!`);
  }

  if (winner === "player1") {
    await roomRedis.hset(roomId, "winner", socket1.id);

    socket1.emit("roundEnded", {
      opponentSelection: player2Action,
      resultForUser: "won",
    });
    socket2.emit("roundEnded", {
      opponentSelection: player1Action,
      resultForUser: "lost",
    });
  } else if (winner === "player2") {
    await roomRedis.hset(roomId, "winner", socket2.id);

    socket1.emit("roundEnded", {
      opponentSelection: player2Action,
      resultForUser: "lost",
    });
    socket2.emit("roundEnded", {
      opponentSelection: player1Action,
      resultForUser: "won",
    });
  } else {
    await roomRedis.hset(roomId, "winner", "draw");

    socket1.emit("roundEnded", {
      opponentSelection: player2Action,
      resultForUser: "draw",
    });
    socket2.emit("roundEnded", {
      opponentSelection: player1Action,
      resultForUser: "draw",
    });
  }
}

export async function evaluateRound(roomId: string): Promise<{
  winner: "draw" | "player1" | "player2" | null;
  player1Action: string | null;
  player2Action: string | null;
}> {
  const player1Action = await roomRedis.hget(roomId, "player1Action");
  const player2Action = await roomRedis.hget(roomId, "player2Action");

  const winner = _evaluateRound(player1Action, player2Action);

  return { winner, player1Action, player2Action };
}

function _evaluateRound(
  player1Action: string | null,
  player2Action: string | null
): "draw" | "player1" | "player2" {
  if (player1Action === player2Action) {
    return "draw";
  }

  if (!player1Action && !!player2Action) {
    return "player2";
  }

  if (!!player1Action && !player2Action) {
    return "player1";
  }

  if (
    (player1Action === "rock" && player2Action === "scissors") ||
    (player1Action === "paper" && player2Action === "rock") ||
    (player1Action === "scissors" && player2Action === "paper")
  ) {
    return "player1";
  }

  return "player2";
}
