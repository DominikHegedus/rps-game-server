import { RockPaperScissorsClientToServer } from "src/sockets/v1/rock-paper-scissors/types.js";
import { CommonClientToServer } from "src/sockets/v1/types.js";

export type ClientToServerTypes =
  | CommonClientToServer
  | RockPaperScissorsClientToServer;
