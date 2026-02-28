import Fastify from "fastify";
import { z } from "zod";
import {
  createJsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastifySensible from "@scalar/fastify-api-reference";
import fastifyCors from "@fastify/cors";
import { auth } from "./lib/auth.js";

const app = Fastify({ logger: true });

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Bootcamp Treinos API",
      description: "API para o Bootcamp Treinos",
      version: "1.0.0",
    },
    servers: [
      {
        description: "Localhost",
        url: "http://localhost:3000",
      },
    ],
  },
  transform: createJsonSchemaTransform({}),
});


await app.register(fastifyCors, {
  origin: ["http://localhost:3000"],
  credentials: true,
});

await app.register(fastifySensible, {
  routePrefix: "/docs",
  configuration: {
    sources: [
      {
        title: "Treinos api",
        slug: "treinos-api",
        url: "/swager.json",
      },
      {
        title: "Better Auth",
        slug: "better-auth",
        url: "/aoi/auth/open-ai/generate-schema",
      },
    ],
  },
});

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/swagger.json", // ✅ typo corrigido: "swager" → "swagger"
  schema: {
    hide: true, // esconde da documentação
  },
  handler: () => {
    return app.swagger(); // ✅ agora o tipo bate
  },
});


app.withTypeProvider<ZodTypeProvider>().route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    const url = new URL(request.url, `http://${request.headers.host}`);

    const headers = new Headers();
    Object.entries(request.headers).forEach(
      ([key, value]: [string, string | string[] | undefined]) => {
        if (value) headers.append(key, Array.isArray(value) ? value.join(", ") : value);
      }
    );

    const req = new Request(url.toString(), {
      method: request.method,
      headers,
      ...(request.body ? { body: JSON.stringify(request.body) } : {}),
    });

    const response = await auth.handler(req);

    reply.status(response.status);
    response.headers.forEach((value, key) => reply.header(key, value));
    reply.send(response.body ? await response.text() : null);
  },
});

try {
  await app.listen({ port: Number(process.env.PORT ?? 3000) });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}