import argon2 from 'argon2';

// add type to password later??
export const hashPassword = async (password: any) => {
	try {
		const hash = await argon2.hash(password);
		return hash;
	} catch (err) {
		return 'There was an error hashing the password';
	}
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
	try {
		return await argon2.verify(hashedPassword, password);
	} catch (err) {
		console.error('The password could not be verified:', err);
		return false;
	}
};
