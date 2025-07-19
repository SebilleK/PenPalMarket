export interface Cart {
	created_at: number;
	cart_id: number;
	user_id: string;
	status: string;
}

export interface Order {
	created_at: number;
	order_id: number;
	user_id: string;
	total_amount: number;
	shipping_address_id: number;
	billing_address_id: number;
	order_status: string;
	payment_status: string;
	paid_at?: Date;
	payment_method?: string;
}
