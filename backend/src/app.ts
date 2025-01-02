import Fastify from 'fastify';
// routes
import productRoutes from './products/productRoutes';

const server = Fastify({
	logger: true,
});

// register routes
server.register(productRoutes);

server.get('/', () => {
	return 'Hello from PenPal Market API!';
});

export default server;

