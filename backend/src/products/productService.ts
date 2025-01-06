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
	const sql = 'SELECT * FROM products WHERE product_name LIKE ?';

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
	const { name, description, price, category, stock, imagePath } = product;

	const sql = `
        INSERT INTO products 
        (product_name, product_description, product_price, category_id, stock_quantity, product_image_path) 
        VALUES (?, ?, ?, 
            (SELECT category_id FROM categories WHERE name = ? LIMIT 1), ?, ?)
    `;

	try {
		const [result] = await connection.promise().query<ResultSetHeader>(sql, [
			name,
			description,
			price,
			category, // converted in id in sql
			stock,
			imagePath || null,
		]);

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
	const { name, description, price, category, stock, imagePath } = productToUpdate;
	const sql = `
        UPDATE products 
        SET 
            product_name = ?, 
            product_description = ?, 
            product_price = ?, 
            category_id = (SELECT category_id FROM categories WHERE name = ? LIMIT 1), 
            stock_quantity = ?, 
            product_image_path = ? 
        WHERE product_id = ?
    `;

	try {
		const [result] = await connection.promise().query<ResultSetHeader>(sql, [name, description, price, category, stock, imagePath || null, id]);

		if (result.affectedRows === 0) {
			return null; // product wasn't found
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
	const sql = 'DELETE FROM products WHERE product_id = ?';

	try {
		const [result] = await connection.promise().query<ResultSetHeader>(sql, [id]);

		// returning boolean according to delete
		return result.affectedRows > 0;
	} catch (err) {
		throw new Error(`Error deleting product with ID ${id}: ${err}`);
	}
};
