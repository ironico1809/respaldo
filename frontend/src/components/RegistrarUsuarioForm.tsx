import React, { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import Input from './Input';
import Button from './Button';
import './RegistrarUsuarioForm.css';
import { crearUsuario, actualizarUsuario } from '../services/usuarioService';

type Usuario = {
  id: number;
  username: string;
  correo: string;
  tipo_usuario: 'administrador' | 'empleado' | 'supervisor';
  estado: boolean;
};

interface RegistrarUsuarioFormProps {
  usuario: Usuario | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const RegistrarUsuarioForm: React.FC<RegistrarUsuarioFormProps> = ({ usuario, onSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState<'administrador' | 'empleado' | 'supervisor'>('empleado');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (usuario) {
      setUsername(usuario.username);
      setCorreo(usuario.correo);
      setTipoUsuario(usuario.tipo_usuario);
      setPassword(''); // No precargar la contraseña por seguridad
    } else {
      // Resetear para un nuevo usuario
      setUsername('');
      setCorreo('');
      setPassword('');
      setTipoUsuario('empleado');
      setError('');
    }
  }, [usuario]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !correo) {
      setError('Username y Correo son campos obligatorios.');
      return;
    }
    if (!usuario && !password) {
      setError('La contraseña es obligatoria para nuevos usuarios.');
      return;
    }

    try {
      if (usuario) {
        // Lógica para llamar a la API y ACTUALIZAR el usuario
        const dataToUpdate: any = {
          correo,
          tipo_usuario: tipoUsuario,
        };
        // Opcionalmente, si se quiere permitir cambiar la contraseña al editar
        if (password) {
          dataToUpdate.password = password;
        }
        await actualizarUsuario(usuario.id, dataToUpdate);
      } else {
        // Lógica para llamar a la API y REGISTRAR el usuario
        await crearUsuario({ username, correo, password, tipo_usuario: tipoUsuario });
      }
      onSuccess();
    } catch (err: any) {
      if (err.response && err.response.data) {
        // Muestra errores de validación del backend (ej: username ya existe)
        const apiErrors = Object.values(err.response.data).flat().join(' ');
        setError(apiErrors || 'Ocurrió un error al guardar el usuario.');
      } else {
        setError('Ocurrió un error de conexión.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="registrar-usuario-form">
      {error && <p className="form-error-message">{error}</p>}
      <div className="form-grid">
        <Input
          id="username"
          label="Username"
          value={username}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          disabled={!!usuario}
        />
        <Input id="correo" label="Correo Electrónico" type="email" value={correo} onChange={(e: ChangeEvent<HTMLInputElement>) => setCorreo(e.target.value)} />
        
        <Input
          id="password"
          label={usuario ? "Nueva Contraseña (opcional)" : "Contraseña"}
          type="password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        <div className="form-group">
          <label htmlFor="tipoUsuario">Tipo de Usuario</label>
          <select id="tipoUsuario" value={tipoUsuario} onChange={(e) => setTipoUsuario(e.target.value as any)} className="form-select">
            <option value="empleado">Empleado</option>
            <option value="supervisor">Supervisor</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>

      </div>
      <div className="form-actions">
        <Button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="btn-primary" disabled={loading}>
          {usuario ? 'Guardar Cambios' : 'Registrar Usuario'}
        </Button>
      </div>
    </form>
  );
};

export default RegistrarUsuarioForm;