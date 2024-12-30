// src/routes/products.ts
import { FastifyInstance } from 'fastify';
import { getAllProducts, getProductById } from '../services/productService';
import { Product } from '../types/Product';

export default async function productRoutes(server: FastifyInstance) {
	// GET all products
	server.get('/products', async (request, reply) => {
		try {
			const products: Product[] = await getAllProducts();
			return products;
		} catch (error) {
			reply.status(500).send({ message: 'Error fetching products' });
		}
	});

	// GET product by ID
	server.get('/products/:id', async (request, reply) => {
		const { id } = request.params as { id: string };
		try {
			const product: Product | undefined = await getProductById(id);
			if (!product) {
				reply.status(404).send({ message: 'Product not found in database' });
			} else {
				return product;
			}
		} catch (error) {
			reply.status(500).send({ message: 'Error fetching product' });
		}
	});
}
