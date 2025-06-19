import { FastifyInstance } from 'fastify';
// import services later
import { userRegister, userLogin } from './userService';
import { User } from './UserTypes';
import { BadRequestError } from '../../errors/customErrors';

export default async function userRoutes(server: FastifyInstance) {
	// REGISTER / POST user
	server.post('/users', async (request, reply) => {
		const user: User = request.body as User;
		try {
			const newUser: User = await userRegister(user);
			reply.status(201).send({ message: 'A new user was created', newUser });
		} catch (error: unknown) {
			const e = error as Error;
			//! ADD CUSTOMS AS NEEDED?

			if (error instanceof BadRequestError) {
				reply.status(400).send({
					message: 'Bad Request',
					error: e.message,
				});
			} else {
				reply.status(500).send({
					message: 'Error registering user',
					error: e.message,
				});
			}
		}
	});

	// LOGIN user
	server.post('/login', async (request, reply) => {
		const { email, password } = request.body as { email: string; password: string };

		try {
			const user = await userLogin(email, password);
			reply.status(200).send({ message: 'Login successful' });
		} catch (error: unknown) {
			const e = error as Error;
			reply.status(401).send({ message: 'Unauthorized, please check your credentials', error: e.message });
		}
	});
}
