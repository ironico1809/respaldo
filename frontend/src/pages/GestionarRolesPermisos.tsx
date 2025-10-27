import React, { useState } from 'react';
import './GestionarRolesPermisos.css';
import Modal from '../components/Modal';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import RegistrarRolPermisoForm from '../components/RegistrarRolPermisoForm';

type Permiso = {
  id: number;
  nombre: string;
  descripcion: string;
};

type Rol = {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: Permiso['id'][]; // IDs de los permisos asociados
  estado: 'Activo' | 'Inactivo';
};

// Datos simulados para roles y permisos
const permisosDisponibles: Permiso[] = [
  { id: 1, nombre: 'Ver Dashboard', descripcion: 'Acceso a la vista principal del sistema.' },
  { id: 2, nombre: 'Gestionar Clientes', descripcion: 'Crear, editar y eliminar clientes.' },
  { id: 3, nombre: 'Gestionar Usuarios', descripcion: 'Crear, editar y eliminar usuarios.' },
  { id: 4, nombre: 'Gestionar Productos', descripcion: 'Administrar el catálogo de productos.' },
  { id: 5, nombre: 'Realizar Ventas', descripcion: 'Registrar nuevas ventas.' },
  { id: 6, nombre: 'Ver Reportes', descripcion: 'Acceso a los reportes y estadísticas.' },
];

const rolesIniciales: Rol[] = [
  {
    id: 1,
    nombre: 'Administrador',
    descripcion: 'Acceso total al sistema y gestión de usuarios.',
    permisos: [1, 2, 3, 4, 5, 6],
    estado: 'Activo',
  },
  {
    id: 2,
    nombre: 'Empleado',
    descripcion: 'Acceso básico para operaciones diarias.',
    permisos: [1, 2, 5],
    estado: 'Activo',
  },
  {
    id: 3,
    nombre: 'Supervisor',
    descripcion: 'Acceso a reportes y gestión de empleados.',
    permisos: [1, 2, 3, 6],
    estado: 'Inactivo',
  },
];

const GestionarRolesPermisos: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [data, setData] = useState(rolesIniciales);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rolAEditar, setRolAEditar] = useState<Rol | null>(null);

  const handleBuscar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const termino = e.target.value.toLowerCase();
    setBusqueda(termino);
    setData(
      rolesIniciales.filter(
        (r) =>
          r.nombre.toLowerCase().includes(termino) ||
          r.descripcion.toLowerCase().includes(termino) ||
          r.estado.toLowerCase().includes(termino)
      )
    );
  };

  const handleNuevoRol = () => {
    setRolAEditar(null);
    setIsModalOpen(true);
  };

  const handleEditarRol = (rol: Rol) => {
    setRolAEditar(rol);
    setIsModalOpen(true);
  };

  const handleToggleEstadoRol = (rol: Rol) => {
    const confirmMessage = rol.estado === 'Activo'
      ? `¿Estás seguro de que deseas desactivar el rol "${rol.nombre}"?`
      : `¿Estás seguro de que deseas activar el rol "${rol.nombre}"?`;

    if (window.confirm(confirmMessage)) {
      // Lógica para llamar a la API de cambio de estado
      setData(data.map(r => r.id === rol.id ? { ...r, estado: r.estado === 'Activo' ? 'Inactivo' : 'Activo' } : r));
      console.log(`Estado del rol ${rol.id} cambiado.`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRolAEditar(null);
  };

  const handleRolGuardado = () => {
    // Aquí podrías volver a cargar la lista de roles desde la API
    if (rolAEditar) {
      console.log('Rol actualizado, actualizando lista...');
    } else {
      console.log('Rol registrado, actualizando lista...');
    }
    handleCloseModal();
  };

  return (
    <div className="gestionar-roles-permisos-container">
      <button className="btn btn-primary btn-nuevo" onClick={handleNuevoRol}>
        + Nuevo Rol
      </button>
      <div className="roles-permisos-card">
        <div className="roles-permisos-card-header">
          <span className="roles-permisos-card-title">Lista de Roles y Permisos</span>
          <span className="roles-permisos-card-count">{data.length} roles</span>
          <input
            className="roles-permisos-buscar"
            type="text"
            placeholder="Buscar por nombre, descripción o estado..."
            value={busqueda}
            onChange={handleBuscar}
          />
        </div>
        <div className="roles-permisos-table-container">
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
              {data.map((rol) => (
                <tr key={rol.id}>
                  <td>{rol.id}</td>
                  <td><b>{rol.nombre}</b></td>
                  <td>{rol.descripcion}</td>
                  <td>
                    {rol.permisos.length > 0 ? (
                      <span className="permisos-count">{rol.permisos.length} permisos</span>
                    ) : (
                      <span className="permisos-count no-permisos">Ninguno</span>
                    )}
                  </td>
                  <td>
                    <span className={`roles-permisos-estado ${rol.estado === 'Activo' ? 'activo' : 'inactivo'}`}>
                      {rol.estado}
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
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={rolAEditar ? 'Editar Rol' : 'Registrar Nuevo Rol'}
      >
        <RegistrarRolPermisoForm
          rol={rolAEditar}
          permisosDisponibles={permisosDisponibles}
          onSuccess={handleRolGuardado}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default GestionarRolesPermisos;