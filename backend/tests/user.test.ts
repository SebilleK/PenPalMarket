// fastify server instance
import server from '../src/app';
// node testing
import assert from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
// mock data
import mockUser from '../database/json_mocks/mockUser.json';
import mockBadUser from '../database/json_mocks/mockBadUser.json';
import mockUserUpdate from '../database/json_mocks/mockUserUpdate.json';
import mockAddress from '../database/json_mocks/mockAddress.json';
import mockUpdateAddress from '../database/json_mocks/mockUpdateAddress.json';

//! setup for isolation, rollback
import { startTransaction, rollbackTransaction, seedTestUser } from './testHelpers';

beforeEach(async () => {
	await startTransaction();
	await seedTestUser();
});

afterEach(async () => {
	await rollbackTransaction();
});

describe('Users Routes', () => {
	//? REGISTER USER
	it('user can register and info has to be unique', async () => {
		const response = await server.inject({ method: 'POST', path: '/users', body: mockUser });

		assert.deepStrictEqual(response.statusCode, 201);

		const responseSecondAttempt = await server.inject({ method: 'POST', path: '/users', body: mockUser });

		assert.deepStrictEqual(responseSecondAttempt.statusCode, 400);
	});

	it('bad register attempt gives out 400', async () => {
		const response = await server.inject({ method: 'POST', path: '/users', body: mockBadUser });

		assert.deepStrictEqual(response.statusCode, 400);
	});

	//? LOGIN USER // from here
	it('user can login', async () => {
		const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });

		assert.deepStrictEqual(response.statusCode, 200);
	});

	it('user cant login with wrong password', async () => {
		// BAD USER CREDENTIALS
		const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1########' } });

		// unauthorized
		assert.deepStrictEqual(response.statusCode, 401);
	});

	it('user has to provide all fields for login', async () => {
		const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com' } });

		// bad request
		assert.deepStrictEqual(response.statusCode, 400);
	});

	// ON THESE ROUTES, LEVEL 1 OR 2 AUTH IS USED - USERS
	describe('protected routes and JWT', () => {
		//? GET USER DETAILS
		it('user can access own details', async () => {
			const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(response.body);
			const setJWT = parsedJSON.accessToken;

			//! default mock user id
			const id = 1;
			const responseGET = await server.inject({ method: 'GET', path: `/users/${id}`, headers: { cookie: `access_token=${setJWT}` } });

			assert.deepStrictEqual(responseGET.statusCode, 200);

			const responseLogout = await server.inject({ method: 'POST', path: '/logout' });
			assert.deepStrictEqual(responseLogout.statusCode, 200);
		});

		//? PUT USER DETAILS
		it('user can edit own details', async () => {
			const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(response.body);
			const setJWT = parsedJSON.accessToken;

			const id = 1;
			const responsePUT = await server.inject({ method: 'PUT', path: `/users/${id}`, body: mockUserUpdate, headers: { cookie: `access_token=${setJWT.toString()}` } });

			assert.deepStrictEqual(responsePUT.statusCode, 200);

			const responseLogout = await server.inject({ method: 'POST', path: '/logout' });
			assert.deepStrictEqual(responseLogout.statusCode, 200);
		});

		it('user cant update other users', async () => {
			const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(response.body);
			const setJWT = parsedJSON.accessToken;

			const id = 2;
			const responsePUT = await server.inject({ method: 'PUT', path: `/users/${id}`, body: mockUserUpdate, headers: { cookie: `access_token=${setJWT}` } });

			assert.deepStrictEqual(responsePUT.statusCode, 403);

			const responseLogout = await server.inject({ method: 'POST', path: '/logout' });
			assert.deepStrictEqual(responseLogout.statusCode, 200);
		});

		//? DELETE USER
		it('user cant delete others', async () => {
			const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(response.body);
			const setJWT = parsedJSON.accessToken;

			const id = 2;
			const responseDELETE = await server.inject({ method: 'DELETE', path: `/users/${id}`, headers: { cookie: `access_token=${setJWT}` } });

			assert.deepStrictEqual(responseDELETE.statusCode, 403);

			const responseLogout = await server.inject({ method: 'POST', path: '/logout' });
			assert.deepStrictEqual(responseLogout.statusCode, 200);
		});

		it('user can delete itself', async () => {
			const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(response.body);
			const setJWT = parsedJSON.accessToken;

			const id = 1;
			const responseDELETE = await server.inject({ method: 'DELETE', path: `/users/${id}`, headers: { cookie: `access_token=${setJWT}` } });

			assert.deepStrictEqual(responseDELETE.statusCode, 204);

			const responseLogout = await server.inject({ method: 'POST', path: '/logout' });
			assert.deepStrictEqual(responseLogout.statusCode, 200);
		});

		//? C_UD ADDRESSES
		it('user can correctly create/set an address and update it or delete it', async () => {
			const response = await server.inject({ method: 'POST', path: '/login', body: { email: 'test@user.com', password: 'TestPassword1#' } });
			// AUTH COOKIE / JWT
			const parsedJSON = JSON.parse(response.body);
			const setJWT = parsedJSON.accessToken;

			assert.deepStrictEqual(response.statusCode, 200);
			// console.log('login success');
			// console.log(response);

			const id = 1;
			const responsePOST = await server.inject({ method: 'POST', path: `/users/addresses/${id}`, body: mockAddress, headers: { cookie: `access_token=${setJWT}` } });

			assert.deepStrictEqual(responsePOST.statusCode, 201);
			// console.log(responsePOST);
			console.log('address set with success');

			//? address id from post above
			const parsedAddressJSON = JSON.parse(responsePOST.body);
			const user_address_id = parsedAddressJSON.newAddress.user_address_id;
			//console.log('HERE -----------------');
			//console.log(parsedAddressJSON);
			//! should provide address id for update and delete requests

			const responsePUT = await server.inject({
				method: 'PUT',
				path: `/users/${id}/addresses/${user_address_id}`,
				body: mockUpdateAddress,
				headers: { cookie: `access_token=${setJWT.toString()}` },
			});

			assert.deepStrictEqual(responsePUT.statusCode, 200);
			console.log('address updated with success');

			const responseDELETE = await server.inject({ method: 'DELETE', path: `users/${id}/addresses/${user_address_id}`, headers: { cookie: `access_token=${setJWT.toString()}` } });

			assert.deepStrictEqual(responseDELETE.statusCode, 204);
			console.log('address deleted with success');
		});
	});
});
