import { Socket } from "socket.io";
import { startRoundTimer } from "../../../handlers/gameplay/rock-paper-scissors.js";

const createStartRoundTimerSocket = (socket: Socket) => {
  const activeRooms = new Set<string>([]);

  socket.on(
    "startRoundTimer",
    async ({ roomId }: { roomId: string; opponentId: string }) => {
      console.log(
        `${new Date().toUTCString()} Start round timer for ${roomId}`
      );
      await startRoundTimer(roomId);
    }
  );
};

export default createStartRoundTimerSocket;
