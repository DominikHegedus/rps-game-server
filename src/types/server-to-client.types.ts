import { RockPaperScissorsGameplayServerToClient } from "../handlers/gameplay/rock-paper-scissors.js";
import { MatchmakingServerToClient } from "../handlers/matchmaking.js";

export type ServerToClientTypes =
  | MatchmakingServerToClient
  | RockPaperScissorsGameplayServerToClient;
