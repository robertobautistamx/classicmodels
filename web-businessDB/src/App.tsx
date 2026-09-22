import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import type { ViewType } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewView } from './views/OverviewView';
import { OrdersView } from './views/OrdersView';
import { CustomersView } from './views/CustomersView';
import { ProductsView } from './views/ProductsView';
import { PaymentsView } from './views/PaymentsView';
import { EmployeesView } from './views/EmployeesView';
import { OfficesView } from './views/OfficesView';
import { ForecastsView } from './views/ForecastsView';
import { AiChatDrawer } from './components/ai/AiChatDrawer';
import { AiFabButton } from './components/ai/AiFabButton';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const viewTitles: Record<ViewType, string> = {
    overview: 'Panel de Control - Nova Store',
    forecasts: 'Pronósticos y Análisis Predictivo de Negocio',
    orders: 'Administración de Pedidos (Orders)',
    customers: 'Directorio de Clientes (Customers)',
    products: 'Catálogo e Inventario de Productos',
    payments: 'Finanzas y Transacciones de Pago',
    employees: 'Personal y Estructura Organizacional',
    offices: 'Sedes Corporativas e Internacionales',
  };

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewView />;
      case 'forecasts':
        return <ForecastsView />;
      case 'orders':
        return <OrdersView />;
      case 'customers':
        return <CustomersView />;
      case 'products':
        return <ProductsView />;
      case 'payments':
        return <PaymentsView />;
      case 'employees':
        return <EmployeesView />;
      case 'offices':
        return <OfficesView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      <div className="main-wrapper">
        <Header
          title={viewTitles[currentView]}
          onOpenAi={() => setIsAiOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <main className="page-body">{renderView()}</main>
      </div>

      {/* Character Assistant Widget (Nova Bot 🤖) */}
      <AiFabButton onClick={() => setIsAiOpen(true)} isOpen={isAiOpen} />
      <AiChatDrawer isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
};

export default App;
