import { FastifyInstance } from 'fastify';
import { BadRequestError, UnauthorizedError } from '../../errors/customErrors';
import { Cart } from './OrderTypes';
import { createCart, deleteCart, getCart, getUserCarts } from './orderService';

export default async function orderRoutes(server: FastifyInstance) {
	// GET shopping cart
	//! cart id
	server.get(
		'/cart/:id/:cart_id',
		{
			schema: {
				tags: ['Orders'],
			},
			preHandler: [server.authenticate_self],
		},
		async (request, reply) => {
			const { id } = request.params as { id: string };
			const { cart_id } = request.params as { cart_id: string };

			try {
				const fetchedCart: Cart | null = await getCart(cart_id);
				if (fetchedCart === null) {
					reply.status(404).send({ message: 'Request successful, but no cart was found' });
				} else {
					reply.status(200).send({ message: 'Request successful', fetchedCart });
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
					message: 'Error trying to create a new shopping cart',
					error: e.message,
				});
			}
		},
	);

	//! user id
	// GET ALL shopping cart
	server.get(
		'/cart/:id',
		{
			schema: {
				tags: ['Orders'],
			},
			preHandler: [server.authenticate_self],
		},
		async (request, reply) => {
			const { id } = request.params as { id: string };

			try {
				const fetchedCarts: Cart[] | null = await getUserCarts(id);
				if (fetchedCarts === null) {
					reply.status(404).send({ message: 'No carts for specified user found in database' });
				} else {
					reply.status(200).send(fetchedCarts);
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
					message: 'Error trying to create a new shopping cart',
					error: e.message,
				});
			}
		},
	);

	// POST shopping cart
	server.post(
		'/cart/:id',
		{
			schema: {
				tags: ['Orders'],
			},
			preHandler: [server.authenticate_self],
		},
		async (request, reply) => {
			const { id } = request.params as { id: string };

			try {
				const newCart: Cart = await createCart(id);
				reply.status(201).send(newCart);
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
					message: 'Error trying to create a new shopping cart',
					error: e.message,
				});
			}
		},
	);

	//! send cart id
	// DELETE shopping cart
	server.delete(
		'/cart/:id/:cart_id',
		{
			schema: {
				tags: ['Orders'],
			},
			preHandler: [server.authenticate_self],
		},
		async (request, reply) => {
			const { id } = request.params as { id: string };
			const { cart_id } = request.params as { cart_id: string };

			try {
				const deleted = await deleteCart(cart_id);

				if (deleted) {
					reply.status(204).send({ message: 'Request successful, user shopping cart deleted.', deleted });
				} else {
					reply.status(404).send({ message: 'Request successful, but no user shopping cart found to delete.', deleted });
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
					message: 'Error trying to create a new shopping cart',
					error: e.message,
				});
			}
		},
	);
}
