import type { Customer } from '../types';
import { fetchApi } from './client';
import { mockCustomers } from './mockData';

export async function getCustomers(): Promise<Customer[]> {
  try {
    return await fetchApi<Customer[]>('/customers');
  } catch {
    return mockCustomers;
  }
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  try {
    return await fetchApi<Customer>(`/customers/${id}`);
  } catch {
    return mockCustomers.find((c) => c.customerNumber === id) || null;
  }
}
