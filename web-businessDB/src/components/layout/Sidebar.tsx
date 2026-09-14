import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  Building2,
  Briefcase,
  Layers,
} from 'lucide-react';

export type ViewType =
  | 'overview'
  | 'customers'
  | 'orders'
  | 'products'
  | 'employees'
  | 'payments'
  | 'offices';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView }) => {
  const menuItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Resumen General', icon: <LayoutDashboard size={18} /> },
    { id: 'orders', label: 'Pedidos (Orders)', icon: <ShoppingCart size={18} /> },
    { id: 'customers', label: 'Clientes (Customers)', icon: <Users size={18} /> },
    { id: 'products', label: 'Productos e Inventario', icon: <Package size={18} /> },
    { id: 'payments', label: 'Pagos y Finanzas', icon: <CreditCard size={18} /> },
    { id: 'employees', label: 'Empleados (Employees)', icon: <Briefcase size={18} /> },
    { id: 'offices', label: 'Oficinas Globales', icon: <Building2 size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Layers size={24} className="text-indigo-400" style={{ color: '#6366f1' }} />
        <div>
          <div className="sidebar-brand">API-BUSINESS</div>
          <div className="sidebar-subtitle">ClassicModels DB</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onSelectView(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="status-indicator">
          <div className="status-dot"></div>
          <span>Backend Conectado</span>
        </div>
        <span style={{ fontSize: '0.7rem' }}>v1.0.0</span>
      </div>
    </aside>
  );
};
