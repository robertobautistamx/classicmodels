import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  Building2,
  Briefcase,
  TrendingUp,
  Store,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type ViewType =
  | 'overview'
  | 'forecasts'
  | 'customers'
  | 'orders'
  | 'products'
  | 'employees'
  | 'payments'
  | 'offices';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
}) => {
  const menuItems: { id: ViewType; label: string; icon: React.ReactNode; isNew?: boolean }[] = [
    { id: 'overview', label: 'Resumen General', icon: <LayoutDashboard size={18} /> },
    { id: 'forecasts', label: 'Pronósticos de Negocio', icon: <TrendingUp size={18} />, isNew: true },
    { id: 'orders', label: 'Pedidos (Orders)', icon: <ShoppingCart size={18} /> },
    { id: 'customers', label: 'Clientes (Customers)', icon: <Users size={18} /> },
    { id: 'products', label: 'Productos e Inventario', icon: <Package size={18} /> },
    { id: 'payments', label: 'Pagos y Finanzas', icon: <CreditCard size={18} /> },
    { id: 'employees', label: 'Empleados (Employees)', icon: <Briefcase size={18} /> },
    { id: 'offices', label: 'Oficinas Globales', icon: <Building2 size={18} /> },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
              <div className="sidebar-brand-icon">
                <Store size={22} style={{ color: '#818cf8' }} />
              </div>
              <div>
                <div className="sidebar-brand">Nova Store</div>
                <div className="sidebar-subtitle">Enterprise Analytics</div>
              </div>
            </div>

            <button
              className="sidebar-toggle-btn"
              onClick={onToggleCollapse}
              title="Cerrar Menú (<)"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
            <button
              className="sidebar-toggle-btn"
              onClick={onToggleCollapse}
              title="Abrir Menú (>)"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onSelectView(item.id)}
            title={isCollapsed ? item.label : undefined}
          >
            {item.icon}
            {!isCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
            {!isCollapsed && item.isNew && (
              <span className="sidebar-new-pill">IA & ALGO</span>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};
