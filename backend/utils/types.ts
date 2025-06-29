import { JWT } from '@fastify/jwt';
// adding jwt property to req
// authenticate property to FastifyInstance
// please check https://medium.com/@atatijr/token-based-authentication-with-fastify-jwt-and-typescript-1fa5cccc63c5 !

declare module 'fastify' {
	interface FastifyRequest {
		jwt: JWT;
	}
	export interface FastifyInstance {
		authenticate: any;
		authenticate_self: any;
	}
}

type UserPayload = {
	id: string;
	email: string;
	name: string;
	role: string;
};

declare module '@fastify/jwt' {
	interface FastifyJWT {
		user: UserPayload;
	}
}
