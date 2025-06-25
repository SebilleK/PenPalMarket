import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
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

//! MOVE THIS ELSEWHERE LATER!
//! additional auth is made in the routes themselves.
//? Check if there is a token, and if not the user is unauthenticated!
server.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
	const token = req.cookies.access_token;
	if (!token) {
		return reply.status(401).send({ message: 'Authentication required. Please login.' });
	}
	// here decoded will be a different type by default but we want it to be of user-payload type
	// @ts-ignore
	const decoded = req.jwt.verify<FastifyJWT['user']>(token);
	req.user = decoded;
});

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
