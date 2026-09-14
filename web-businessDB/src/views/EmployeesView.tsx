import React, { useEffect, useState } from 'react';
import type { Employee } from '../types';
import { getEmployees } from '../api/employees';
import { DataTable } from '../components/common/DataTable';
import type { Column } from '../components/common/DataTable';
import { Mail } from 'lucide-react';

export const EmployeesView: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    getEmployees().then(setEmployees);
  }, []);

  const columns: Column<Employee>[] = [
    { header: 'Nº Empleado', accessorKey: 'employeeNumber' },
    {
      header: 'Nombre Completo',
      cell: (item) => <span style={{ fontWeight: 600 }}>{`${item.firstName} ${item.lastName}`}</span>,
    },
    { header: 'Puesto / Cargo', accessorKey: 'jobTitle' },
    {
      header: 'Correo Electrónico',
      cell: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <Mail size={14} />
          <span>{item.email}</span>
        </div>
      ),
    },
    { header: 'Extensión', accessorKey: 'extension' },
    { header: 'Código Oficina', accessorKey: 'officeCode' },
    {
      header: 'Reporta A',
      cell: (item) => item.reportsTo ? `#${item.reportsTo}` : <span style={{ color: 'var(--text-muted)' }}>Directiva</span>,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Directorio de Empleados (`employees`)</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Estructura organizacional, vendedores y jerarquía de reportes.
        </p>
      </div>

      <DataTable data={employees} columns={columns} searchPlaceholder="Buscar por nombre, correo o cargo..." pageSize={8} />
    </div>
  );
};
