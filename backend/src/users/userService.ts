import { User } from './UserTypes';
import connection from '../../database/dbConnection';
import { ResultSetHeader } from 'mysql2';
import { hashPassword, verifyPassword } from '../../utils/hash';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from '../../errors/customErrors';
import { FastifyReply } from 'fastify';

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
	if (!email || !password) {
		throw new BadRequestError('All required fields must be provided.');
	}

	const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;

	try {
		const [rows] = await connection.promise().query(sql, [email]);

		if (!Array.isArray(rows) || rows.length === 0) {
			throw new Error('User not found.');
		}

		const user = rows[0] as User;

		const isPasswordValid = await verifyPassword(password, user.password);
		if (!isPasswordValid) {
			throw new UnauthorizedError('Invalid credentials.');
		}

		//? User exists + Password correct => Generate a JWT (id,name,email) => this is handled in the userRoutes.ts !

		const { password: _, ...userWithoutPassword } = user;

		return userWithoutPassword;
	} catch (error) {
		// known errors
		if (error instanceof BadRequestError || error instanceof UnauthorizedError) {
			throw error;
		} else {
			// unknown
			throw new Error(`Error while trying to login: ${error}`);
		}
	}
};

// LOGOUT a user
export const userLogout = async (reply: FastifyReply): Promise<string> => {
	try {
		// cleaning cookies
		//? clear cookie storing jwt!
		reply.clearCookie('access_token', { path: '/' });

		console.log('access_token cookie cleared successfuly');

		return 'success! logging out.';
	} catch (error) {
		throw new Error(`Error while trying to logout: ${error}`);
	}
};

// GET a user by a ID
export const getUserById = async (id: string): Promise<Omit<User, 'password'> | null> => {
	const sql = 'SELECT * FROM users WHERE user_id =?';

	if (!id) {
		throw new BadRequestError('Please provide an user ID.');
	}

	try {
		const [rows] = await connection.promise().query(sql, [id]);
		if (Array.isArray(rows) && rows.length > 0) {
			const user = rows[0] as User;

			const { password: _, ...userWithoutPassword } = user;

			return userWithoutPassword;
		} else {
			return null;
		}
	} catch (err) {
		throw new Error(`Error fetching product with ID ${id}: ${err}`);
	}
};

// UPDATE (put) a user
export const updateUser = async (user: Partial<User>, id: string): Promise<Omit<User, 'password'> | null> => {
	//! ___________
	if (id == undefined) {
		throw new BadRequestError('Please provide the ID of the user to update.');
	}

	const user_id = id;

	const { first_name, last_name, phone_number, email, password } = user;

	//? fields and values for SQL
	const fields: string[] = [];
	const values: string[] = [];

	//! ___________
	if (!first_name && !last_name && !email && !password && !phone_number) {
		throw new BadRequestError('At least a field to update needs to be provided.');
	}

	//? dynamically preparing SQL statement

	if (first_name !== undefined) {
		fields.push('first_name = ?');
		values.push(first_name);
	}

	if (last_name !== undefined) {
		fields.push('last_name = ?');
		values.push(last_name);
	}

	if (phone_number !== undefined) {
		fields.push('phone_number = ?');
		values.push(phone_number);
	}

	//! email _____

	if (email !== undefined) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw new BadRequestError('Email format is invalid.');
		}

		fields.push('email = ?');
		values.push(email);
	}

	//! password __

	if (password !== undefined) {
		const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;

		if (!passwordRegex.test(password)) {
			throw new BadRequestError('Password must be 6 to 16 characters and have at least one number and a special character');
		}

		fields.push('password = ?');

		const hashedPassword = await hashPassword(password);
		values.push(hashedPassword);
	}

	//!_______________

	values.push(user_id);

	//? dinamically building SQL according to provided fields. Allows partial updates and avoids errors/ wiping info
	const sql = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`;

	try {
		const [rows] = await connection.promise().query<ResultSetHeader>(sql, values);

		if (rows.affectedRows === 0) {
			throw new NotFoundError('No user found to update!');
		}

		// return the full new updated user
		const refetchSql = 'SELECT * FROM users WHERE user_id =?';

		const [refetch] = await connection.promise().query(refetchSql, [user_id]);

		if (Array.isArray(refetch) && refetch.length > 0) {
			const updatedUser = refetch[0] as User;

			const { password: _, ...userWithoutPassword } = updatedUser;

			return userWithoutPassword;
		} else {
			throw new Error('Update ocurred but it was impossible to refetch the user from the database.');
		}
	} catch (err) {
		throw new Error(`Error updating user with ID ${user_id}: ${err}`);
	}
};

// DELETE a user
export const deleteUser = async (id: string): Promise<boolean> => {
	const sql = 'DELETE FROM users WHERE user_id = ?';

	try {
		const [result] = await connection.promise().query<ResultSetHeader>(sql, [id]);

		// returning boolean according to delete
		return result.affectedRows > 0;
	} catch (err) {
		throw new Error(`Error deleting user with ID ${id}: ${err}`);
	}
};
