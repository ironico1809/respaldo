import React, { useState, useEffect } from 'react';
import './AsignarPermisos.css';
import Button from '../components/Button';
import Modal from '../components/Modal';
import permisoService from '../services/permisoService';
import * as authService from '../services/authService';

interface Usuario {
  id: number;
  username: string;
  email: string;
  tipo_usuario: string;
}

interface Permiso {
  id: number;
  usuario_id: number;
  usuario_username?: string;
  vista: string;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
  puede_ver: boolean;
}

const AsignarPermisos: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<number | null>(null);
  const [vistaSeleccionada, setVistaSeleccionada] = useState('');
  const [permisosNuevos, setPermisosNuevos] = useState({
    puede_crear: false,
    puede_editar: false,
    puede_eliminar: false,
    puede_ver: true,
  });
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [permisosData, usuariosData] = await Promise.all([
        permisoService.getAll(),
        authService.getAll(),
      ]);
      // Adaptar permisosData al tipado local
      setPermisos(
        permisosData.map((p: any) => ({
          ...p,
          usuario_id: p.usuario ?? p.usuario_id,
          usuario_username: p.usuario_username ?? (usuariosData.find((u: any) => u.id === (p.usuario ?? p.usuario_id))?.username || ''),
        }))
      );
      // Adaptar usuariosData al tipado local
      setUsuarios(
        usuariosData.map((u: any) => ({
          id: u.id,
          username: u.username,
          email: u.email ?? u.correo ?? '',
          tipo_usuario: u.tipo_usuario,
        }))
      );
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const vistas = [
    'productos',
    'categorias',
    'clientes',
    'ventas',
    'inventario',
    'reportes',
    'usuarios',
    'bitacora',
    'notificaciones',
  ];

  const abrirModalAsignar = () => {
    setModalAbierto(true);
    setUsuarioSeleccionado(null);
    setVistaSeleccionada('');
    setPermisosNuevos({
      puede_crear: false,
      puede_editar: false,
      puede_eliminar: false,
      puede_ver: true,
    });
  };

  const cerrarModal = () => {
    setModalAbierto(false);
  };

  const asignarPermiso = async () => {
    if (!usuarioSeleccionado || !vistaSeleccionada) {
      alert('Debes seleccionar un usuario y una vista');
      return;
    }

    // Verificar si ya existe el permiso
    const existente = permisos.find(
      (p) => p.usuario_id === usuarioSeleccionado && p.vista === vistaSeleccionada
    );

    if (existente) {
      alert('Este usuario ya tiene permisos asignados para esta vista. Puedes editarlos desde la tabla.');
      return;
    }

    try {
      const nuevoPermiso = await permisoService.create({
        usuario: usuarioSeleccionado,
        vista: vistaSeleccionada,
        puede_crear: permisosNuevos.puede_crear,
        puede_editar: permisosNuevos.puede_editar,
        puede_eliminar: permisosNuevos.puede_eliminar,
        puede_ver: permisosNuevos.puede_ver,
      });
      setPermisos([...permisos, {
        ...nuevoPermiso,
        usuario_id: usuarioSeleccionado,
      }]);
      cerrarModal();
      alert('Permiso asignado exitosamente');
    } catch (error) {
      console.error('Error al asignar permiso:', error);
      alert('Error al asignar el permiso');
    }
  };

  const togglePermiso = async (permisoId: number, campo: keyof Omit<Permiso, 'id' | 'usuario' | 'usuario_username' | 'vista'>) => {
    const permiso = permisos.find((p) => p.id === permisoId);
    if (!permiso) return;

    try {
      const actualizado = await permisoService.update(permisoId, {
        [campo]: !permiso[campo],
      });
      setPermisos(permisos.map((p) => (p.id === permisoId ? {
        ...actualizado,
        usuario_id: permiso.usuario_id,
      } : p)));
    } catch (error) {
      console.error('Error al actualizar permiso:', error);
    }
  };

  const eliminarPermiso = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este permiso?')) {
      try {
        await permisoService.delete(id);
        setPermisos(permisos.filter((p) => p.id !== id));
      } catch (error) {
        console.error('Error al eliminar permiso:', error);
      }
    }
  };

  const permisosFiltrados = permisos.filter(
    (p) =>
      (p.usuario_username && p.usuario_username.toLowerCase().includes(busqueda.toLowerCase())) ||
      p.vista.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="asignar-permisos">
      <div className="header-permisos">
        <h1>Gestión de Permisos</h1>
        <Button className="btn-primary" onClick={abrirModalAsignar}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Asignar Permiso
        </Button>
      </div>

      <div className="filtros-permisos">
        <div className="input-busqueda">
          <input
            type="text"
            placeholder="Buscar por usuario o vista..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-search"
          />
        </div>
      </div>

      <div className="tabla-permisos-container">
        <table className="tabla-permisos">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Vista</th>
              <th className="text-center">Crear</th>
              <th className="text-center">Editar</th>
              <th className="text-center">Eliminar</th>
              <th className="text-center">Ver</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={7} className="text-center">
                  Cargando permisos...
                </td>
              </tr>
            ) : permisosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  No hay permisos asignados
                </td>
              </tr>
            ) : (
              permisosFiltrados.map((permiso) => (
                <tr key={permiso.id}>
                  <td>
                    <div className="usuario-info">
                      <span className="usuario-nombre">{permiso.usuario_username || 'Usuario'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge-vista">{permiso.vista}</span>
                  </td>
                  <td className="text-center">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={permiso.puede_crear}
                        onChange={() => togglePermiso(permiso.id, 'puede_crear')}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td className="text-center">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={permiso.puede_editar}
                        onChange={() => togglePermiso(permiso.id, 'puede_editar')}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td className="text-center">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={permiso.puede_eliminar}
                        onChange={() => togglePermiso(permiso.id, 'puede_eliminar')}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td className="text-center">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={permiso.puede_ver}
                        onChange={() => togglePermiso(permiso.id, 'puede_ver')}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td className="text-center">
                    <button className="btn-eliminar-permiso" onClick={() => eliminarPermiso(permiso.id)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal isOpen={modalAbierto} onClose={cerrarModal} title="Asignar Permiso">
          <div className="form-asignar-permiso">
            <div className="form-group">
              <label htmlFor="usuario">Usuario</label>
              <select
                id="usuario"
                value={usuarioSeleccionado || ''}
                onChange={(e) => setUsuarioSeleccionado(Number(e.target.value))}
                className="select-input"
              >
                <option value="">Selecciona un usuario</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.username} ({usuario.tipo_usuario})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="vista">Vista/Módulo</label>
              <select
                id="vista"
                value={vistaSeleccionada}
                onChange={(e) => setVistaSeleccionada(e.target.value)}
                className="select-input"
              >
                <option value="">Selecciona una vista</option>
                {vistas.map((vista) => (
                  <option key={vista} value={vista}>
                    {vista.charAt(0).toUpperCase() + vista.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="permisos-checks">
              <h4>Permisos</h4>
              <div className="checks-grid">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={permisosNuevos.puede_ver}
                    onChange={(e) => setPermisosNuevos({ ...permisosNuevos, puede_ver: e.target.checked })}
                  />
                  <span>Ver</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={permisosNuevos.puede_crear}
                    onChange={(e) => setPermisosNuevos({ ...permisosNuevos, puede_crear: e.target.checked })}
                  />
                  <span>Crear</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={permisosNuevos.puede_editar}
                    onChange={(e) => setPermisosNuevos({ ...permisosNuevos, puede_editar: e.target.checked })}
                  />
                  <span>Editar</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={permisosNuevos.puede_eliminar}
                    onChange={(e) => setPermisosNuevos({ ...permisosNuevos, puede_eliminar: e.target.checked })}
                  />
                  <span>Eliminar</span>
                </label>
              </div>
            </div>

            <div className="modal-acciones">
              <Button className="btn-secondary" onClick={cerrarModal}>
                Cancelar
              </Button>
              <Button className="btn-primary" onClick={asignarPermiso}>
                Asignar Permiso
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AsignarPermisos;
