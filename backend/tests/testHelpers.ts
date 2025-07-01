import connection from '../database/dbConnection';
import { hashPassword } from '../utils/hash';

export const startTransaction = () => connection.promise().query('START TRANSACTION');
export const rollbackTransaction = () => connection.promise().query('ROLLBACK');
export const seedTestUser = async () => {
	const hashedPassword = await hashPassword('TestPassword1#');
	const hashedAdminPassword = await hashPassword('TestPassword2#');

	try {
		const sql = `
    		INSERT INTO users (created_at, user_id, first_name, last_name, role, phone_number, email, password)
    		VALUES
				(NOW(), 1, 'Test', 'User', 'user', '+351960000000', 'test@user.com', ?),
				(NOW(), 2, 'Test', 'Admin', 'admin', '+351920000000', 'test@admin.com', ?)
  			`;

		connection.execute(sql, [hashedPassword, hashedAdminPassword]);
		console.log('Test user and test admin created successfully.');
	} catch (error) {
		throw new Error('There was a problem seeding the database with the test user.');
	}
};
