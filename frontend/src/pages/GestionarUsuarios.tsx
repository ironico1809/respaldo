import React, { useState, useEffect, useCallback } from 'react';
import './GestionarUsuarios.css';
import Modal from '../components/Modal';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import RegistrarUsuarioForm from '../components/RegistrarUsuarioForm';
import { getUsuarios, actualizarUsuario } from '../services/usuarioService';
import { useBitacora } from '../hooks/useBitacora';

type Usuario = {
  id: number;
  username: string;
  correo: string;
  tipo_usuario: 'administrador' | 'empleado' | 'supervisor';
  estado: boolean;
};

const GestionarUsuarios: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioAEditar, setUsuarioAEditar] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { registrar } = useBitacora();

  useEffect(() => {
    // Registrar acceso a la página
    registrar('ACCESO', 'Accedió a Gestionar Usuarios');
  }, []);

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getUsuarios('todos'); 
      setUsuarios(response.data);
      setUsuariosFiltrados(response.data);
    } catch (err) {
      setError('No se pudieron cargar los usuarios. Inténtalo de nuevo más tarde.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const handleBuscar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const termino = e.target.value.toLowerCase();
    setBusqueda(termino);
    setUsuariosFiltrados(
      usuarios.filter(
        (u) =>
          u.username.toLowerCase().includes(termino) ||
          u.correo.toLowerCase().includes(termino) ||
          u.tipo_usuario.toLowerCase().includes(termino)
      )
    );
  };

  const handleNuevoUsuario = () => {
    setUsuarioAEditar(null);
    setIsModalOpen(true);
  };

  const handleEditarUsuario = (usuario: Usuario) => {
    setUsuarioAEditar(usuario);
    setIsModalOpen(true);
  };

  const handleToggleEstadoUsuario = async (usuario: Usuario) => {
    const confirmMessage = usuario.estado
      ? `¿Estás seguro de que deseas desactivar al usuario "${usuario.username}"?`
      : `¿Estás seguro de que deseas restaurar al usuario "${usuario.username}"?`;

    if (window.confirm(confirmMessage)) {
      try { // La eliminación es lógica, por lo que usamos el endpoint de actualizar
        const response = await actualizarUsuario(usuario.id, { estado: !usuario.estado });
        if (response.status === 200) {
            // Registrar en bitácora
            const accion = usuario.estado ? 'DESACTIVAR_USUARIO' : 'ACTIVAR_USUARIO';
            await registrar(accion, `${accion === 'DESACTIVAR_USUARIO' ? 'Desactivó' : 'Activó'} al usuario ${usuario.username}`);
            
            // Volvemos a cargar los usuarios para reflejar el cambio
            cargarUsuarios();
        } else {
            setError(`No se pudo cambiar el estado del usuario ${usuario.username}.`);
        }
      } catch (err) {
        setError(`No se pudo cambiar el estado del usuario ${usuario.username}.`);
        console.error(err);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUsuarioAEditar(null);
  };

  const handleUsuarioGuardado = () => {
    // Recargamos la lista de usuarios después de guardar/crear
    cargarUsuarios();
    handleCloseModal();
  };

  return (
    <div className="gestionar-usuarios-container">
      <button className="btn btn-primary btn-nuevo" onClick={handleNuevoUsuario}>
        + Nuevo Usuario
      </button>
      <div className="usuarios-card">
        <div className="usuarios-card-header">
          <span className="usuarios-card-title">Lista de Usuarios</span>
          <span className="usuarios-card-count">{usuariosFiltrados.length} usuarios</span>
          <input
            className="usuarios-buscar"
            type="text"
            placeholder="Buscar por username, correo o tipo..."
            value={busqueda}
            onChange={handleBuscar}
          />
        </div>
        {loading && <p>Cargando usuarios...</p>}
        {error && <p className="form-error-message">{error}</p>}
        <div className="usuarios-table-container">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Correo</th>
                <th>Tipo de Usuario</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td><b>{u.username}</b></td>
                  <td>{u.correo}</td>
                  <td>
                    <span className={`tipo-usuario-badge ${u.tipo_usuario}`}>
                      {u.tipo_usuario}
                    </span>
                  </td>
                  <td>
                    <span className={`usuarios-estado ${u.estado ? 'activo' : 'inactivo'}`}>
                      {u.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="usuarios-acciones">
                    <EditButton onClick={() => handleEditarUsuario(u)} />
                    <DeleteButton onClick={() => handleToggleEstadoUsuario(u)} />
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
        title={usuarioAEditar ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
      >
        <RegistrarUsuarioForm
          usuario={usuarioAEditar}
          onSuccess={handleUsuarioGuardado}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default GestionarUsuarios;