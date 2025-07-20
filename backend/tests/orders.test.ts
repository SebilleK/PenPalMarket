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
	it('can create a cart', async () => {
		const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
		// AUTH COOKIE / JWT
		const parsedJSON = JSON.parse(response.body);
		const setJWT = parsedJSON.accessToken;

		const id = 1;
		// use user_id to create a cart for user
		const responsePOST = await server.inject({ method: 'POST', path: `/cart/${id}`, headers: { cookie: `access_token=${setJWT.toString()}` } });

		assert.deepStrictEqual(responsePOST.statusCode, 201);
	});

	it('can get a cart by cart_id', async () => {
		const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
		// AUTH COOKIE / JWT
		const parsedJSON = JSON.parse(response.body);
		const setJWT = parsedJSON.accessToken;

		const id = 1;
		// use user_id to create a cart for user
		const responsePOST = await server.inject({ method: 'POST', path: `/cart/${id}`, headers: { cookie: `access_token=${setJWT.toString()}` } });

		assert.deepStrictEqual(responsePOST.statusCode, 201);

		//? getting cart_id from created cart
		const parsedPostJSON = JSON.parse(responsePOST.body);
		const createdCartId = parsedPostJSON.cart_id;

		const responseGET = await server.inject({ method: 'GET', path: `/cart/${id}/${createdCartId}`, headers: { cookie: `access_token=${setJWT.toString()}` } });
		assert.deepStrictEqual(responseGET.statusCode, 200);
	});

	it('can get carts by user_id', async () => {
		const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
		// AUTH COOKIE / JWT
		const parsedJSON = JSON.parse(response.body);
		const setJWT = parsedJSON.accessToken;

		const id = 1;
		// use user_id to create a cart for user
		const responsePOST = await server.inject({ method: 'POST', path: `/cart/${id}`, headers: { cookie: `access_token=${setJWT.toString()}` } });
		assert.deepStrictEqual(responsePOST.statusCode, 201);

		const responseGET = await server.inject({ method: 'GET', path: `/cart/${id}`, headers: { cookie: `access_token=${setJWT.toString()}` } });
		assert.deepStrictEqual(responseGET.statusCode, 200);
	});

	// TBA
	it('can delete a cart', async () => {
		const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
		// AUTH COOKIE / JWT
		const parsedJSON = JSON.parse(response.body);
		const setJWT = parsedJSON.accessToken;

		const id = 1;

		const responsePOST = await server.inject({ method: 'POST', path: `/cart/${id}`, headers: { cookie: `access_token=${setJWT.toString()}` } });
		assert.deepStrictEqual(responsePOST.statusCode, 201);

		//? getting cart_id from created cart
		const parsedPostJSON = JSON.parse(responsePOST.body);
		const createdCartId = parsedPostJSON.cart_id;

		//! provide cart_id, not user_id to delete cart (also provide user id for auth purposes though)
		const responseDELETE = await server.inject({ method: 'DELETE', path: `/cart/${id}/${createdCartId}`, headers: { cookie: `access_token=${setJWT.toString()}` } });
		assert.deepStrictEqual(responseDELETE.statusCode, 204);
	});

	it('can add item to a cart', async () => {
		const response = 'fail';
		assert.deepStrictEqual(response, 'notfail');
	});

	it('can remove item from cart', async () => {
		const response = 'fail';
		assert.deepStrictEqual(response, 'notfail');
	});

	it('user can place an order', async () => {
		const response = 'fail';
		assert.deepStrictEqual(response, 'notfail');
	});

	it('user cant place an order without an address', async () => {
		const response = 'fail';
		assert.deepStrictEqual(response, 'notfail');
	});

	it('user cant place an order without items on cart', async () => {
		const response = 'fail';
		assert.deepStrictEqual(response, 'notfail');
	});
});
