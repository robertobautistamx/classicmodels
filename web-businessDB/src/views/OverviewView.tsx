import React, { useEffect, useState } from 'react';
import { KpiCard } from '../components/common/KpiCard';
import { DataTable } from '../components/common/DataTable';
import type { Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import type { Order, Payment, Product, Customer } from '../types';
import { getOrders } from '../api/orders';
import { getPayments } from '../api/payments';
import { getProducts } from '../api/products';
import { getCustomers } from '../api/customers';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export const OverviewView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    getOrders().then(setOrders);
    getPayments().then(setPayments);
    getProducts().then(setProducts);
    getCustomers().then(setCustomers);
  }, []);

  const totalRevenue = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const lowStockCount = products.filter((p) => p.quantityInStock < 500).length;

  const revenueTrendData = payments.slice(0, 10).map((p, i) => ({
    date: p.paymentDate || `T${i + 1}`,
    amount: Number(p.amount),
  }));

  const orderStatusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    orderStatusCounts[o.status] = (orderStatusCounts[o.status] || 0) + 1;
  });

  const pieData = Object.entries(orderStatusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6'];

  const orderColumns: Column<Order>[] = [
    { header: 'Número de Pedido', accessorKey: 'orderNumber' },
    { header: 'Fecha', accessorKey: 'orderDate' },
    { header: 'Cliente ID', accessorKey: 'customerNumber' },
    {
      header: 'Estado',
      cell: (item) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div>
      <div className="grid-kpis">
        <KpiCard
          title="Ingresos Totales (Pagos)"
          value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Basado en tabla de pagos"
          icon={<DollarSign size={20} />}
        />
        <KpiCard
          title="Pedidos Totales"
          value={orders.length}
          subtitle="Registrados en la BD"
          icon={<ShoppingCart size={20} />}
        />
        <KpiCard
          title="Clientes Activos"
          value={customers.length}
          subtitle="Empresas y compradores"
          icon={<Users size={20} />}
        />
        <KpiCard
          title="Catálogo de Productos"
          value={products.length}
          subtitle={lowStockCount > 0 ? `${lowStockCount} productos con stock bajo` : 'Stock normal'}
          icon={<Package size={20} />}
        />
      </div>

      <div className="grid-charts">
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: '16px', fontSize: '0.95rem' }}>Tendencia de Ingresos por Pagos</div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: '16px', fontSize: '0.95rem' }}>Distribución de Estados de Pedidos</div>
          <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Últimos Pedidos Registrados</div>
        <DataTable data={orders} columns={orderColumns} pageSize={5} searchPlaceholder="Buscar pedidos..." />
      </div>
    </div>
  );
};
