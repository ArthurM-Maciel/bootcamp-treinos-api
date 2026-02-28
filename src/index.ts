import Fastify from 'fastify'
import { z } from 'zod'
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';

const app = Fastify({ logger: true })

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

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