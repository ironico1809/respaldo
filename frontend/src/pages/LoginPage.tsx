import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FormEvent, ChangeEvent } from 'react';
import './LoginPage.css';
import logo from '../assets/logo.svg';
import Input from '../components/Input';
import Button from '../components/Button';
import { login } from '../services/authService';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <img src={logo} alt="SmartSales Logo" className="login-logo" />
        <h2>Iniciar Sesión</h2>
        <p className="login-subtitle">Bienvenido a SmartSales365</p>
        <form onSubmit={handleLogin}>
          <Input id="username" label="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input
            id="password"
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
          {error && <p className="error-message">{error}</p>}
          <Button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
