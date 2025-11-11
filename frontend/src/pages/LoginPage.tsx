import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { FormEvent } from 'react';
import './LoginPage.css';
import logo from '../assets/logo.png';
import Input from '../components/Input';
import Button from '../components/Button';
import { login } from '../services/authService';
import { MdPerson, MdLock } from 'react-icons/md';


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
        <p className="login-subtitle" style={{ marginTop: 0 }}>Ingresa tus credenciales para acceder a tu cuenta</p>
        
        <form onSubmit={handleLogin} noValidate>
          <Input
            id="username"
            label="Nombre de Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ej. juan.perez"
            icon={<MdPerson />}
          />

          <Input
            id="password"
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<MdLock />}
          />

          {error && <p className="form-error-message">{error}</p>}
          <Button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
        <div className="login-footer">
          <Link to="/recuperar-password">¿Olvidaste tu contraseña?</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
