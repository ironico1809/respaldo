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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
