import { Socket } from "socket.io";

const createDisconnectSocket = (socket: Socket) => {
  socket.on("disconnect", () => {
    console.log(
      `[${new Date().toUTCString()}] Socket disconnected: ${socket.id}`
    );
  });
};

export default createDisconnectSocket;
