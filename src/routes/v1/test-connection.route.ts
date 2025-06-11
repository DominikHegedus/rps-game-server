"use strict";

import { FastifyInstance, RouteShorthandOptions } from "fastify";

const options: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: "object",
        properties: {
          hello: { type: "string" },
        },
      },
    },
  },
};

async function routes(fastify: FastifyInstance) {
  fastify.get("/test-connection", options, async () => {
    return { hello: "world" };
  });
}

export default routes;
