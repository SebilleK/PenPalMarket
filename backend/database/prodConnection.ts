import mysql from 'mysql2';
import dotenv from 'dotenv';

// loading env variables
dotenv.config();

const prodConnection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
});

prodConnection.connect(err => {
	if (err) {
		console.error('Error Connecting to Database: ' + err.stack);
		return;
	}
	console.log('Connected to the MySQL penpal database successfully.');
});

export default prodConnection;
