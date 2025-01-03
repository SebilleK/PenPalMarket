// fastify server instance
import server from '../src/app';
// node testing
import assert from 'node:assert';
import { describe, it } from 'node:test';
// mock products
import mockProducts from '../database/json_mocks/mockProducts.json';

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
		const response = await server.inject({ method: 'GET', path: '/products/1' });

		assert.deepStrictEqual(response.statusCode, 200);

		const product = JSON.parse(response.payload);

		assert.deepStrictEqual(product.id, '1');
		assert.deepStrictEqual(product, mockProducts[0]);
	});

	// GET PRODUCTS BY NAME (tests 3 different queries)
	it('returns product by name', async () => {
		const responseFirstQuery = await server.inject({ method: 'GET', path: '/products?name=Pen' });
		assert.deepStrictEqual(responseFirstQuery.statusCode, 200);

		const productsFirstQuery = JSON.parse(responseFirstQuery.payload);
		assert.deepStrictEqual(productsFirstQuery.length, 3);

		const responseSecondQuery = await server.inject({ method: 'GET', path: '/products?name=Premium' });
		assert.deepStrictEqual(responseSecondQuery.statusCode, 200);

		const productsSecondQuery = JSON.parse(responseSecondQuery.payload);
		assert.deepStrictEqual(productsSecondQuery.length, 1);

		const responseThirdQuery = await server.inject({ method: 'GET', path: '/products?name=Something' });
		assert.deepStrictEqual(responseThirdQuery.statusCode, 200);

		const productsThirdQuery = JSON.parse(responseThirdQuery.payload);
		assert.deepStrictEqual(productsThirdQuery.length, 0);
	});

	// PRODUCT NOT FOUND
	it('returns 404 for non-existing product', async () => {
		const response = await server.inject({ method: 'GET', path: '/products/100' });

		assert.deepStrictEqual(response.statusCode, 404);

		const body = JSON.parse(response.payload);

		assert.deepStrictEqual(body.message, 'Product not found in database');
	});

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
			path: '/products/1',
			payload: {
				name: 'Simple Pen',
				price: 5.99,
			},
		});

		assert.deepStrictEqual(response.statusCode, 200);
	});

	// DELETES PRODUCT
	it('deletes a product', async () => {
		const response = await server.inject({ method: 'DELETE', path: '/products/1' });

		assert.deepStrictEqual(response.statusCode, 200);

		const testingDelete = await server.inject({ method: 'GET', path: '/products/1' });

		assert.deepStrictEqual(testingDelete.statusCode, 404);
	});
});
