import { Product } from './ProductTypes';
import connection from '../../database/dbConnection';
import { ResultSetHeader } from 'mysql2';
import { BadRequestError } from '../../errors/customErrors';

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

	if (!name || !description || !price || !category || !stock) {
		throw new BadRequestError('Please provide all necessary fields to update a product: name, description, price, category and stock.');
	}

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
			product_id: result.insertId.toString(),
		};

		return newProduct;
	} catch (err) {
		throw new Error(`Error creating product: ${err}`);
	}
};

// PUT (update) a product
export const updateProduct = async (id: string, productToUpdate: Partial<Product>): Promise<Product | Partial<Product> | null> => {
	if (id == undefined) {
		throw new BadRequestError('Please provide the ID of the product to update.');
	}

	const product_id = id;

	const { name, description, price, category, stock, imagePath } = productToUpdate;

	//? fields and values for SQL
	const fields: string[] = [];
	const values: any[] = [];

	if (!name && !description && !price && !category && !stock && !imagePath) {
		throw new BadRequestError('At least a field to update needs to be provided.');
	}

	if (name !== undefined) {
		fields.push('product_name = ?');
		values.push(name);
	}

	if (description !== undefined) {
		fields.push('product_description = ?');
		values.push(description);
	}

	if (price !== undefined) {
		fields.push('product_price = ?');
		values.push(price);
	}

	if (category !== undefined) {
		fields.push('category_id = (SELECT category_id FROM categories WHERE name = ? LIMIT 1)');
		values.push(category);
	}

	if (stock !== undefined) {
		fields.push('stock_quantity = ?');
		values.push(stock);
	}

	if (imagePath !== undefined) {
		fields.push('product_image_path = ? ');
		values.push(imagePath);
	}

	values.push(product_id);

	const sql = `UPDATE products SET ${fields.join(', ')} WHERE product_id = ?`;

	try {
		const [result] = await connection.promise().query<ResultSetHeader>(sql, values);

		if (result.affectedRows === 0) {
			return null; // product wasn't found
		}

		// return the full new updated product
		const refetchSql = 'SELECT * FROM products WHERE product_id =?';

		const [refetch] = await connection.promise().query(refetchSql, [product_id]);

		if (Array.isArray(refetch) && refetch.length > 0) {
			const updatedProduct = refetch[0] as Product;

			return updatedProduct;
		} else {
			throw new Error('Update ocurred but it was impossible to refetch the product from the database.');
		}
	} catch (err) {
		throw new Error(`Error updating product with ID ${product_id}: ${err}`);
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
