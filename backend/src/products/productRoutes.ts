import { FastifyInstance } from 'fastify';
import { getAllProducts, getProductById, getProductByName, createProduct, updateProduct, deleteProduct } from './productService';
import { Product } from './ProductTypes';

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
			const product: Product | null = await getProductById(id);
			if (product === null) {
				reply.status(404).send({ message: 'Product not found in database' });
			} else {
				return product;
			}
		} catch (error) {
			reply.status(500).send({ message: 'Error fetching product', error: error });
		}
	});

	// GET products by name
	server.get('/products/search/:name', async (request, reply) => {
		const { name } = request.params as { name: string };
		try {
			const products = await getProductByName(name);
			if (products && products.length === 0) {
				reply.status(404).send({ message: `No products found with the name "${name}"` });
			} else {
				return products;
			}
		} catch (error) {
			reply.status(500).send({ message: 'Error fetching products by name' });
		}
	});

	// POST (create) a product
	server.post('/products', { preHandler: [server.authenticate_admin] }, async (request, reply) => {
		const product: Product = request.body as Product;
		try {
			const newProduct: Product = await createProduct(product);
			reply.status(201).send(newProduct);
		} catch (error) {
			reply.status(500).send({ message: 'Error creating product' });
		}
	});

	// PUT (update) a product
	server.put('/products/:id', { preHandler: [server.authenticate_admin] }, async (request, reply) => {
		const { id } = request.params as { id: string };
		const productToUpdate: Partial<Product> = request.body as Partial<Product>;

		if (Object.keys(productToUpdate).length === 0) {
			return reply.status(400).send({ message: 'No fields provided for update' });
		}

		try {
			const updatedProduct = await updateProduct(id, productToUpdate);
			if (updatedProduct === null) {
				reply.status(404).send({ message: 'Product not found in database' });
			} else {
				reply.send(updatedProduct);
			}
		} catch (error) {
			reply.status(500).send({ message: 'Error updating product' });
		}
	});

	// DELETE product
	server.delete('/products/:id', { preHandler: [server.authenticate_admin] }, async (request, reply) => {
		const { id } = request.params as { id: string };
		try {
			const deleted = await deleteProduct(id);
			if (deleted) {
				reply.status(204).send({ message: 'Product successfully deleted' });
			} else {
				reply.status(404).send({ message: 'Product not found in database' });
			}
		} catch (error) {
			reply.status(500).send({ message: 'Error deleting product' });
		}
	});
}
