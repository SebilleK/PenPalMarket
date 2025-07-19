import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = mysql.createPool({
	host: process.env.TEST_DB_HOST,
	user: process.env.TEST_DB_USER,
	password: process.env.TEST_DB_PASSWORD,
	database: process.env.TEST_DB_NAME,
});

console.log('mySQL test connection pool created.');

export default testConnection;
