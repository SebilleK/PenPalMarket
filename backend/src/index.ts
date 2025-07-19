import server from './app';
import dotenv from 'dotenv';

// loading env variables
dotenv.config();

const start = async () => {
	try {
		// @ts-ignore
		server.listen({ port: process.env.DB_PORT, host: process.env.DB_HOST });
		console.log(`Server listening at http://${process.env.DB_HOST}:${process.env.DB_PORT}`);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

// if environment is not test, start
if (process.env.NODE_ENV !== 'test') {
	start();
}
