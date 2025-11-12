import React, { useState } from 'react';
import './Sidebar.css';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';
import { usePermisos } from '../context/PermisosContext';

const Sidebar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>('dashboard');
  const { tienePermiso, permisos, loading } = usePermisos();
  
  console.log('🎨 Sidebar - Permisos cargados:', permisos);
  console.log('🎨 Sidebar - Loading:', loading);
  
  const handleMenuClick = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon" style={{ background: 'none' }}>
            <img src={logo} alt="Logo" style={{ width: 48, height: 48, objectFit: 'contain', background: 'none' }} />
          </div>
          <span>SmartSale365</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {/* 1. Gestión de Acceso y Seguridad */}
        {(tienePermiso('usuarios') || tienePermiso('roles') || tienePermiso('bitacora')) && (
          <>
            <div className={`nav-item ${activeMenu === 'seguridad' ? 'active' : ''}`} onClick={() => handleMenuClick('seguridad')}>
              <span className="nav-item-icon">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#fff"/></svg>
              </span>
              <span>Gestión de Acceso y Seguridad</span>
              <span className="nav-item-arrow"></span>
            </div>
            <div className="submenu">
              {tienePermiso('usuarios') && (
                <NavLink to="/gestionar-usuarios" className={({ isActive }) => "nav-subitem" + (isActive ? " active" : "")}>
                  <span className="nav-subitem-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </span>
                  <span>Gestionar Usuarios</span>
                </NavLink>
              )}
              {tienePermiso('roles') && (
                <>
                  <NavLink to="/gestionar-roles-permisos" className={({ isActive }) => "nav-subitem" + (isActive ? " active" : "")}>
                    <span className="nav-subitem-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </span>
                    <span>Roles y Permisos</span>
                  </NavLink>
                  <NavLink to="/asignar-roles" className={({ isActive }) => "nav-subitem" + (isActive ? " active" : "")}>
                    <span className="nav-subitem-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
                    </span>
                    <span>Asignar Roles</span>
                  </NavLink>
                  <NavLink to="/asignar-permisos" className={({ isActive }) => "nav-subitem" + (isActive ? " active" : "")}>
                    <span className="nav-subitem-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </span>
                    <span>Asignar Permisos</span>
                  </NavLink>
                </>
              )}
              {tienePermiso('bitacora') && (
                <NavLink to="/gestionar-bitacora" className={({ isActive }) => "nav-subitem" + (isActive ? " active" : "")}>
                  <span className="nav-subitem-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </span>
                  <span>Bitácora de Actividad</span>
                </NavLink>
              )}
            </div>
          </>
        )}

        {/* 2. Gestión Comercial */}
        {(tienePermiso('clientes') || tienePermiso('ventas') || tienePermiso('inventario')) && (
          <>
            <div className={`nav-item ${activeMenu === 'comercial' ? 'active' : ''}`} onClick={() => handleMenuClick('comercial')}>
              <span className="nav-item-icon">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4.07a2 2 0 0 0-2 0l-7 4.07A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4.07a2 2 0 0 0 2 0l7-4.07A2 2 0 0 0 21 16zM12 4.15l7 4.07-7 4.07-7-4.07 7-4.07zM5 8.92l7 4.07v6.15l-7-4.07V8.92zm14 6.15l-7 4.07v-6.15l7-4.07v6.15z" fill="#fff"/></svg>
              </span>
              <span>Gestión Comercial</span>
              <span className="nav-item-arrow"></span>
            </div>
            <div className="submenu">
              {tienePermiso('clientes') && (
                <NavLink to="/gestionar-clientes" className={({ isActive }) => "nav-subitem" + (isActive ? " active" : "")}>
                  <span className="nav-subitem-icon">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5s-3 1.34-3 3 1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.52.64 2.97 1.75 2.97 3.45V19h5v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="#fff"/></svg>
                  </span>
                  <span>Gestionar Clientes</span>
                </NavLink>
              )}
              {tienePermiso('ventas') && (
                <NavLink to="/gestionar-ventas" className={({ isActive }) => "nav-subitem" + (isActive ? " active" : "")}>
                  <span className="nav-subitem-icon">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14l.84-2h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12z" fill="#fff"/></svg>
                  </span>
                  <span>Gestionar Ventas</span>
                </NavLink>
              )}
              {tienePermiso('inventario') && (
                <NavLink to="/gestionar-inventario" className={({ isActive }) => "nav-subitem" + (isActive ? " active" : "")}> 
                  <span className="nav-subitem-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><line x1="8" y1="4" x2="8" y2="20"></line></svg>
                  </span>
                  <span>Gestionar Inventario</span>
                </NavLink>
              )}
            </div>
          </>
        )}

        {/* 3. Compras / E-Commerce */}
        {(tienePermiso('catalogo') || tienePermiso('carrito') || tienePermiso('notificaciones')) && (
          <>
            <div className={`nav-item ${activeMenu === 'ecommerce' ? 'active' : ''}`} onClick={() => handleMenuClick('ecommerce')}>
              <span className="nav-item-icon">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14l.84-2h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12z" fill="#fff"/></svg>
              </span>
              <span>Compras / E-Commerce</span>
              <span className="nav-item-arrow"></span>
            </div>
            <div className="submenu">
              {tienePermiso('catalogo') && (
                <NavLink to="/catalogo" className={({ isActive }) => "nav-subitem" + (isActive ? " active" : "")}>
                  <span className="nav-subitem-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  </span>
                  <span>Catálogo de Productos</span>
                </NavLink>
              )}
              {tienePermiso('carrito') && (
                <NavLink to="/carrito" className={({ isActive }) => "nav-subitem" + (isActive ? " active" : "")}>
                  <span className="nav-subitem-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                  </span>
                  <span>Carrito de Compras</span>
                </NavLink>
              )}
              {tienePermiso('notificaciones') && (
                <NavLink to="/notificaciones" className={({ isActive }) => "nav-subitem" + (isActive ? " active" : "")}>
                  <span className="nav-subitem-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                  </span>
                  <span>Notificaciones</span>
                </NavLink>
              )}
            </div>
          </>
        )}

        {/* 4. Reportes Dinámicos (IA) */}
        {tienePermiso('reportes') && (
          <>
            <div className={`nav-item ${activeMenu === 'reportes' ? 'active' : ''}`} onClick={() => handleMenuClick('reportes')}>
              <span className="nav-item-icon">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="#fff"/></svg>
              </span>
              <span>Reportes Dinámicos (IA)</span>
              <span className="nav-item-arrow"></span>
            </div>
            <div className="submenu">
              <NavLink to="/reportes" className={({ isActive }) => "nav-subitem" + (isActive ? " active" : "")}>
                <span className="nav-subitem-icon">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M3 17h2v-7H3v7zm4 0h2v-12H7v12zm4 0h2v-9h-2v9zm4 0h2v-4h-2v4z" fill="#fff"/></svg>
                </span>
                <span>Gestionar Reportes</span>
              </NavLink>
            </div>
          </>
        )}

        {/* 5. Dashboard e Inteligencia de Negocio (IA) */}
        {(tienePermiso('dashboard') || tienePermiso('predicciones')) && (
          <>
            <div className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`} onClick={() => handleMenuClick('dashboard')}>
              <span className="nav-item-icon">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="#fff"/></svg>
              </span>
              <span>Dashboard e Inteligencia de Negocio (IA)</span>
              <span className="nav-item-arrow"></span>
            </div>
            <div className="submenu">
              {tienePermiso('dashboard') && (
                <NavLink to="/dashboard" className="nav-subitem">
                  <span className="nav-subitem-icon">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="#fff"/></svg>
                  </span>
                  <span>Dashboard Principal</span>
                </NavLink>
              )}
              {tienePermiso('predicciones') && (
                <NavLink to="/predicciones" className="nav-subitem">
                  <span className="nav-subitem-icon">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="#fff" stroke="currentColor" strokeWidth="2"/></svg>
                  </span>
                  <span>Predicción de Ventas (IA)</span>
                </NavLink>
              )}
            </div>
          </>
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">AM</div>
          <div className="user-details">
            <div className="user-name">Ana Martínez</div>
            <div className="user-role">Gerente</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
