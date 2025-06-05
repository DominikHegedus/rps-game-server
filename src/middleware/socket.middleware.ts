import { Socket } from "socket.io";
import { validateSessionToken } from "../auth/auth.js";

export async function socketMiddleware(socket: Socket, next: Function) {
  const token = socket.handshake.auth.token; // or socket.handshake.query.token
  const { session, users } = await validateSessionToken(token);

  if (!session || !users) {
    return next(new Error("Invalid session"));
  }

  socket.data.user = users; // Attach user info to the socket
  next();
}
