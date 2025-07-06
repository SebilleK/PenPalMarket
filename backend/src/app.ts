import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
// routes
import productRoutes from './products/productRoutes';
import userRoutes from './users/userRoutes';
// jwt and cookies
import fjwt, { FastifyJWT } from '@fastify/jwt';
import fCookie from '@fastify/cookie';
// env
import dotenv from 'dotenv';
// errors
import { ForbiddenError, UnauthorizedError } from '../errors/customErrors';
// types
import '../utils/types';

// loading env variables
dotenv.config();

const server = Fastify({
	// logger: true,
});

// jwt
if (!process.env.SECRET_JWT) {
	throw new Error('SECRET_JWT is not defined! Add it to the environment variables.');
}

server.register(fjwt, {
	secret: process.env.SECRET_JWT,
	sign: {
		expiresIn: '1d',
	},
});

// SWAGGER - auto generating docs
server.register(import('@fastify/swagger'));
server.register(import('@fastify/swagger-ui'), {
	routePrefix: '/docs',
});

// preHandlers / AUTH checks
//? LEVEL 1 - AUTHENTICATED / LOGGED IN
server.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
	const token = req.cookies.access_token;

	if (!token) {
		throw new UnauthorizedError('Please login for access.');
	}

	//? will throw an error if token is invalid
	const decoded = req.jwt.verify<FastifyJWT['user']>(token);

	req.user = decoded;
});

//? LEVEL 2 - AUTHENTICATED AND REQUEST ID = USER ID (ON ACCESS_TOKEN)
server.decorate('authenticate_self', async (req: FastifyRequest, reply: FastifyReply) => {
	const { id } = req.params as { id: string };

	const token = req.cookies.access_token;

	// redundant, but custom message
	if (!token) {
		throw new UnauthorizedError('Please login for access.');
	}

	// delete later _____
	//? NOTE: THE BELOW CODE ONLY DECODES THE TOKEN, IT DOESNT VERIFY AUTHENTICITY!
	//! const decodedToken = server.jwt.decode(token);
	// delete later _____

	//? USE THE BELOW VER.
	const decoded = req.jwt.verify<FastifyJWT['user']>(token);

	if (decoded.id != id) {
		throw new ForbiddenError('Request ID and User ID mismatch.');
	}

	req.user = decoded;
});

//? LEVEL 3 - AUTHENTICATED AND ADMIN USER
server.decorate('authenticate_admin', async (req: FastifyRequest, reply: FastifyReply) => {
	const token = req.cookies.access_token;

	if (!token) {
		throw new UnauthorizedError('Please login for access.');
	}

	const decoded = req.jwt.verify<FastifyJWT['user']>(token);

	if (decoded.role != 'admin') {
		throw new ForbiddenError('User is not an administrator.');
	}

	req.user = decoded;
});

server.addHook('preHandler', (req, res, next) => {
	//! FIX LATER, STRICTER TYPING

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
	return `Hello from PenPal Market API! Please head over to /docs for all available routes.`;
});

export default server;
