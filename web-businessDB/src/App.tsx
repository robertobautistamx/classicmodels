import React, { useState } from 'react';
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
import { AiFabButton } from './components/ai/AiFabButton';
import { AiChatDrawer } from './components/ai/AiChatDrawer';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [isAiOpen, setIsAiOpen] = useState(false);

  const viewTitles: Record<ViewType, string> = {
    overview: 'Panel de Control - Resumen General',
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
      <Sidebar currentView={currentView} onSelectView={setCurrentView} />

      <div className="main-wrapper">
        <Header title={viewTitles[currentView]} onOpenAi={() => setIsAiOpen(true)} />
        <main className="page-body">{renderView()}</main>
      </div>

      <AiFabButton onClick={() => setIsAiOpen(true)} isOpen={isAiOpen} />
      <AiChatDrawer isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
};

export default App;
