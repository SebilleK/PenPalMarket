export const userRouteSchema = {
	type: 'object',
	properties: {
		first_name: { type: 'string' },
		last_name: { type: 'string' },
		description: { type: 'string' },
		phone_number: { type: 'string' },
		password: { type: 'string' },
		email: { type: 'string' },
	},
};
export const userLoginSchema = {
	type: 'object',
	properties: {
		email: { type: 'string' },
		password: { type: 'string' },
	},
};
