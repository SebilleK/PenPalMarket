import { Product } from './ProductTypes';
import connection from '../../database/dbConnection';
import { ResultSetHeader } from 'mysql2';

// GET all products
export const getAllProducts = async (): Promise<Product[]> => {
	const sql = 'SELECT * FROM products';

	try {
		const [rows] = await connection.promise().query(sql);
		return rows as Product[];
	} catch (err) {
		throw new Error(`Error fetching products: ${err}`);
	}
};

// GET product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
	const sql = 'SELECT * FROM products WHERE product_id = ?';

	try {
		const [rows] = await connection.promise().query(sql, [id]);
		if (Array.isArray(rows) && rows.length > 0) {
			return rows[0] as Product;
		} else {
			return null;
		}
	} catch (err) {
		throw new Error(`Error fetching product with ID ${id}: ${err}`);
	}
};

// GET product by Name
export const getProductByName = async (name: string): Promise<Product[] | undefined> => {
	const sql = 'SELECT * FROM products WHERE name LIKE ?';

	try {
		const [rows] = await connection.promise().query(sql, [`%${name}%`]);
		if (Array.isArray(rows)) {
			return rows.length > 0 ? (rows as Product[]) : [];
		}
	} catch (err) {
		throw new Error(`Error fetching products with name "${name}": ${err}`);
	}
};

// POST (create) a product
export const createProduct = async (product: Product): Promise<Product> => {
	const { name, description, price, category, stock } = product;
	const sql = 'INSERT INTO products (id, name, description, price, category, stock) VALUES (?, ?, ?, ?, ?, ?)';

	try {
		const [result] = await connection.promise().query<ResultSetHeader>(sql, [name, description, price, category, stock]);

		const newProduct: Product = {
			...product,
			id: result.insertId.toString(),
		};

		return newProduct;
	} catch (err) {
		throw new Error(`Error creating product: ${err}`);
	}
};

// PUT (update) a product
export const updateProduct = async (id: string, productToUpdate: Partial<Product>): Promise<Product | Partial<Product> | null> => {
	const { name, description, price, category, stock } = productToUpdate;
	const sql = 'UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock = ? WHERE id = ?';

	try {
		const [result] = await connection.promise().query<ResultSetHeader>(sql, [name, description, price, category, stock, id]);
		if (result.affectedRows === 0) {
			return null;
		}

		// the returned product can be a partial one, depending on updated fields
		const updatedProduct: Partial<Product> = { id };
		if (name !== undefined) updatedProduct.name = name;
		if (description !== undefined) updatedProduct.description = description;
		if (price !== undefined) updatedProduct.price = price;
		if (category !== undefined) updatedProduct.category = category;
		if (stock !== undefined) updatedProduct.stock = stock;

		return updatedProduct;
	} catch (err) {
		throw new Error(`Error updating product with ID ${id}: ${err}`);
	}
};

// DELETE a product
export const deleteProduct = async (id: string): Promise<boolean> => {
	const sql = 'DELETE FROM products WHERE id = ?';

	try {
		const [result] = await connection.promise().query<ResultSetHeader>(sql, [id]);

		// returning boolean according to delete
		return result.affectedRows > 0;
	} catch (err) {
		throw new Error(`Error deleting product with ID ${id}: ${err}`);
	}
};
