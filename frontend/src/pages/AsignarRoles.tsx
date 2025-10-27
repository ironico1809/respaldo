import React, { useState, useEffect, useCallback } from 'react';
import './AsignarRoles.css';
import { getUsuarios, actualizarUsuario } from '../services/usuarioService';

type Usuario = {
  id: number;
  username: string;
  correo: string;
  tipo_usuario: 'administrador' | 'empleado' | 'supervisor';
  estado: boolean;
};

const AsignarRoles: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getUsuarios('todos');
      setUsuarios(response.data);
    } catch (err) {
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const handleRoleChange = async (userId: number, nuevoRol: Usuario['tipo_usuario']) => {
    const usuario = usuarios.find(u => u.id === userId);
    if (!usuario) return;

    const confirmMessage = `¿Estás seguro de que deseas cambiar el rol de "${usuario.username}" a "${nuevoRol}"?`;
    if (window.confirm(confirmMessage)) {
      try {
        await actualizarUsuario(userId, { tipo_usuario: nuevoRol });
        cargarUsuarios(); // Recargar para confirmar el cambio
      } catch (err) {
        setError(`No se pudo cambiar el rol del usuario ${usuario.username}.`);
      }
    } else {
        // Si el usuario cancela, revertimos el cambio en el selector visualmente
        const select = document.getElementById(`rol-selector-${userId}`) as HTMLSelectElement;
        if (select) {
            select.value = usuario.tipo_usuario;
        }
    }
  };

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.tipo_usuario.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="asignar-roles-container">
      <div className="asignar-roles-card">
        <div className="asignar-roles-card-header">
          <span className="asignar-roles-card-title">Asignación de Roles</span>
          <span className="asignar-roles-card-count">{usuariosFiltrados.length} usuarios</span>
          <input
            className="asignar-roles-buscar"
            type="text"
            placeholder="Buscar por username, correo o rol..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        {loading && <p>Cargando usuarios...</p>}
        {error && <p className="form-error-message">{error}</p>}
        <div className="asignar-roles-table-container">
          <table className="asignar-roles-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Rol Asignado</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td><b>{u.username}</b></td>
                  <td>{u.correo}</td>
                  <td>
                    <span className={`usuarios-estado ${u.estado ? 'activo' : 'inactivo'}`}>
                      {u.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <select
                      id={`rol-selector-${u.id}`}
                      className="rol-selector"
                      value={u.tipo_usuario}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Usuario['tipo_usuario'])}
                    >
                      <option value="empleado">Empleado</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="administrador">Administrador</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AsignarRoles;