import server from './app'; 

const start = async () => {
	try {
		await server.listen({ port: 3000, host: '127.0.0.1' });
		console.log('Server listening at http://127.0.0.1:3000');
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

// if environment is not test, start
if (process.env.NODE_ENV !== 'test') {
	start();
}
