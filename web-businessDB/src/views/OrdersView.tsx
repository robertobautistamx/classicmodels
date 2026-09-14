import React, { useEffect, useState } from 'react';
import type { Order } from '../types';
import { getOrders } from '../api/orders';
import { DataTable } from '../components/common/DataTable';
import type { Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { Eye, X } from 'lucide-react';

export const OrdersView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    getOrders().then(setOrders);
  }, []);

  const columns: Column<Order>[] = [
    { header: 'Nº Pedido', accessorKey: 'orderNumber' },
    { header: 'Fecha Pedido', accessorKey: 'orderDate' },
    { header: 'Fecha Requerida', accessorKey: 'requiredDate' },
    {
      header: 'Fecha Envío',
      cell: (item) => item.shippedDate || <span style={{ color: 'var(--text-muted)' }}>Pendiente</span>,
    },
    { header: 'Cliente ID', accessorKey: 'customerNumber' },
    {
      header: 'Estado',
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Acciones',
      cell: (item) => (
        <button
          onClick={() => setSelectedOrder(item)}
          style={{
            padding: '4px 8px',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
          }}
        >
          <Eye size={14} /> Inspeccionar
        </button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Gestión de Pedidos (`orders` & `orderdetails`)</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Listado de órdenes procesadas y estado del despacho en la base de datos classicmodels.
        </p>
      </div>

      <DataTable data={orders} columns={columns} searchPlaceholder="Buscar por ID, fecha o estado..." pageSize={8} />

      {/* Modal Inspector */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ fontWeight: 600, fontSize: '1rem' }}>Detalle de Pedido #{selectedOrder.orderNumber}</div>
              <button className="btn-close" onClick={() => setSelectedOrder(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', fontSize: '0.9rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Fecha del Pedido</div>
                  <div>{selectedOrder.orderDate}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Fecha Requerida</div>
                  <div>{selectedOrder.requiredDate}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Estado Actual</div>
                  <div style={{ marginTop: '4px' }}>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Cliente ID</div>
                  <div>#{selectedOrder.customerNumber}</div>
                </div>
              </div>

              {selectedOrder.comments && (
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Comentarios</div>
                  <div>{selectedOrder.comments}</div>
                </div>
              )}

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                * Los ítems desglosados de la tabla `orderdetails` están asociados a este pedido.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
