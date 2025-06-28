import connection from '../database/dbConnection';
import { hashPassword } from '../utils/hash';

export const startTransaction = () => connection.promise().query('START TRANSACTION');
export const rollbackTransaction = () => connection.promise().query('ROLLBACK');
export const seedTestUser = async () => {
	const hashedPassword = await hashPassword('TestPassword1#');

	try {
		const sql = `
    		INSERT INTO users (created_at, user_id, first_name, last_name, role, phone_number, email, password)
    		VALUES (NOW(), 1, 'Test', 'User', 'user', '+351960000000', 'test@user.com', ?)
  			`;

		connection.execute(sql, [hashedPassword]);
		console.log('Test user created successfuly.');
	} catch (error) {
		throw new Error('There was a problem seeding the database with the test user.');
	}
};
