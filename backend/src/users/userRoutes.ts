import { FastifyInstance } from 'fastify';
// import services later
import { userRegister, userLogin, getUserById, updateUser, deleteUser, userLogout, getAddressesByUserId, addAddressByUserId, updateAddressByAddressId, deleteAddressByAddressId } from './userService';
import { User, Address } from './UserTypes';
import { BadRequestError, UnauthorizedError } from '../../errors/customErrors';

export default async function userRoutes(server: FastifyInstance) {
	// REGISTER / POST user
	server.post('/users', async (request, reply) => {
		const user: User = request.body as User;
		try {
			const newUser: User = await userRegister(user);
			reply.status(201).send({ message: 'A new user was created', newUser });
		} catch (error: unknown) {
			const e = error as Error;

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
			//! LOGIN
			const user = await userLogin(email, password);
			//! JWT
			// Generate JWT after successful login => id, name, email

			// using returned info from userWithoutPassword => see userLogin in userService
			const jwtInfo = {
				id: user.user_id,
				name: user.first_name + ' ' + user.last_name,
				email: user.email,
				role: user.role,
			};

			const jwtGenerator = request.jwt.sign(jwtInfo);

			// set cookie with the jwt
			reply.setCookie('access_token', jwtGenerator, {
				path: '/', // => cookie sent with every request
				httpOnly: true,
				secure: true,
				maxAge: 86400, // 1 day
			});

			// reply includes token
			reply.status(200).send({ message: 'Login successful', accessToken: jwtGenerator });
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
				message: 'Error logging in user',
				error: e.message,
			});
		}
	});

	// LOGOUT user
	server.post('/logout', async (request, reply) => {
		try {
			const successfulLogout = userLogout(reply);

			reply.status(200).send({ message: 'Logout successful', successfulLogout });
		} catch (error: unknown) {
			const e = error as Error;

			// default
			return reply.status(500).send({
				message: 'There was an error logging out',
				error: e.message,
			});
		}
	});

	// GET user by ID
	server.get('/users/:id', { preHandler: [server.authenticate] }, async (request, reply) => {
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
	server.put('/users/:id', { preHandler: [server.authenticate_self] }, async (request, reply) => {
		const { id } = request.params as { id: string };
		const user: User = request.body as User;

		try {
			const updatedUser = await updateUser(user, id);
			reply.status(200).send({ message: 'Request successful, user updated', updatedUser });
		} catch (error: unknown) {
			const e = error as Error;

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
	server.delete('/users/:id', { preHandler: [server.authenticate_self] }, async (request, reply) => {
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

	//? USER ADDRESSES

	// GET address
	server.get('/users/addresses/:id', { preHandler: [server.authenticate_self] }, async (request, reply) => {
		const { id } = request.params as { id: string };

		try {
			const requestedAdresses = await getAddressesByUserId(id);

			if (requestedAdresses === null) {
				reply.status(200).send({ message: 'Request successful, but no addresses were found' });
			} else {
				reply.status(200).send({ message: 'Request successful', requestedAdresses });
			}
		} catch (error: unknown) {
			const e = error as Error;

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
				message: 'Error trying to get user addresses',
				error: e.message,
			});
		}
	});

	// POST address
	server.post('/users/addresses/:id', { preHandler: [server.authenticate_self] }, async (request, reply) => {
		const { id } = request.params as { id: string };
		const address: Address = request.body as Address;

		try {
			const newAddress = await addAddressByUserId(id, address);

			reply.status(201).send({ message: 'Request successful', newAddress });
		} catch (error: unknown) {
			const e = error as Error;

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
				message: 'Error trying to post new user address',
				error: e.message,
			});
		}
	});

	//! provide address id
	//? the first id needs to be the user for auth purposes
	// PUT update address
	server.put('/users/:id/addresses/:address_id', { preHandler: [server.authenticate_self] }, async (request, reply) => {
		const { address_id } = request.params as { address_id: string };
		const address: Address = request.body as Address;

		try {
			const updatedAddress = await updateAddressByAddressId(address_id, address);

			reply.status(200).send({ message: 'Request successful', updatedAddress });
		} catch (error: unknown) {
			const e = error as Error;

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
				message: 'Error trying to update user addresses',
				error: e.message,
			});
		}
	});

	//! provide address id
	//? the first id needs to be the user for auth purposes
	// DELETE address
	server.delete('/users/:id/addresses/:address_id', { preHandler: [server.authenticate_self] }, async (request, reply) => {
		const { address_id } = request.params as { address_id: string };

		try {
			const deleted = await deleteAddressByAddressId(address_id);

			if (deleted) {
				reply.status(204).send({ message: 'Request successful, address deleted.', deleted });
			} else {
				reply.status(404).send({ message: 'Request successful, but no address found to delete.', deleted });
			}
		} catch (error: unknown) {
			const e = error as Error;

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
				message: 'Error trying to delete user addresses',
				error: e.message,
			});
		}
	});
}
