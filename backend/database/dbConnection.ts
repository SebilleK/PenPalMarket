import prodConnection from './prodConnection';
import testConnection from './testConnection';

const connection = process.env.NODE_ENV === 'test' ? testConnection : prodConnection;

export default connection;
