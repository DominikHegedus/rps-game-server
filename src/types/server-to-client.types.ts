import { RockPaperScissorsGameplayServerToClient } from "src/handlers/gameplay/rock-paper-scissors.js";
import { MatchmakingServerToClient } from "src/handlers/matchmaking.js";

export type ServerToClientTypes =
  | MatchmakingServerToClient
  | RockPaperScissorsGameplayServerToClient;
