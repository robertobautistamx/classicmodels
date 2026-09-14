import type { Product, ProductLine } from '../types';
import { fetchApi } from './client';
import { mockProducts, mockProductLines } from './mockData';

export async function getProducts(): Promise<Product[]> {
  try {
    return await fetchApi<Product[]>('/products');
  } catch {
    return mockProducts;
  }
}

export async function getProductLines(): Promise<ProductLine[]> {
  try {
    return await fetchApi<ProductLine[]>('/product-lines');
  } catch {
    return mockProductLines;
  }
}
