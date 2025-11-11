import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar'; // Asegúrate de que la ruta sea correcta
import './MainLayout.css';

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/dashboard':
      return 'Dashboard - Gestión Comercial';
    case '/gestionar-clientes':
      return 'Gestión de Clientes';
    case '/gestionar-roles-permisos':
      return 'Gestión de Roles y Permisos';
    case '/asignar-roles':
      return 'Asignación de Roles a Usuarios';
    case '/gestionar-bitacora':
      return 'Bitácora de Actividad';
    case '/gestionar-usuarios':
      return 'Gestión de Usuarios';
    case '/inventario':
      return 'Inventario de Productos';
    case '/gestionar-productos':
      return 'Gestión de Productos';
    default:
      return 'SmartSale365';
  }
};

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`main-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      <Sidebar />
      <main className="main-content">
        <TopBar onMenuClick={toggleSidebar} title={pageTitle} />
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;