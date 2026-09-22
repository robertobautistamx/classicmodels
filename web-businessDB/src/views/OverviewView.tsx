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
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

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
    const statusKey = o.status || 'Desconocido';
    orderStatusCounts[statusKey] = (orderStatusCounts[statusKey] || 0) + 1;
  });

  const pieData = Object.entries(orderStatusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6', '#ec4899'];

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
        {/* REVENUE TREND AREA CHART */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Tendencia Histórica de Ingresos</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Muestra de pagos</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString('en-US')}`, 'Monto Pago']}
                />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DONUT CHART (SLEEK, NO SLICE OVERLAP, CUSTOM LEGEND) */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Distribución de Estados de Pedidos</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{orders.length} pedidos</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minHeight: '260px' }}>
            <div style={{ width: '55%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    label={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--bg-card)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                    }}
                    formatter={(value: any, name: any) => [`${value} pedidos`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* CUSTOM CLEAN LEGEND */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
              {pieData.map((item, index) => {
                const percent = Math.round((item.value / (orders.length || 1)) * 100);
                return (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{item.name}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.value} ({percent}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
          Últimos Pedidos Registrados
        </div>
        <DataTable data={orders} columns={orderColumns} pageSize={5} searchPlaceholder="Buscar pedidos..." />
      </div>
    </div>
  );
};
