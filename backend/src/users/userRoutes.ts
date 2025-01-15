import { FastifyInstance } from 'fastify';
// import services later
import { User } from './UserTypes';

export default async function userRoutes(server: FastifyInstance) {
	// REGISTER / POST user
	server.post('/users', async (request, reply) => {
		try {
			const user: User = request.body as User;
			// use the user info sent on request (user) on a service
			// return what's above as the result (newUser)
			// reply.status(201).send{newUser}
		} catch (error) {
			reply.status(500).send({ message: 'Error registering a new user' });
		}
	});
}
