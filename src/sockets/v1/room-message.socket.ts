import { Socket } from "socket.io";

const createRoomMessageSocket = (socket: Socket) => {
  socket.on(
    "roomMessage",
    ({ room, message }: { room: string; message: string }) => {
      console.log(`Message sent to room: ${room}`);
      socket.to(room).emit("message", message);
    }
  );
};

export default createRoomMessageSocket;
