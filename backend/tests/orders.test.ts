// fastify server instance
import server from '../src/app';
// node testing
import assert from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';

//! setup for isolation, rollback
import { startTransaction, rollbackTransaction, seedTestUser } from './testHelpers';

beforeEach(async () => {
	await startTransaction();
	await seedTestUser();
});

afterEach(async () => {
	await rollbackTransaction();
});

describe('Shopping Cart and Orders', () => {
	//? SHOPPING CART
	// this one below creates a shopping cart, and then creates a shopping cart item that is correspondant to the actual item added
	it('user can add items to cart', async () => {
		const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
		// AUTH COOKIE / JWT
		const parsedJSON = JSON.parse(response.body);
		const setJWT = parsedJSON.accessToken;

		const id = 1;
		//product_id of the item // CHANGE BODY??AOIDHA
		const responsePOST = await server.inject({ method: 'POST', path: `/cart/${id}`, headers: { cookie: `access_token=${setJWT.toString()}` } });

		assert.deepStrictEqual(responsePOST.statusCode, 200);
	});

	//! DO DELETION, AND UPDATING QUANTITIES LATER
	it('user can place an order', async () => {
		const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
		// AUTH COOKIE / JWT
		const parsedJSON = JSON.parse(response.body);
		const setJWT = parsedJSON.accessToken;

		const id = 1;
		const responsePOST = await server.inject({ method: 'POST', path: `/users/${id}`, headers: { cookie: `access_token=${setJWT.toString()}` } });

		assert.deepStrictEqual(responsePOST.statusCode, 200);
	});

	it('user cant place an order without an address', async () => {
		const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
		// AUTH COOKIE / JWT
		const parsedJSON = JSON.parse(response.body);
		const setJWT = parsedJSON.accessToken;

		const id = 1;
		const responsePOST = await server.inject({ method: 'POST', path: `/users/${id}`, headers: { cookie: `access_token=${setJWT.toString()}` } });

		assert.deepStrictEqual(responsePOST.statusCode, 400);
	});

	it('user cant place an order without items on cart', async () => {
		const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
		// AUTH COOKIE / JWT
		const parsedJSON = JSON.parse(response.body);
		const setJWT = parsedJSON.accessToken;

		const id = 1;
		const responsePOST = await server.inject({ method: 'POST', path: `/users/${id}`, headers: { cookie: `access_token=${setJWT.toString()}` } });

		assert.deepStrictEqual(responsePOST.statusCode, 400);
	});
});
