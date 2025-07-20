export interface Cart {
	created_at: number;
	cart_id: number;
	user_id: string;
	status: string;
}

export interface shoppingCartItems {
	created_at: number;
	cart_items_id: string;
	shopping_cart_id: string;
	status: string;
}

export interface Order {
	created_at: number;
	order_id: number;
	user_id: string;
	total_amount: number;
	shipping_address_id: string;
	billing_address_id: string;
	order_status: string;
	payment_status: string;
	paid_at?: Date;
	payment_method?: string;
}

export interface orderItems {
	created_at: number;
	order_items_id: string;
	order_id: string;
	user_id: string;
	product_id: string;
	quantity: number;
	price: number;
}
