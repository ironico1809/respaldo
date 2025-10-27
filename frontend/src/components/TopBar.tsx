import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import './TopBar.css';

interface TopBarProps {
  onMenuClick: () => void;
  title: string;
}

interface User {
  username: string;
  tipo_usuario: string;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, title }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout(); // Llama al backend para registrar el logout
      navigate('/login'); // Redirige al login
    } catch (error) {
      console.error("Error al registrar el logout en el backend:", error);
      // Si hay un error, igual se desloguea del frontend
      navigate('/login'); 
    }
  };

  const getInitials = (username: string) => {
    return username ? username.substring(0, 2).toUpperCase() : '..';
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-button" onClick={onMenuClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="topbar-right">
        <div className="user-menu">
          <div className="user-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {user ? getInitials(user.username) : ''}
          </div>
          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-name">{user?.username}</div>
                <div className="user-role">{user?.tipo_usuario}</div>
              </div>
              <button onClick={handleLogout} className="dropdown-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;