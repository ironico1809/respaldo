// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.tsx';
import Dashboard from './pages/Dashboard.tsx';
import GestionarClientes from './pages/GestionarClientes.tsx';
import MainLayout from './pages/MainLayout.tsx';
import GestionarRolesPermisos from './pages/GestionarRolesPermisos.tsx';
import AsignarRoles from './pages/AsignarRoles.tsx';
import GestionarBitacora from './pages/GestionarBitacora.tsx';
import GestionarUsuarios from './pages/GestionarUsuarios.tsx';
import GestionarInventario from './pages/GestionarInventario.tsx';
import GestionarVentas from './pages/GestionarVentas.tsx';
import GestionarNotificaciones from './pages/GestionarNotificaciones.tsx';
import GestionarReportes from './pages/GestionarReportes.tsx';
import AsignarPermisos from './pages/AsignarPermisos.tsx';
import Catalogo from './pages/Catalogo.tsx';
import Carrito from './pages/Carrito.tsx';
import Pagos from './pages/Pagos.tsx';
import PagoExitoso from './pages/PagoExitoso.tsx';
import DashboardPredicciones from './pages/DashboardPredicciones.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gestionar-clientes" element={<GestionarClientes />} />
          <Route path="/gestionar-roles-permisos" element={<GestionarRolesPermisos />} />
          <Route path="/asignar-roles" element={<AsignarRoles />} />
          <Route path="/gestionar-bitacora" element={<GestionarBitacora />} />
          <Route path="/gestionar-usuarios" element={<GestionarUsuarios />} />
          <Route path="/gestionar-inventario" element={<GestionarInventario />} />
          <Route path="/gestionar-ventas" element={<GestionarVentas />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/pagos" element={<Pagos />} />
          <Route path="/pago-exitoso" element={<PagoExitoso />} />
          <Route path="/predicciones" element={<DashboardPredicciones />} />
          <Route path="/notificaciones" element={<GestionarNotificaciones />} />
          <Route path="/reportes" element={<GestionarReportes />} />
          <Route path="/asignar-permisos" element={<AsignarPermisos />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
