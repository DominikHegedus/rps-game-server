import { Socket } from "socket.io";
import { eq } from "drizzle-orm";
import { users } from "../db/schema.js";
import { db } from "../db/index.js";

export const handleSocketConnection = async (socket: Socket) => {
  console.log("Client connected:", socket.id);

  // Handle disconnection
  socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);
    // Update user's last seen timestamp
    if (socket.data.userId) {
      await db
        .update(users)
        .set({ lastSeen: new Date() })
        .where(eq(users.id, socket.data.userId));
    }
  });

  // Handle game events
  socket.on("join_game", async (data) => {
    console.log("Player joining game:", data);
    // TODO: Implement game joining logic using db
  });

  socket.on("make_move", async (data) => {
    console.log("Player made move:", data);
    // TODO: Implement game move logic using db
  });
};
