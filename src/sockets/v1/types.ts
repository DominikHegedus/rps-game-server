import { Game } from "../../types/game.types.js";

interface JoinQueueClientToServer {
  joinQueue: ({ game }: { game: Game }) => void;
}

interface LeaveQueueClientToServer {
  leaveQueue: ({ game }: { game: Game }) => void;
}

interface DisconnectClientToServer {
  disconnect: () => void;
}

export type CommonClientToServer =
  | DisconnectClientToServer
  | JoinQueueClientToServer
  | LeaveQueueClientToServer;
