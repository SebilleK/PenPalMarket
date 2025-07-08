// fastify server instance
import server from '../src/app';
// node testing
import assert from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
// mock products
import mockProducts from '../database/json_mocks/mockProducts.json';
// mock users
import mockUser from '../database/json_mocks/mockUser.json';
import mockBadUser from '../database/json_mocks/mockBadUser.json';
import mockUserUpdate from '../database/json_mocks/mockUserUpdate.json';
import mockAddress from '../database/json_mocks/mockAddress.json';

//! setup for isolation, rollback
import { startTransaction, rollbackTransaction, seedTestUser } from './testHelpers';

beforeEach(async () => {
	await startTransaction();
	await seedTestUser();
});

afterEach(async () => {
	await rollbackTransaction();
});

describe('Product Routes', () => {
	// GET ALL PRODUCTS
	it('returns list of all products', async () => {
		const response = await server.inject({ method: 'GET', path: '/products' });

		assert.deepStrictEqual(response.statusCode, 200);

		const products = JSON.parse(response.payload);

		assert.deepStrictEqual(products.length, mockProducts.length);
	});

	// GET PRODUCT BY ID
	it('returns product by ID', async () => {
		const response = await server.inject({ method: 'GET', url: '/products/1' });

		assert.deepStrictEqual(response.statusCode, 200);

		const product = JSON.parse(response.body);

		// asserting it's the correct id and product (by description)
		assert.deepStrictEqual(product.product_id, 1);
		assert.deepStrictEqual(product.product_description, mockProducts[0].description);
	});

	// GET PRODUCTS BY NAME
	//  (tests two queries, the first would return 3 products and the second 1)
	it('returns product by name, search for 3 products', async () => {
		const response = await server.inject({ method: 'GET', path: '/products/search/Pen' });
		assert.deepStrictEqual(response.statusCode, 200);

		const products = JSON.parse(response.body);
		assert.deepStrictEqual(products.length, 3);
	});

	it('returns product by name, search for 1 product', async () => {
		const response = await server.inject({ method: 'GET', path: '/products/search/Premium' });
		assert.deepStrictEqual(response.statusCode, 200);

		const products = JSON.parse(response.body);
		assert.deepStrictEqual(products.length, 1);
	});

	// PRODUCT NOT FOUND
	it('returns 404 for non-existing product', async () => {
		const response = await server.inject({ method: 'GET', path: '/products/9999' });

		assert.deepStrictEqual(response.statusCode, 404);

		const body = JSON.parse(response.payload);

		assert.deepStrictEqual(body.message, 'Product not found in database');
	});

	// CREATING, UPDATING, DELETING PRODUCTS
	describe('Product C_UD Operations', () => {
		// CREATE PRODUCT
		it('creates a new product', async () => {
			const response = await server.inject({
				method: 'POST',
				path: '/products',
				payload: {
					name: 'Pen 3000',
					description: 'A new, special edition pen',
					price: 199.99,
					category: 'Premium',
					stock: 20,
				},
			});

			assert.deepStrictEqual(response.statusCode, 201);
		});

		// UPDATE PRODUCT
		it('updates a product', async () => {
			const response = await server.inject({
				method: 'PUT',
				path: `/products/1`,
				payload: {
					name: 'Simple Pen',
					price: 5.99,
					category: 'Basic',
					description: 'A better, but still simple pen',
				},
			});

			assert.deepStrictEqual(response.statusCode, 200);
		});

		// DELETE PRODUCT
		it('deletes a product', async () => {
			const response = await server.inject({ method: 'DELETE', path: `/products/1` });

			assert.deepStrictEqual(response.statusCode, 204);

			const testingDelete = await server.inject({ method: 'GET', path: `/products/21452341234` });

			assert.deepStrictEqual(testingDelete.statusCode, 404);
		});
	});
});

