// Import the framework and instantiate it
import Fastify from 'fastify'
const fastify = Fastify({
  logger: true
})

// Declare a route
fastify.get('/', async function handler (request, reply) {
  return { hello: 'world' }
})

// Run the server!
try {
  await fastify.listen({ port: Number(process.env.PORT?? 3000) })
} catch (err) {
  fastify.log.error(err)
  fastify.log.error(err.stack)
  process.exit(1)
}