import type { Employee, Office } from '../types';
import { fetchApi } from './client';
import { mockEmployees, mockOffices } from './mockData';

export async function getEmployees(): Promise<Employee[]> {
  try {
    return await fetchApi<Employee[]>('/employees');
  } catch {
    return mockEmployees;
  }
}

export async function getOffices(): Promise<Office[]> {
  try {
    return await fetchApi<Office[]>('/offices');
  } catch {
    return mockOffices;
  }
}
