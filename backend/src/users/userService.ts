import { User } from './UserTypes';
import connection from '../../database/dbConnection';
import { ResultSetHeader } from 'mysql2';
import { hashPassword, verifyPassword } from '../../utils/hash';

// REGISTER (post) a user
export const userRegister = async (user: User): Promise<User> => {
	const { created_at, user_id, first_name, last_name, role, phone_number, email, password } = user;

	if (!first_name || !last_name || !email || !password) {
		throw new Error('All required fields must be provided.');
	}

	const hashedPassword = await hashPassword(password);

	const sql = `
        INSERT INTO users 
        (created_at, user_id, first_name, last_name, role, phone_number, email, password) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

	try {
		const [result] = await connection.promise().query<ResultSetHeader>(sql, [created_at, user_id, first_name, last_name, role, phone_number, email, hashedPassword]);

		const newUser: User = {
			...user,
			password: hashedPassword,
			user_id: result.insertId.toString(),
		};

		return newUser;
	} catch (error) {
		throw new Error(`Error while trying to register new user: ${error}`);
	}
};

// LOGIN a user
export const userLogin = async (email: string, password: string): Promise<Omit<User, 'password'>> => {
	const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;

	try {
		const [rows] = await connection.promise().query(sql, [email]);

		if (!Array.isArray(rows) || rows.length === 0) {
			throw new Error('User not found.');
		}

		const user = rows[0] as User;

		const isPasswordValid = await verifyPassword(password, user.password);
		if (!isPasswordValid) {
			throw new Error('Invalid credentials.');
		}

		const { password: _, ...userWithoutPassword } = user;

		// Generate JWT later

		return userWithoutPassword;
	} catch (error) {
		throw new Error(`Error while trying to login: ${error}`);
	}
};

// GET a user

// UPDATE (put) a user

// DELETE a user
