import React, { useEffect, useState } from 'react';
import type { Payment } from '../types';
import { getPayments } from '../api/payments';
import { DataTable } from '../components/common/DataTable';
import type { Column } from '../components/common/DataTable';
import { DollarSign } from 'lucide-react';

export const PaymentsView: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    getPayments().then(setPayments);
  }, []);

  const totalAmount = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);

  const columns: Column<Payment>[] = [
    { header: 'Cliente ID', accessorKey: 'customerNumber' },
    { header: 'Nº Cheque / Transacción', accessorKey: 'checkNumber' },
    { header: 'Fecha de Pago', accessorKey: 'paymentDate' },
    {
      header: 'Monto Recibido',
      cell: (item) => (
        <span style={{ fontWeight: 600, color: '#10b981' }}>
          ${Number(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
        </span>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Registro de Pagos y Transacciones (`payments`)</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Historial de cheques recibidos y depósitos por ventas.
          </p>
        </div>

        <div style={{ padding: '8px 16px', backgroundColor: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-focus)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={18} style={{ color: '#818cf8' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Registrado:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
            ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <DataTable data={payments} columns={columns} searchPlaceholder="Buscar por ID cliente o número de cheque..." pageSize={8} />
    </div>
  );
};
