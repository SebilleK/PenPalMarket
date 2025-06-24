import Fastify from 'fastify';
// routes
import productRoutes from './products/productRoutes';
import userRoutes from './users/userRoutes';
// jwt and cookies
import fjwt from '@fastify/jwt';
import fCookie from '@fastify/cookie';
// env
import dotenv from 'dotenv';

// loading env variables
dotenv.config();

const server = Fastify({
	// logger: true,
});

// jwt
if (!process.env.SECRET_JWT) {
	throw new Error('SECRET_JWT is not defined! Add it to the environment variables.');
}

server.register(fjwt, { secret: process.env.SECRET_JWT });

server.addHook('preHandler', (req, res, next) => {
	//! FIX LATER, STRICTER TYPING
	// @ts-ignore
	req.jwt = server.jwt;
	return next();
});

// cookies
server.register(fCookie, {
	secret: process.env.SECRET_COOKIE,
	hook: 'preHandler',
});

// register routes
server.register(productRoutes);
server.register(userRoutes);

server.get('/', () => {
	return 'Hello from PenPal Market API! Please see the docs for all available routes.';
});

export default server;
