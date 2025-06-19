// fastify server instance
import server from '../src/app';
// node testing
import assert from 'node:assert';
import { describe, it } from 'node:test';
// mock products
import mockProducts from '../database/json_mocks/mockProducts.json';
// mock users
import mockUser from '../database/json_mocks/mockUser.json';
import mockBadUser from '../database/json_mocks/mockBadUser.json';

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
		let createdProductId: number;

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

			// storing the created product ID to update and delete the same product
			const createdProduct = JSON.parse(response.body);
			createdProductId = createdProduct.product_id;
		});

		// UPDATE PRODUCT
		it('updates a product', async () => {
			// if product creating suceeded, the variable exists
			assert.ok(createdProductId);

			const response = await server.inject({
				method: 'PUT',
				path: `/products/${createdProductId}`,
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
			assert.ok(createdProductId, 'Product was not created properly');

			const response = await server.inject({ method: 'DELETE', path: `/products/${createdProductId}` });

			assert.deepStrictEqual(response.statusCode, 200);

			const testingDelete = await server.inject({ method: 'GET', path: `/products/${createdProductId}` });

			assert.deepStrictEqual(testingDelete.statusCode, 404);
		});
	});
});

describe('Users Routes', () => {
	//? REGISTER USER
	it('user can register', async () => {
		const response = await server.inject({ method: 'POST', path: '/users', body: mockUser });

		assert.deepStrictEqual(response.statusCode, 201);
	});

	it('user cant register with same info', async () => {
		const response = await server.inject({ method: 'POST', path: '/users', body: mockUser });

		assert.deepStrictEqual(response.statusCode, 400);
	});

	it('bad register attempt gives out 400', async () => {
		const response = await server.inject({ method: 'POST', path: '/users', body: mockBadUser });

		assert.deepStrictEqual(response.statusCode, 400);
	});

	//? LOGIN USER
	it('user can login', async () => {
		const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'edelgard@blackeagles.com', password: '2206Edie#' } });
		assert.deepStrictEqual(response.statusCode, 200);

		//! verify jwt cookie exists - LATER
		// const cookies = response.cookies;

		// assert.ok(cookies, 'response gives cookies');
		// const jwtCookie = cookies.find(cookie => cookie.name === 'jwt');
		// assert.ok(jwtCookie, 'JWT cookie exists in the response');
	});

	it('user cant login with wrong password', async () => {
		// BAD USER CREDENTIALS
		const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'edelgard@blackeagles.com', password: '2210#Edie' } });

		// unauthorized
		assert.deepStrictEqual(response.statusCode, 401);
	});

	it('user has to provide all fields for login', async () => {
		const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'edelgard@blackeagles.com' } });

		// bad request
		assert.deepStrictEqual(response.statusCode, 400);
	});

	//? GET USER DETAILS
	it('user can access own details', async () => {
		const response = await server.inject({ method: 'GET', path: '/users' });

		assert.deepStrictEqual(response.statusCode, 200);
	});

	//? PUT USER DETAILS

	it('user can edit own details', async () => {
		const response = await server.inject({ method: 'PUT', path: '/users' });

		assert.deepStrictEqual(response.statusCode, 200);
	});

	it('user cant add incorrect details', async () => {
		const response = await server.inject({ method: 'PUT', path: '/users' });

		assert.deepStrictEqual(response.statusCode, 400);
	});

	//? DELETE USER
	it('user can delete itself', async () => {
		const response = await server.inject({ method: 'DELETE', path: '/users' });

		assert.deepStrictEqual(response.statusCode, 200);
	});
});
