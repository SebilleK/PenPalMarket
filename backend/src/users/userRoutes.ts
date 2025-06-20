import { FastifyInstance } from 'fastify';
// import services later
import { userRegister, userLogin, getUserById, updateUser, deleteUser } from './userService';
import { User } from './UserTypes';
import { BadRequestError, UnauthorizedError } from '../../errors/customErrors';
import { request } from 'http';

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
				return reply.status(400).send({
					message: 'Bad Request',
					error: e.message,
				});
			}

			// default
			return reply.status(500).send({
				message: 'Error registering user',
				error: e.message,
			});
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
			//! ADD CUSTOMS AS NEEDED?

			if (error instanceof BadRequestError) {
				return reply.status(400).send({
					message: 'Bad Request',
					error: e.message,
				});
			}

			if (error instanceof UnauthorizedError) {
				return reply.status(401).send({
					message: 'Unauthorized',
					error: e.message,
				});
			}

			// default
			return reply.status(500).send({
				message: 'Error registering user',
				error: e.message,
			});
		}
	});

	// GET user by ID
	server.get('/users/:id', async (request, reply) => {
		const { id } = request.params as { id: string };

		try {
			const requestedUser = await getUserById(id);

			if (requestedUser === null) {
				reply.status(200).send({ message: 'Request successful, but no user was found' });
			} else {
				reply.status(200).send({ message: 'Request successful', requestedUser });
			}
		} catch (error: unknown) {
			const e = error as Error;
			//! ADD CUSTOMS AS NEEDED?

			if (error instanceof BadRequestError) {
				return reply.status(400).send({
					message: 'Bad Request',
					error: e.message,
				});
			}

			if (error instanceof UnauthorizedError) {
				return reply.status(401).send({
					message: 'Unauthorized',
					error: e.message,
				});
			}

			// default
			return reply.status(500).send({
				message: 'Error trying to get user',
				error: e.message,
			});
		}
	});

	// PUT update user
	server.put('/users', async (request, reply) => {
		const user: User = request.body as User;

		try {
			const updatedUser = await updateUser(user);
			reply.status(200).send({ message: 'Request successful, user updated', updatedUser });
		} catch (error: unknown) {
			const e = error as Error;
			//! ADD CUSTOMS AS NEEDED?

			if (error instanceof BadRequestError) {
				return reply.status(400).send({
					message: 'Bad Request',
					error: e.message,
				});
			}

			if (error instanceof UnauthorizedError) {
				return reply.status(401).send({
					message: 'Unauthorized',
					error: e.message,
				});
			}

			// default
			return reply.status(500).send({
				message: 'Error trying to get user',
				error: e.message,
			});
		}
	});

	// DELETE user
	server.delete('/users/:id', async (request, reply) => {
		const { id } = request.params as { id: string };

		try {
			const deleted = await deleteUser(id);

			if (deleted) {
				reply.status(204).send({ message: 'Request successful, user deleted.', deleted });
			} else {
				reply.status(404).send({ message: 'Request successful, but no user found to delete.', deleted });
			}
		} catch (error: unknown) {
			const e = error as Error;
			//! ADD CUSTOMS AS NEEDED?

			if (error instanceof BadRequestError) {
				return reply.status(400).send({
					message: 'Bad Request',
					error: e.message,
				});
			}

			if (error instanceof UnauthorizedError) {
				return reply.status(401).send({
					message: 'Unauthorized',
					error: e.message,
				});
			}

			// default
			return reply.status(500).send({
				message: 'Error trying to delete user',
				error: e.message,
			});
		}
	});
}
