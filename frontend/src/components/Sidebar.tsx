import React, { useState } from 'react';
import './Sidebar.css';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>('dashboard');
  
  const handleMenuClick = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M7 7V6a5 5 0 0 1 10 0v1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1zm2-1a3 3 0 0 1 6 0v1H9V6zm-3 3v11h12V9H6z" fill="#fff"/></svg>
          </div>
          <span>SmartSale365</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div 
          className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleMenuClick('dashboard')}
        >
          <span className="nav-item-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M3 17h2v-7H3v7zm4 0h2v-12H7v12zm4 0h2v-9h-2v9zm4 0h2v-4h-2v4z" fill="#fff"/></svg>
          </span>
          <span>Dashboard y Negocio</span>
          <span className="nav-item-arrow"></span>
        </div>
        <div className="submenu">
          <NavLink to="/dashboard" className="nav-subitem">
            <span className="nav-subitem-icon">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="#fff"/></svg>
            </span>
            <span>Dashboard</span>
          </NavLink>
        </div>
        <div className={`nav-item ${activeMenu === 'seguridad' ? 'active' : ''}`} onClick={() => handleMenuClick('seguridad')}>
          <span className="nav-item-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.65l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.007 7.007 0 0 0-1.62-.94l-.36-2.53A.5.5 0 0 0 13 2h-3a.5.5 0 0 0-.5.42l-.36 2.53c-.59.22-1.14.52-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22l-1.92 3.32a.5.5 0 0 0 .12.65l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.65l1.92 3.32c.14.24.44.32.68.22l2.39-.96c.48.42 1.03.72 1.62.94l.36 2.53c.05.28.27.42.5.42h3c.23 0 .45-.14.5-.42l.36-2.53c.59-.22 1.14-.52 1.62-.94l2.39.96c.24.1.54.02.68-.22l1.92-3.32a.5.5 0 0 0-.12-.65l-2.03-1.58zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" fill="#fff"/></svg>
          </span>
          <span>Gestión de Acceso y Seguridad</span>
          <span className="nav-item-arrow"></span>
        </div>
        <div className="submenu">
          <NavLink to="/gestionar-usuarios" className={({ isActive }) => "nav-subitem" + (isActive ? " active" : "")}>
            <span className="nav-subitem-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </span>
            <span>Gestionar Usuarios</span>
          </NavLink>
          <NavLink to="/gestionar-roles-permisos" className={({ isActive }) => "nav-subitem" + (isActive ? " active" : "")}>
            <span className="nav-subitem-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </span>
            <span>Gestionar Roles y Permisos</span>
          </NavLink>
          <NavLink to="/asignar-roles" className={({ isActive }) => "nav-subitem" + (isActive ? " active" : "")}>
            <span className="nav-subitem-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
            </span>
            <span>Asignar Roles a Usuarios</span>
          </NavLink>
          <NavLink to="/gestionar-bitacora" className={({ isActive }) => "nav-subitem" + (isActive ? " active" : "")}>
            <span className="nav-subitem-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </span>
            <span>Bitácora de Actividad</span>
          </NavLink>
        </div>
        <div 
          className={`nav-item ${activeMenu === 'comercial' ? 'active' : ''}`}
          onClick={() => handleMenuClick('comercial')}
        >
          <span className="nav-item-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4.07a2 2 0 0 0-2 0l-7 4.07A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4.07a2 2 0 0 0 2 0l7-4.07A2 2 0 0 0 21 16zM12 4.15l7 4.07-7 4.07-7-4.07 7-4.07zM5 8.92l7 4.07v6.15l-7-4.07V8.92zm14 6.15l-7 4.07v-6.15l7-4.07v6.15z" fill="#fff"/></svg>
          </span>
          <span>Gestión Comercial</span>
          <span className="nav-item-arrow"></span>
        </div>
        <div className="submenu">
          <NavLink to="/gestionar-clientes" className={({ isActive }) => "nav-subitem" + (isActive ? " active" : "")}>
            <span className="nav-subitem-icon">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5s-3 1.34-3 3 1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.52.64 2.97 1.75 2.97 3.45V19h5v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="#fff"/></svg>
            </span>
            <span>Gestionar Clientes</span>
          </NavLink>
        </div>
        <a href="#" className="nav-item">
          <span className="nav-item-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14l.84-2h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12z" fill="#fff"/></svg>
          </span>
          <span>Compras / E-Commerce</span>
        </a>
        <a href="#" className="nav-item">
          <span className="nav-item-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M3 17h2v-7H3v7zm4 0h2v-12H7v12zm4 0h2v-9h-2v9zm4 0h2v-4h-2v4z" fill="#fff"/></svg>
          </span>
          <span>Reportes Dinámicos</span>
        </a>
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
