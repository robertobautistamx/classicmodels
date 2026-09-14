import React, { useEffect, useState } from 'react';
import type { Customer } from '../types';
import { getCustomers } from '../api/customers';
import { DataTable } from '../components/common/DataTable';
import type { Column } from '../components/common/DataTable';

export const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    getCustomers().then(setCustomers);
  }, []);

  const columns: Column<Customer>[] = [
    { header: 'ID', accessorKey: 'customerNumber' },
    { header: 'Nombre del Cliente', accessorKey: 'customerName' },
    {
      header: 'Contacto Principal',
      cell: (item) => `${item.contactFirstName} ${item.contactLastName}`,
    },
    { header: 'Teléfono', accessorKey: 'phone' },
    { header: 'Ciudad', accessorKey: 'city' },
    { header: 'País', accessorKey: 'country' },
    {
      header: 'Límite de Crédito',
      cell: (item) => (
        <span style={{ fontWeight: 600, color: item.creditLimit && item.creditLimit > 100000 ? '#10b981' : 'var(--text-primary)' }}>
          ${Number(item.creditLimit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Ejecutivo Ventas',
      cell: (item) => item.salesRepEmployeeNumber ? `#${item.salesRepEmployeeNumber}` : <span style={{ color: 'var(--text-muted)' }}>Sin asignar</span>,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Directorio de Clientes (`customers`)</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Registro de empresas, compradores internacionales y ejecutivos asignados.
        </p>
      </div>

      <DataTable data={customers} columns={columns} searchPlaceholder="Buscar por cliente, contacto o país..." pageSize={8} />
    </div>
  );
};
