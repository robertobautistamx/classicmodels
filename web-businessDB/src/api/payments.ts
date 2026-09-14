import type { Payment } from '../types';
import { fetchApi } from './client';
import { mockPayments } from './mockData';

export async function getPayments(): Promise<Payment[]> {
  try {
    return await fetchApi<Payment[]>('/payments');
  } catch {
    return mockPayments;
  }
}
