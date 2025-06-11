import { FastifyPluginAsync } from "fastify";
import { getIO } from "../../socket.js";

const notifyRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/notify-room", async (request, reply) => {
    const { room, message } = request.body as {
      room?: string;
      message?: string;
    };

    if (!room || !message) {
      return reply.code(400).send({ error: "room and message required" });
    }

    const io = getIO();
    io.to(room).emit("message", message);

    return { sent: true };
  });
};

export default notifyRoutes;
