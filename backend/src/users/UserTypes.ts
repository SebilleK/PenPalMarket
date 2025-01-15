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
