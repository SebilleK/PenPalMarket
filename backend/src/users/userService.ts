import { User, Address } from './UserTypes';
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

//? USER ADDRESSES
//! fix types later, return a set type not any
// GET address
export const getAddressesByUserId = async (id: string): Promise<any> => {
	const sql = 'SELECT * FROM user_addresses WHERE user_id =?';

	if (!id) {
		throw new BadRequestError('Please provide an user ID.');
	}

	try {
		const [rows] = await connection.promise().query(sql, [id]);
		if (Array.isArray(rows) && rows.length > 0) {
			const addresses = rows;

			return addresses;
		} else {
			return null;
		}
	} catch (err) {
		throw new Error(`Error fetching addresses of User ID ${id}: ${err}`);
	}
};

//! TBA
// POST address
export const addAddressByUserId = async (id: string, address: Address): Promise<Address> => {
	if (id == undefined) {
		throw new BadRequestError('Please provide the ID of the user to add an address.');
	}

	const user_id = id;

	const { address_line1, address_line2, city, state, country, postal_code } = address;

	if (!address_line1 || !address_line2 || !city || !state || !country || !postal_code) {
		throw new BadRequestError('All required fields must be provided.');
	}

	const sql = `
        INSERT INTO user_addresses 
        (user_id, address_line1, address_line2, city, state, country, postal_code) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

	try {
		const [result] = await connection.promise().query<ResultSetHeader>(sql, [user_id, address_line1, address_line2, city, state, country, postal_code]);

		const newAddress: any = {
			...address,
		};

		return newAddress;
	} catch (error) {
		throw new Error(`Error while trying to register new user: ${error}`);
	}
};

// UPDATE (put) address //! provide address id
export const updateAddressByAddressId = async (id: string, address: Address): Promise<any> => {
	if (id == undefined) {
		throw new BadRequestError('Please provide the ID of the user to update an address.');
	}

	const user_address_id = id;

	const { address_line1, address_line2, city, state, country, postal_code } = address;

	//? fields and values for SQL
	const fields: string[] = [];
	const values: string[] = [];

	//! ___________
	if (!address_line1 && !address_line2 && !city && !state && !country && !postal_code) {
		throw new BadRequestError('At least a field to update needs to be provided.');
	}

	//? dynamically preparing SQL statement

	if (address_line1 !== undefined) {
		fields.push('address_line1 = ?');
		values.push(address_line1);
	}

	if (address_line2 !== undefined) {
		fields.push('address_line2 = ?');
		values.push(address_line2);
	}

	if (city !== undefined) {
		fields.push('city = ?');
		values.push(city);
	}

	if (state !== undefined) {
		fields.push('state  = ?');
		values.push(state);
	}

	if (country !== undefined) {
		fields.push('country = ?');
		values.push(country);
	}

	if (postal_code !== undefined) {
		fields.push('postal_code = ?');
		values.push(postal_code);
	}

	//!_______________

	values.push(user_address_id);

	//? dinamically building SQL according to provided fields. Allows partial updates and avoids errors/ wiping info
	const sql = `UPDATE user_addresses SET ${fields.join(', ')} WHERE user_address_id = ?`;

	try {
		const [rows] = await connection.promise().query<ResultSetHeader>(sql, values);

		if (rows.affectedRows === 0) {
			throw new NotFoundError('No address found to update!');
		}

		// return the full new updated user address
		const refetchSql = 'SELECT * FROM user_addresses WHERE user_address_id =?';

		const [refetch] = await connection.promise().query(refetchSql, [user_address_id]);

		if (Array.isArray(refetch) && refetch.length > 0) {
			const updatedAddress = refetch[0] as any;

			return updatedAddress;
		} else {
			throw new Error('Update ocurred but it was impossible to refetch the user address from the database.');
		}
	} catch (err) {
		throw new Error(`Error updating address with ID ${user_address_id}: ${err}`);
	}
};

// DELETE address //! provide address id
export const deleteAddressByAddressId = async (id: string): Promise<boolean> => {
	const sql = 'DELETE FROM user_addresses WHERE user_address_id = ?';

	try {
		const [result] = await connection.promise().query<ResultSetHeader>(sql, [id]);

		// returning boolean according to delete
		return result.affectedRows > 0;
	} catch (err) {
		throw new Error(`Error deleting address with ID ${id}: ${err}`);
	}
};
