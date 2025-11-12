import React, { useState, useEffect } from 'react';
import './AsignarPermisos.css';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { API_ENDPOINTS, getAuthHeaders } from '../config/api.config';

interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

interface PermisoModulo {
  id: number;
  modulo: string;
  nombre_menu: string;
  descripcion: string;
}

interface RolPermiso {
  id: number;
  rol: number;
  rol_nombre: string;
  permiso_modulo: number;
  modulo: string;
  nombre_menu: string;
  puede_ver: boolean;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
}

const AsignarPermisos: React.FC = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [modulos, setModulos] = useState<PermisoModulo[]>([]);
  const [permisos, setPermisos] = useState<RolPermiso[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState<number | null>(null);
  const [moduloSeleccionado, setModuloSeleccionado] = useState<number | null>(null);
  const [permisosNuevos, setPermisosNuevos] = useState({
    puede_crear: false,
    puede_editar: false,
    puede_eliminar: false,
    puede_ver: true,
  });
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError('');
      
      const [rolesRes, modulosRes] = await Promise.all([
        fetch(API_ENDPOINTS.permisos.roles, { headers: getAuthHeaders() }),
        fetch(API_ENDPOINTS.permisos.modulos, { headers: getAuthHeaders() })
      ]);

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData);
        
        // Cargar permisos de cada rol
        const permisosPromises = rolesData.map((rol: Rol) => 
          fetch(`${API_ENDPOINTS.permisos.roles}${rol.id}/`, { headers: getAuthHeaders() })
            .then(res => res.ok ? res.json() : null)
        );
        
        const rolesConPermisos = await Promise.all(permisosPromises);
        const todosLosPermisos: RolPermiso[] = [];
        
        rolesConPermisos.forEach((rolData) => {
          if (rolData && rolData.permisos) {
            rolData.permisos.forEach((permiso: any) => {
              todosLosPermisos.push({
                id: permiso.id,
                rol: rolData.id,
                rol_nombre: rolData.nombre,
                permiso_modulo: permiso.permiso_modulo,
                modulo: permiso.modulo,
                nombre_menu: permiso.nombre_menu,
                puede_ver: permiso.puede_ver,
                puede_crear: permiso.puede_crear,
                puede_editar: permiso.puede_editar,
                puede_eliminar: permiso.puede_eliminar,
              });
            });
          }
        });
        
        setPermisos(todosLosPermisos);
      }

      if (modulosRes.ok) {
        const modulosData = await modulosRes.json();
        setModulos(modulosData);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  const abrirModalAsignar = () => {
    setModalAbierto(true);
    setRolSeleccionado(null);
    setModuloSeleccionado(null);
    setPermisosNuevos({
      puede_crear: false,
      puede_editar: false,
      puede_eliminar: false,
      puede_ver: true,
    });
    setError('');
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setError('');
  };

  const asignarPermiso = async () => {
    if (!rolSeleccionado || !moduloSeleccionado) {
      setError('Debes seleccionar un rol y un módulo');
      return;
    }

    // Verificar si ya existe
    const existente = permisos.find(
      (p) => p.rol === rolSeleccionado && p.permiso_modulo === moduloSeleccionado
    );

    if (existente) {
      setError('Este rol ya tiene permisos asignados para este módulo');
      return;
    }

    // Obtener nombres para el mensaje
    const rolNombre = roles.find(r => r.id === rolSeleccionado)?.nombre || 'Rol';
    const moduloNombre = modulos.find(m => m.id === moduloSeleccionado)?.nombre_menu || 'Módulo';
    
    // Construir descripción de permisos
    const permisosDescripcion = [];
    if (permisosNuevos.puede_ver) permisosDescripcion.push('Ver');
    if (permisosNuevos.puede_crear) permisosDescripcion.push('Crear');
    if (permisosNuevos.puede_editar) permisosDescripcion.push('Editar');
    if (permisosNuevos.puede_eliminar) permisosDescripcion.push('Eliminar');
    const permisosTexto = permisosDescripcion.length > 0 ? permisosDescripcion.join(', ') : 'Ninguno';

    try {
      const response = await fetch(API_ENDPOINTS.permisos.asignarPermiso, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          rol_id: rolSeleccionado,
          permiso_modulo_id: moduloSeleccionado,
          puede_ver: permisosNuevos.puede_ver,
          puede_crear: permisosNuevos.puede_crear,
          puede_editar: permisosNuevos.puede_editar,
          puede_eliminar: permisosNuevos.puede_eliminar,
        })
      });

      if (response.ok) {
        await cargarDatos();
        cerrarModal();
        alert(`✅ Permiso asignado exitosamente\n\nRol: ${rolNombre}\nMódulo: ${moduloNombre}\nPermisos: ${permisosTexto}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al asignar el permiso');
      }
    } catch (err) {
      console.error('Error al asignar permiso:', err);
      setError('Error al asignar el permiso');
    }
  };

  const togglePermiso = async (permiso: RolPermiso, campo: keyof Pick<RolPermiso, 'puede_crear' | 'puede_editar' | 'puede_eliminar' | 'puede_ver'>) => {
    // Determinar el nuevo valor y la acción
    const valorAnterior = permiso[campo];
    const nuevoValor = !valorAnterior;
    const accion = nuevoValor ? 'Activado' : 'Desactivado';
    
    // Nombres legibles para cada campo
    const nombresCampo = {
      puede_ver: 'Ver',
      puede_crear: 'Crear',
      puede_editar: 'Editar',
      puede_eliminar: 'Eliminar'
    };
    
    try {
      const response = await fetch(API_ENDPOINTS.permisos.asignarPermiso, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          rol_id: permiso.rol,
          permiso_modulo_id: permiso.permiso_modulo,
          puede_ver: campo === 'puede_ver' ? nuevoValor : permiso.puede_ver,
          puede_crear: campo === 'puede_crear' ? nuevoValor : permiso.puede_crear,
          puede_editar: campo === 'puede_editar' ? nuevoValor : permiso.puede_editar,
          puede_eliminar: campo === 'puede_eliminar' ? nuevoValor : permiso.puede_eliminar,
        })
      });

      if (response.ok) {
        await cargarDatos();
        // Mostrar notificación breve (opcional, puedes comentar esta línea si prefieres sin notificación)
        console.log(`✅ ${accion} permiso '${nombresCampo[campo]}' para ${permiso.rol_nombre} en ${permiso.nombre_menu}`);
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.error || 'No se pudo actualizar el permiso'}`);
      }
    } catch (err) {
      console.error('Error al actualizar permiso:', err);
      alert('❌ Error al actualizar el permiso. Por favor, intente nuevamente.');
    }
  };

  const eliminarPermiso = async (permiso: RolPermiso) => {
    // Construir descripción de permisos actuales
    const permisosActivos = [];
    if (permiso.puede_ver) permisosActivos.push('Ver');
    if (permiso.puede_crear) permisosActivos.push('Crear');
    if (permiso.puede_editar) permisosActivos.push('Editar');
    if (permiso.puede_eliminar) permisosActivos.push('Eliminar');
    const permisosTexto = permisosActivos.length > 0 ? permisosActivos.join(', ') : 'Ninguno';
    
    const mensaje = `¿Está seguro de eliminar este permiso?\n\n` +
                    `Rol: ${permiso.rol_nombre}\n` +
                    `Módulo: ${permiso.nombre_menu}\n` +
                    `Permisos: ${permisosTexto}\n\n` +
                    `Esta acción se registrará en la bitácora.`;
    
    if (window.confirm(mensaje)) {
      try {
        const response = await fetch(
          `${API_ENDPOINTS.permisos.roles}${permiso.rol}/permisos/${permiso.permiso_modulo}/`,
          {
            method: 'DELETE',
            headers: getAuthHeaders()
          }
        );

        if (response.ok) {
          await cargarDatos();
          alert(`✅ Permiso eliminado exitosamente\n\nSe quitaron todos los permisos de "${permiso.rol_nombre}" para el módulo "${permiso.nombre_menu}"`);
        } else {
          const errorData = await response.json();
          alert(`❌ Error: ${errorData.error || 'No se pudo eliminar el permiso'}`);
        }
      } catch (err) {
        console.error('Error al eliminar permiso:', err);
        alert('❌ Error al eliminar el permiso. Por favor, intente nuevamente.');
      }
    }
  };

  const permisosFiltrados = permisos.filter(
    (p) =>
      p.rol_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.nombre_menu.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.modulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="asignar-permisos">
      <div className="header-permisos">
        <h1>Asignar Permisos a Roles</h1>
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
            placeholder="Buscar por rol o módulo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-search"
          />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="tabla-permisos-container">
        <table className="tabla-permisos">
          <thead>
            <tr>
              <th>Rol</th>
              <th>Módulo</th>
              <th className="text-center">Ver</th>
              <th className="text-center">Crear</th>
              <th className="text-center">Editar</th>
              <th className="text-center">Eliminar</th>
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
              permisosFiltrados.map((permiso, index) => (
                <tr key={`${permiso.rol}-${permiso.permiso_modulo}-${index}`}>
                  <td>
                    <div className="usuario-info">
                      <span className="usuario-nombre">{permiso.rol_nombre}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge-vista">{permiso.nombre_menu}</span>
                  </td>
                  <td className="text-center">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={permiso.puede_ver}
                        onChange={() => togglePermiso(permiso, 'puede_ver')}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td className="text-center">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={permiso.puede_crear}
                        onChange={() => togglePermiso(permiso, 'puede_crear')}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td className="text-center">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={permiso.puede_editar}
                        onChange={() => togglePermiso(permiso, 'puede_editar')}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td className="text-center">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={permiso.puede_eliminar}
                        onChange={() => togglePermiso(permiso, 'puede_eliminar')}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td className="text-center">
                    <button className="btn-eliminar-permiso" onClick={() => eliminarPermiso(permiso)}>
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
        <Modal isOpen={modalAbierto} onClose={cerrarModal} title="Asignar Permiso a Rol">
          <div className="form-asignar-permiso">
            {error && <div className="form-error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="rol">Rol</label>
              <select
                id="rol"
                value={rolSeleccionado || ''}
                onChange={(e) => setRolSeleccionado(Number(e.target.value))}
                className="select-input"
              >
                <option value="">Selecciona un rol</option>
                {roles.filter(r => r.activo).map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre} - {rol.descripcion}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="modulo">Módulo del Sistema</label>
              <select
                id="modulo"
                value={moduloSeleccionado || ''}
                onChange={(e) => setModuloSeleccionado(Number(e.target.value))}
                className="select-input"
              >
                <option value="">Selecciona un módulo</option>
                {modulos.map((modulo) => (
                  <option key={modulo.id} value={modulo.id}>
                    {modulo.nombre_menu}
                  </option>
                ))}
              </select>
            </div>

            <div className="permisos-checks">
              <h4>Permisos CRUD</h4>
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
