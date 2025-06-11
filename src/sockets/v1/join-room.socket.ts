import { Socket } from "socket.io";

const createJoinRoomSocket = (socket: Socket) => {
  socket.on("joinRoom", (room: string) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
    socket.to(room).emit("message", `${socket.id} joined ${room}`);
  });
};

export default createJoinRoomSocket;
