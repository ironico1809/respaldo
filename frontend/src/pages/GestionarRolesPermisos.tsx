import React, { useState, useEffect } from 'react';
import './GestionarRolesPermisos.css';
import Modal from '../components/Modal';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import { API_ENDPOINTS, getAuthHeaders } from '../config/api.config';

type Rol = {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  total_permisos: number;
};

const GestionarRolesPermisos: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [data, setData] = useState<Rol[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rolAEditar, setRolAEditar] = useState<Rol | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.permisos.roles, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const rolesData = await response.json();
        setData(rolesData);
      } else {
        setError('Error al cargar los roles');
      }
    } catch (err) {
      setError('Error al cargar los roles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value.toLowerCase());
  };

  const rolesFiltrados = data.filter(
    (r) =>
      r.nombre.toLowerCase().includes(busqueda) ||
      r.descripcion.toLowerCase().includes(busqueda) ||
      (r.activo ? 'activo' : 'inactivo').includes(busqueda)
  );

  const handleNuevoRol = () => {
    setRolAEditar(null);
    setFormNombre('');
    setFormDescripcion('');
    setError('');
    setIsModalOpen(true);
  };

  const handleEditarRol = (rol: Rol) => {
    setRolAEditar(rol);
    setFormNombre(rol.nombre);
    setFormDescripcion(rol.descripcion);
    setError('');
    setIsModalOpen(true);
  };

  const handleToggleEstadoRol = async (rol: Rol) => {
    const confirmMessage = rol.activo
      ? `¿Estás seguro de que deseas desactivar el rol "${rol.nombre}"?`
      : `¿Estás seguro de que deseas activar el rol "${rol.nombre}"?`;

    if (window.confirm(confirmMessage)) {
      try {
        const url = rol.activo 
          ? `${API_ENDPOINTS.permisos.roles}${rol.id}/eliminar/`
          : `${API_ENDPOINTS.permisos.roles}${rol.id}/actualizar/`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ activo: !rol.activo })
        });

        if (response.ok) {
          await cargarRoles();
        } else {
          alert('Error al cambiar el estado del rol');
        }
      } catch (err) {
        alert('Error al cambiar el estado del rol');
        console.error(err);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRolAEditar(null);
    setFormNombre('');
    setFormDescripcion('');
    setError('');
  };

  const handleGuardarRol = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formNombre.trim()) {
      setError('El nombre del rol es obligatorio');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const url = rolAEditar 
        ? `${API_ENDPOINTS.permisos.roles}${rolAEditar.id}/actualizar/`
        : `${API_ENDPOINTS.permisos.roles}crear/`;
      
      const method = 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          nombre: formNombre, 
          descripcion: formDescripcion 
        })
      });

      if (response.ok) {
        await cargarRoles();
        handleCloseModal();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al guardar el rol');
      }
    } catch (err) {
      setError('Error al guardar el rol');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="gestionar-roles-permisos-container">
      <button className="btn btn-primary btn-nuevo" onClick={handleNuevoRol}>
        + Nuevo Rol
      </button>
      <div className="roles-permisos-card">
        <div className="roles-permisos-card-header">
          <span className="roles-permisos-card-title">Lista de Roles y Permisos</span>
          <span className="roles-permisos-card-count">{rolesFiltrados.length} roles</span>
          <input
            className="roles-permisos-buscar"
            type="text"
            placeholder="Buscar por nombre, descripción o estado..."
            value={busqueda}
            onChange={handleBuscar}
          />
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <div className="roles-permisos-table-container">
          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Cargando roles...</p>
          ) : (
            <table className="roles-permisos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre del Rol</th>
                  <th>Descripción</th>
                  <th>Permisos Asignados</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rolesFiltrados.map((rol) => (
                  <tr key={rol.id}>
                    <td>{rol.id}</td>
                    <td><b>{rol.nombre}</b></td>
                    <td>{rol.descripcion}</td>
                    <td>
                      {rol.total_permisos > 0 ? (
                        <span className="permisos-count">{rol.total_permisos} permisos</span>
                      ) : (
                        <span className="permisos-count no-permisos">Ninguno</span>
                      )}
                    </td>
                    <td>
                      <span className={`roles-permisos-estado ${rol.activo ? 'activo' : 'inactivo'}`}>
                        {rol.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="roles-permisos-acciones">
                      <EditButton onClick={() => handleEditarRol(rol)} />
                      <DeleteButton onClick={() => handleToggleEstadoRol(rol)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={rolAEditar ? 'Editar Rol' : 'Registrar Nuevo Rol'}
      >
        <form onSubmit={handleGuardarRol} className="form-rol">
          {error && <div className="form-error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Rol *</label>
            <input
              id="nombre"
              type="text"
              value={formNombre}
              onChange={(e) => setFormNombre(e.target.value)}
              placeholder="Ej: Vendedor, Supervisor, etc."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              value={formDescripcion}
              onChange={(e) => setFormDescripcion(e.target.value)}
              placeholder="Describe las responsabilidades de este rol..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : rolAEditar ? 'Actualizar' : 'Crear Rol'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GestionarRolesPermisos;