describe('Users Routes', () => {
	//? REGISTER USER
	it('user can register and info has to be unique', async () => {
		const response = await server.inject({ method: 'POST', path: '/users', body: mockUser });

		assert.deepStrictEqual(response.statusCode, 201);

		const responseSecondAttempt = await server.inject({ method: 'POST', path: '/users', body: mockUser });

		assert.deepStrictEqual(responseSecondAttempt.statusCode, 400);
	});

	it('bad register attempt gives out 400', async () => {
		const response = await server.inject({ method: 'POST', path: '/users', body: mockBadUser });

		assert.deepStrictEqual(response.statusCode, 400);
	});

	//? LOGIN USER // from here
	it('user can login', async () => {
		const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });

		assert.deepStrictEqual(response.statusCode, 200);
	});

	it('user cant login with wrong password', async () => {
		// BAD USER CREDENTIALS
		const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1########' } });

		// unauthorized
		assert.deepStrictEqual(response.statusCode, 401);
	});

	it('user has to provide all fields for login', async () => {
		const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com' } });

		// bad request
		assert.deepStrictEqual(response.statusCode, 400);
	});

	// ON THESE ROUTES, LEVEL 1 OR 2 AUTH IS USED - USERS
	describe('protected routes and JWT', () => {
		//? GET USER DETAILS
		it('user can access own details', async () => {
			const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(response.body);
			const setJWT = parsedJSON.accessToken;

			//! default mock user id
			const id = 1;
			const responseGET = await server.inject({ method: 'GET', path: `/users/${id}`, headers: { cookie: `access_token=${setJWT}` } });

			assert.deepStrictEqual(responseGET.statusCode, 200);

			const responseLogout = await server.inject({ method: 'POST', path: '/logout' });
			assert.deepStrictEqual(responseLogout.statusCode, 200);
		});

		//? PUT USER DETAILS
		it('user can edit own details', async () => {
			const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(response.body);
			const setJWT = parsedJSON.accessToken;

			const id = 1;
			const responsePUT = await server.inject({ method: 'PUT', path: `/users/${id}`, body: mockUserUpdate, headers: { cookie: `access_token=${setJWT.toString()}` } });

			assert.deepStrictEqual(responsePUT.statusCode, 200);

			const responseLogout = await server.inject({ method: 'POST', path: '/logout' });
			assert.deepStrictEqual(responseLogout.statusCode, 200);
		});

		it('user cant update other users', async () => {
			const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(response.body);
			const setJWT = parsedJSON.accessToken;

			const id = 2;
			const responsePUT = await server.inject({ method: 'PUT', path: `/users/${id}`, body: mockUserUpdate, headers: { cookie: `access_token=${setJWT}` } });

			assert.deepStrictEqual(responsePUT.statusCode, 403);

			const responseLogout = await server.inject({ method: 'POST', path: '/logout' });
			assert.deepStrictEqual(responseLogout.statusCode, 200);
		});

		//? DELETE USER
		it('user cant delete others', async () => {
			const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(response.body);
			const setJWT = parsedJSON.accessToken;

			const id = 2;
			const responseDELETE = await server.inject({ method: 'DELETE', path: `/users/${id}`, headers: { cookie: `access_token=${setJWT}` } });

			assert.deepStrictEqual(responseDELETE.statusCode, 403);

			const responseLogout = await server.inject({ method: 'POST', path: '/logout' });
			assert.deepStrictEqual(responseLogout.statusCode, 200);
		});

		it('user can delete itself', async () => {
			const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(response.body);
			const setJWT = parsedJSON.accessToken;

			const id = 1;
			const responseDELETE = await server.inject({ method: 'DELETE', path: `/users/${id}`, headers: { cookie: `access_token=${setJWT}` } });

			assert.deepStrictEqual(responseDELETE.statusCode, 204);

			const responseLogout = await server.inject({ method: 'POST', path: '/logout' });
			assert.deepStrictEqual(responseLogout.statusCode, 200);
		});

		describe('TEMPORARY: SHOPPING CART, ADDRESSES AND ORDERS', () => {
			//? SETTING ADDRESSES
			it('user can set an address', async () => {
				const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
				// AUTH COOKIE / JWT
				const parsedJSON = JSON.parse(response.body);
				const setJWT = parsedJSON.accessToken;

				const id = 1;
				// dont forget this is user address id!
				const responsePOST = await server.inject({ method: 'POST', path: `/address/${id}`, body: mockAddress, headers: { cookie: `access_token=${setJWT.toString()}` } });

				assert.deepStrictEqual(responsePOST.statusCode, 200);
			});

			it('user can update an address', async () => {
				const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
				// AUTH COOKIE / JWT
				const parsedJSON = JSON.parse(response.body);
				const setJWT = parsedJSON.accessToken;

				const id = 1;
				const responsePUT = await server.inject({ method: 'PUT', path: `/address/${id}`, body: mockAddress, headers: { cookie: `access_token=${setJWT.toString()}` } });

				assert.deepStrictEqual(responsePUT.statusCode, 200);
			});

			it('user can delete an address', async () => {
				const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
				// AUTH COOKIE / JWT
				const parsedJSON = JSON.parse(response.body);
				const setJWT = parsedJSON.accessToken;

				const id = 1;
				const responseDELETE = await server.inject({ method: 'DELETE', path: `/address/${id}`, body: mockAddress, headers: { cookie: `access_token=${setJWT.toString()}` } });

				assert.deepStrictEqual(responseDELETE.statusCode, 200);
			});

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
	});
});
