import { RockPaperScissorsClientToServer } from "../sockets/v1/rock-paper-scissors/types.js";
import { CommonClientToServer } from "../sockets/v1/types.js";

export type ClientToServerTypes =
  | CommonClientToServer
  | RockPaperScissorsClientToServer;
