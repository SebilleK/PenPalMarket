// fastify server instance
import server from '../src/app';
// node testing
import assert from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
// mock products
import mockProducts from '../database/json_mocks/mockProducts.json';
// mock data
// --

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
		it('cant create a new product if not admin', async () => {
			const responseLogin = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
			assert.deepStrictEqual(responseLogin.statusCode, 200);

			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(responseLogin.body);
			const setJWT = parsedJSON.accessToken;

			const response = await server.inject({
				method: 'POST',
				path: '/products',
				headers: { cookie: `access_token=${setJWT}` },
				payload: {
					name: 'Pen 3000',
					description: 'A new, special edition pen',
					price: 199.99,
					category: 'Premium',
					stock: 20,
				},
			});

			assert.deepStrictEqual(response.statusCode, 403);
		});

		// CREATE PRODUCT
		it('creates a new product', async () => {
			const responseLogin = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@admin.com', password: 'TestPassword2#' } });
			assert.deepStrictEqual(responseLogin.statusCode, 200);

			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(responseLogin.body);
			const setJWT = parsedJSON.accessToken;

			const response = await server.inject({
				method: 'POST',
				path: '/products',
				headers: { cookie: `access_token=${setJWT}` },
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
			const responseLogin = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@admin.com', password: 'TestPassword2#' } });
			assert.deepStrictEqual(responseLogin.statusCode, 200);

			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(responseLogin.body);
			const setJWT = parsedJSON.accessToken;

			const response = await server.inject({
				method: 'PUT',
				path: `/products/1`,
				headers: { cookie: `access_token=${setJWT}` },
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
			const responseLogin = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@admin.com', password: 'TestPassword2#' } });
			assert.deepStrictEqual(responseLogin.statusCode, 200);

			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(responseLogin.body);
			const setJWT = parsedJSON.accessToken;

			const response = await server.inject({ method: 'DELETE', headers: { cookie: `access_token=${setJWT}` }, path: `/products/1` });

			assert.deepStrictEqual(response.statusCode, 204);

			const testingDelete = await server.inject({ method: 'GET', headers: { cookie: `access_token=${setJWT}` }, path: `/products/21452341234` });

			assert.deepStrictEqual(testingDelete.statusCode, 404);
		});
	});
});
