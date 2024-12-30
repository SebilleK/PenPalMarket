import Fastify from 'fastify';

const server = Fastify({
	logger: true,
});

// register routes
server.register(require('./routes/products'));

server.get('/', () => {
	return 'Hello from PenPal Market API!';
});

const start = async () => {
	try {
		await server.listen({ port: 3000, host: '127.0.0.1' });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
