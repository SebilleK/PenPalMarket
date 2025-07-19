export interface User {
	created_at: string;
	user_id: string;
	first_name: string;
	last_name: string;
	role: string;
	phone_number?: string;
	email: string;
	password: string;
}

export interface Address {
	address_line1: string;
	address_line2: string;
	city: string;
	state: string;
	country: string;
	postal_code: string;
}
