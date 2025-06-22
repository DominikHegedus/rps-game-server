interface RockPaperScissorsSelectActionClientToServer {
  selectAction: ({
    action,
    roomId,
  }: {
    action: "rock" | "paper" | "scissors";
    roomId: string;
  }) => Promise<void>;
}

export type RockPaperScissorsClientToServer =
  RockPaperScissorsSelectActionClientToServer;
