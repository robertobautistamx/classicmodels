import type { Office } from '../types';
import { fetchApi } from './client';
import { mockOffices } from './mockData';

export async function getOffices(): Promise<Office[]> {
  try {
    return await fetchApi<Office[]>('/offices');
  } catch {
    return mockOffices;
  }
}
