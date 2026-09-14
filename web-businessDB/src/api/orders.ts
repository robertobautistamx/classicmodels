import type { Order, OrderDetail } from '../types';
import { fetchApi } from './client';
import { mockOrders } from './mockData';

export async function getOrders(): Promise<Order[]> {
  try {
    return await fetchApi<Order[]>('/orders');
  } catch {
    return mockOrders;
  }
}

export async function getOrderById(id: number): Promise<Order | null> {
  try {
    return await fetchApi<Order>(`/orders/${id}`);
  } catch {
    return mockOrders.find((o) => o.orderNumber === id) || null;
  }
}

export async function getOrderDetails(): Promise<OrderDetail[]> {
  try {
    return await fetchApi<OrderDetail[]>('/order-details');
  } catch {
    return [];
  }
}
