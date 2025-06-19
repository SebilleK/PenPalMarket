export class BadRequestError extends Error {
	statusCode: number;

	constructor(message: string) {
		super(message);
		this.name = 'BadRequestError';
		this.statusCode = 400;

		Object.setPrototypeOf(this, BadRequestError.prototype);
	}
}

export class ForbiddenError extends Error {
	statusCode: number;

	constructor(message: string) {
		super(message);
		this.name = 'ForbiddenError';
		this.statusCode = 403;

		Object.setPrototypeOf(this, ForbiddenError.prototype);
	}
}
