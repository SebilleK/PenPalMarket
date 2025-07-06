export const productRouteSchema = {
	type: 'object',
	properties: {
		name: { type: 'string' },
		price: { type: 'number' },
		description: { type: 'string' },
		category: { type: 'string' },
		stock: { type: 'number' },
		imagePath: { type: 'string' },
	},
};
