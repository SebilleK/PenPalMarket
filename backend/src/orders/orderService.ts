import { Cart, Order } from './OrderTypes';
import { ResultSetHeader } from 'mysql2';
import connection from '../../database/dbConnection';

// GET a single cart
//! cart id
export const getCart = async (id: string): Promise<Cart | null> => {
	const sql = 'SELECT * FROM shopping_cart WHERE cart_id = ?';

	try {
		const [rows] = await connection.promise().query(sql, [id]);
		if (Array.isArray(rows) && rows.length > 0) {
			return rows[0] as Cart;
		} else {
			return null;
		}
	} catch (err) {
		throw new Error(`Error fetching carts with ID ${id}: ${err}`);
	}
};

// GET all user carts
//! user id
export const getUserCarts = async (id: string): Promise<Cart[] | null> => {
	const user_id = id;
	const sql = 'SELECT * FROM shopping_cart WHERE user_id = ?';

	try {
		const [rows] = await connection.promise().query(sql, [user_id]);
		if (Array.isArray(rows) && rows.length > 0) {
			return rows as Cart[];
		} else {
			return null;
		}
	} catch (err) {
		throw new Error(`Error fetching carts of user with ID ${user_id}: ${err}`);
	}
};

// POST (create) a cart
export const createCart = async (id: string): Promise<Cart> => {
	const user_id = id;

	const created_at = Date.now();

	const status = 'active';

	const cart = { created_at, user_id, status };

	const sql = `
        INSERT INTO shopping_cart 
        (created_at, user_id, status) 
        VALUES (?, ?, ?)
    `;

	try {
		const [result] = await connection.promise().query<ResultSetHeader>(sql, [created_at, user_id, status]);

		const newCart: Cart = {
			...cart,
			cart_id: result.insertId,
		};

		return newCart;
	} catch (err) {
		throw new Error(`Error creating product: ${err}`);
	}
};

// DELETE a cart
export const deleteCart = async (id: string): Promise<boolean> => {
	const sql = 'DELETE FROM shopping_cart WHERE cart_id = ?';

	try {
		const [result] = await connection.promise().query<ResultSetHeader>(sql, [id]);

		// returning boolean according to delete
		return result.affectedRows > 0;
	} catch (err) {
		throw new Error(`Error deleting cart with ID ${id}: ${err}`);
	}
};
