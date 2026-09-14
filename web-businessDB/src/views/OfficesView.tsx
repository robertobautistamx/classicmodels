import React, { useEffect, useState } from 'react';
import type { Office } from '../types';
import { getOffices } from '../api/employees';
import { DataTable } from '../components/common/DataTable';
import type { Column } from '../components/common/DataTable';
import { MapPin, Phone } from 'lucide-react';

export const OfficesView: React.FC = () => {
  const [offices, setOffices] = useState<Office[]>([]);

  useEffect(() => {
    getOffices().then(setOffices);
  }, []);

  const columns: Column<Office>[] = [
    { header: 'Código Sede', accessorKey: 'officeCode' },
    {
      header: 'Ciudad',
      cell: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <MapPin size={14} style={{ color: '#818cf8' }} />
          <span>{item.city}</span>
        </div>
      ),
    },
    { header: 'País', accessorKey: 'country' },
    {
      header: 'Teléfono',
      cell: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <Phone size={14} />
          <span>{item.phone}</span>
        </div>
      ),
    },
    { header: 'Dirección Linea 1', accessorKey: 'addressLine1' },
    { header: 'Código Postal', accessorKey: 'postalCode' },
    { header: 'Territorio', accessorKey: 'territory' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Sedes y Oficinas Globales (`offices`)</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Ubicaciones corporativas internacionales, territorio comercial y contactos.
        </p>
      </div>

      <DataTable data={offices} columns={columns} searchPlaceholder="Buscar por ciudad, país o territorio..." pageSize={8} />
    </div>
  );
};
