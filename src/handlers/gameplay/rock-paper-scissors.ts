// Store the game state in redis in Hash format

import { Socket } from "socket.io";
import { roomRedis } from "../../db/redis.js";

export interface RockPaperScissorsGameplayServerToClient {
  roundEnded: (result: "won" | "lost" | "draw") => void;
  timer: (remainingSeconds: number) => void;
}

export async function startRoundTimer(
  socket1: Socket,
  socket2: Socket,
  roomId: string
) {
  let roundTimer: number = 10_000;
  const interval = setInterval(async () => {
    roundTimer -= 1000;

    console.log("Round timer:", roundTimer);

    socket1.emit("timer", roundTimer / 1000);
    socket2.emit("timer", roundTimer / 1000);

    if (roundTimer <= 0) {
      const winner = await evaluateRound(roomId);

      if (winner) {
        if (winner === "player1") {
          await roomRedis.hset(roomId, "winner", socket1.id);
          socket1.emit("roundEnded", "won");
          socket2.emit("roundEnded", "lost");
        } else if (winner === "player2") {
          await roomRedis.hset(roomId, "winner", socket2.id);
          socket1.emit("roundEnded", "lost");
          socket2.emit("roundEnded", "won");
        } else {
          await roomRedis.hset(roomId, "winner", "draw");
          socket1.emit("roundEnded", "draw");
          socket2.emit("roundEnded", "draw");
        }
      } else {
        clearInterval(interval);
        throw new Error("Something went wrong, no winner found!");
      }

      clearInterval(interval);

      return winner;
    }
  }, 1000);
}

export async function evaluateRound(
  roomId: string
): Promise<"draw" | "player1" | "player2" | null> {
  const player1Action = await roomRedis.hget(roomId, "player1Action");
  const player2Action = await roomRedis.hget(roomId, "player2Action");

  const winner = _evaluateRound(player1Action, player2Action);

  return winner;
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
