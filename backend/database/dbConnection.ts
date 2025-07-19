import prodConnection from './prodConnection';
import testConnection from './testConnection';

const connection = process.env.NODE_ENV === 'test' ? testConnection : prodConnection;

// remove later
const message = process.env.NODE_ENV === 'test' ? console.log('We are using the test connection pool') : console.log('We are using the main penpal database');

message;

export default connection;
