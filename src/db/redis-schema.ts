import { Game } from "../types/game.types.js";

export function getQueueKey(game: Game): string {
  return `matchmaking:${game}:queue`;
}

export function getRoomKey(roomId: string): string {
  return `room:${roomId}`;
}
