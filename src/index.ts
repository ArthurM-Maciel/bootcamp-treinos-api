import Fastify from 'fastify'
import { z } from 'zod'
import {
  createJsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';


const app = Fastify({ logger: true })

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);


await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Bootcamp Treinos API',
        description: 'API para o Bootcamp Treinos',
        version: '1.0.0',
      },
      servers: [
        {
            description: 'Localhost',
            url: 'http://localhost:3000',
        },
    ],
  },
  transform: createJsonSchemaTransform({})
});

await app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
  });

app.withTypeProvider<ZodTypeProvider>().route({
  method: 'GET',
  url: '/',
  schema: {
    tags: ['Hello World'],
    response: {
      200: z.object({
        message: z.string(),
      }),
    },
  },
  handler: () => ({ message: 'Hello World' }),
})

try {
  await app.listen({ port: Number(process.env.PORT ?? 3000) })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}