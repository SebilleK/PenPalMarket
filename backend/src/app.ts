import Fastify from 'fastify';
// routes
import productRoutes from './products/productRoutes';
import userRoutes from './users/userRoutes';

const server = Fastify({
	// logger: true,
});

// register routes
server.register(productRoutes);
server.register(userRoutes);

server.get('/', () => {
	return 'Hello from PenPal Market API!';
});

export default server;
