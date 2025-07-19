import { Cart, Order } from './orderTypes';
import { ResultSetHeader } from 'mysql2';
import connection from '../../database/dbConnection';

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

export const deleteCart = async (id: string): Promise<boolean> => {
	const cart_id = id;

	// TBA
	return true;
};
