import { User } from './UserTypes';
import connection from '../../database/dbConnection';
import { ResultSetHeader } from 'mysql2';
import { hashPassword, verifyPassword } from '../../utils/hash';
import { BadRequestError } from '../../errors/customErrors';

// REGISTER (post) a user
export const userRegister = async (user: User): Promise<User> => {
	const { first_name, last_name, role, phone_number, email, password } = user;

	if (!first_name || !last_name || !email || !password) {
		throw new BadRequestError('All required fields must be provided.');
	}

	//! email check
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		throw new BadRequestError('Email format is invalid.');
	}

	const sqlEmailCheck = `SELECT * FROM users WHERE email = ? LIMIT 1`;
	const [emailRows] = await connection.promise().query(sqlEmailCheck, [email]);

	if (Array.isArray(emailRows) && emailRows.length > 0) {
		throw new BadRequestError('The provided email has already been registered.');
	}
	//! ____________
	//! number check
	const sqlPhoneCheck = `SELECT * FROM users WHERE phone_number= ? LIMIT 1`;
	const [phoneRows] = await connection.promise().query(sqlPhoneCheck, [phone_number]);

	if (Array.isArray(phoneRows) && phoneRows.length > 0) {
		throw new BadRequestError('The provided phone number has already been registered.');
	}
	//! ____________
	//! password check
	const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;

	if (!passwordRegex.test(password)) {
		throw new BadRequestError('Password must be 6 to 16 characters and have at least one number and a special character');
	}
	//! _____________

	const hashedPassword = await hashPassword(password);

	const created_at = Date.now();

	const sql = `
        INSERT INTO users 
        (created_at, first_name, last_name, role, phone_number, email, password) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

	try {
		const [result] = await connection.promise().query<ResultSetHeader>(sql, [created_at, first_name, last_name, role, phone_number, email, hashedPassword]);

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

// GET a user by a ID
export const getUserById = async (id: string): Promise<User | null> => {
	const sql = 'SELECT * FROM users WHERE user_id =?';

	try {
		const [rows] = await connection.promise().query(sql, [id]);
		if (Array.isArray(rows) && rows.length > 0) {
			return rows[0] as User;
		} else {
			return null;
		}
	} catch (err) {
		throw new Error(`Error fetching product with ID ${id}: ${err}`);
	}
};

// UPDATE (put) a user
//! TBA

// DELETE a user
//!TBA
