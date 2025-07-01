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
			const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@admin.com', password: 'TestPassword2#' } });
			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(response.body);
			const setJWT = parsedJSON.accessToken;

			const responsePOST = await server.inject({
				method: 'POST',
				path: '/products',
				payload: {
					name: 'Pen 3000',
					description: 'A new, special edition pen',
					price: 199.99,
					category: 'Premium',
					stock: 20,
				},
				headers: { cookie: `access_token=${setJWT}` },
			});

			assert.deepStrictEqual(responsePOST.statusCode, 201);

			const responseLogout = await server.inject({ method: 'POST', path: '/logout' });
			assert.deepStrictEqual(responseLogout.statusCode, 200);
		});

		it('wont create a product without all the needed fields', async () => {
			const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@admin.com', password: 'TestPassword2#' } });
			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(response.body);
			const setJWT = parsedJSON.accessToken;

			const responsePOST = await server.inject({
				method: 'POST',
				path: '/products',
				payload: {
					description: 'A new, special edition pen',
					category: 'Premium',
					stock: 20,
				},
				headers: { cookie: `access_token=${setJWT}` },
			});

			assert.deepStrictEqual(responsePOST.statusCode, 400);

			const responseLogout = await server.inject({ method: 'POST', path: '/logout' });
			assert.deepStrictEqual(responseLogout.statusCode, 200);
		});

		// UPDATE PRODUCT
		it('updates a product', async () => {
			const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@admin.com', password: 'TestPassword2#' } });
			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(response.body);
			const setJWT = parsedJSON.accessToken;

			const responsePUT = await server.inject({
				method: 'PUT',
				path: `/products/1`,
				payload: {
					name: 'Simple Pen',
					price: 5.99,
					category: 'Basic',
					description: 'A better, but still simple pen',
				},
				headers: { cookie: `access_token=${setJWT}` },
			});

			assert.deepStrictEqual(responsePUT.statusCode, 200);

			const responseLogout = await server.inject({ method: 'POST', path: '/logout' });
			assert.deepStrictEqual(responseLogout.statusCode, 200);
		});

		// DELETE PRODUCT
		it('deletes a product', async () => {
			const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@admin.com', password: 'TestPassword2#' } });
			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(response.body);
			const setJWT = parsedJSON.accessToken;

			const responseDELETE = await server.inject({ method: 'DELETE', path: `/products/1`, headers: { cookie: `access_token=${setJWT}` } });

			assert.deepStrictEqual(responseDELETE.statusCode, 204);

			const testingDelete = await server.inject({ method: 'GET', path: `/products/21452341234` });

			assert.deepStrictEqual(testingDelete.statusCode, 404);

			const responseLogout = await server.inject({ method: 'POST', path: '/logout' });
			assert.deepStrictEqual(responseLogout.statusCode, 200);
		});

		it('normal user cant create, update or delete a product', async () => {
			const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(response.body);
			const setJWT = parsedJSON.accessToken;

			const responsePOST = await server.inject({
				method: 'POST',
				path: '/products',
				payload: {
					name: 'Pen 3000',
					description: 'A new, special edition pen',
					price: 199.99,
					category: 'Premium',
					stock: 20,
				},
				headers: { cookie: `access_token=${setJWT}` },
			});

			assert.deepStrictEqual(responsePOST.statusCode, 403);

			const responsePUT = await server.inject({
				method: 'PUT',
				path: `/products/1`,
				payload: {
					name: 'Simple Pen',
					price: 5.99,
					category: 'Basic',
					description: 'A better, but still simple pen',
				},
				headers: { cookie: `access_token=${setJWT}` },
			});

			assert.deepStrictEqual(responsePUT.statusCode, 403);

			const responseDELETE = await server.inject({ method: 'DELETE', path: `/products/1`, headers: { cookie: `access_token=${setJWT}` } });

			assert.deepStrictEqual(responseDELETE.statusCode, 403);

			const responseLogout = await server.inject({ method: 'POST', path: '/logout' });
			assert.deepStrictEqual(responseLogout.statusCode, 200);
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
	});
});
