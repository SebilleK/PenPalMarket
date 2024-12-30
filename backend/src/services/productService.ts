import { Product } from '../types/Product';
import mockProducts from '../../database/mockProducts.json';

export const getAllProducts = async (): Promise<Product[]> => {
	return mockProducts;
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
	return mockProducts.find(product => product.id === id);
};
