export interface Product {
	id?: string; // optional because it's autogenerated
	name: string;
	description: string;
	price: number;
	category: number;
	stock: number;
	imagePath?: string;
}
