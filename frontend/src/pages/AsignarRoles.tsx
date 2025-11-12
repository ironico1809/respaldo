
import React, { useState, useEffect } from 'react';
import './AsignarRoles.css';
import { getUsuarios } from '../services/usuarioService';
import { getRoles, getRolesDeUsuario, asignarRolAUsuario, quitarRolAUsuario } from '../services/rolService';
import { useBitacora } from '../hooks/useBitacora';

type Usuario = {
  id: number;
  username: string;
  correo: string;
  estado: boolean;
};

type Rol = {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
};

const AsignarRoles: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [rolesUsuario, setRolesUsuario] = useState<{ [usuarioId: number]: number | null }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const { registrar } = useBitacora();

  useEffect(() => {
    // Registrar acceso a la página
    registrar('ACCESO', 'Accedió a Asignar Roles');
    
    const cargar = async () => {
      try {
        setLoading(true);
        setError('');
        const usuariosRes = await getUsuarios('todos');
        setUsuarios(usuariosRes.data);
        const rolesRes = await getRoles();
        setRoles(rolesRes);
        // Cargar roles actuales de cada usuario
        const rolesPorUsuario: { [usuarioId: number]: number | null } = {};
        await Promise.all(
          usuariosRes.data.map(async (u: Usuario) => {
            try {
              const rolesU = await getRolesDeUsuario(u.id);
              // Solo uno permitido, si tiene varios, toma el primero
              // La estructura de rolesU es: [{id, usuario, rol, rol_nombre, ...}]
              rolesPorUsuario[u.id] = rolesU.length > 0 ? rolesU[0].rol : null;
            } catch {
              rolesPorUsuario[u.id] = null;
            }
          })
        );
        setRolesUsuario(rolesPorUsuario);
      } catch (err) {
        setError('No se pudieron cargar los usuarios o roles.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const handleRoleChange = async (userId: number, nuevoRolId: number) => {
    const usuario = usuarios.find(u => u.id === userId);
    const rol = roles.find(r => r.id === nuevoRolId);
    if (!usuario) return;

    const rolActual = rolesUsuario[userId];

    // Si es el mismo rol, no hacer nada
    if (rolActual === nuevoRolId) return;

    // Mensaje de confirmación
    let confirmMessage = '';
    if (nuevoRolId && rolActual) {
      confirmMessage = `¿Cambiar el rol de "${usuario.username}" a "${rol?.nombre}"?`;
    } else if (nuevoRolId && !rolActual) {
      confirmMessage = `¿Asignar el rol "${rol?.nombre}" a "${usuario.username}"?`;
    } else if (!nuevoRolId && rolActual) {
      confirmMessage = `¿Quitar el rol de "${usuario.username}"?`;
    }

    if (window.confirm(confirmMessage)) {
      try {
        setGuardando(true);
        setError('');

        // Obtener TODOS los roles actuales del usuario desde el backend
        let rolesActuales = [];
        try {
          const rolesResponse = await getRolesDeUsuario(userId);
          rolesActuales = rolesResponse || [];
          console.log('Roles actuales del usuario:', rolesActuales);
        } catch (err) {
          console.warn('No se pudieron obtener los roles actuales', err);
        }

        // Quitar TODOS los roles existentes
        for (const rolExistente of rolesActuales) {
          try {
            // rolExistente tiene la estructura: {id, usuario, rol, rol_nombre, ...}
            const rolId = rolExistente.rol; // Este es el ID del rol
            if (rolId && rolId !== undefined && rolId !== null) {
              await quitarRolAUsuario(userId, rolId);
              console.log(`Rol ${rolId} eliminado`);
            }
          } catch (err: any) {
            console.warn(`Error al quitar rol:`, err);
          }
        }

        // Esperar un momento para asegurar que el backend procese las eliminaciones
        if (rolesActuales.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }

        // Si el nuevo rol no es vacío, asignarlo
        if (nuevoRolId) {
          await asignarRolAUsuario(userId, nuevoRolId);
          setRolesUsuario(prev => ({ ...prev, [userId]: nuevoRolId }));
          
          // Registrar en bitácora
          await registrar('ASIGNAR_ROL', `Asignó rol ${rol?.nombre} al usuario ${usuario.username}`);
        } else {
          setRolesUsuario(prev => ({ ...prev, [userId]: null }));
          
          // Registrar en bitácora
          await registrar('QUITAR_ROL', `Quitó rol del usuario ${usuario.username}`);
        }
      } catch (err: any) {
        console.error(err);
        setError(`Error al cambiar el rol: ${err.message || 'Error desconocido'}`);
        // Revertir el cambio en la UI
        setRolesUsuario(prev => ({ ...prev, [userId]: rolActual }));
      } finally {
        setGuardando(false);
      }
    }
  };

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase())
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
            placeholder="Buscar por username o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        {loading && <p>Cargando usuarios y roles...</p>}
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
                      value={rolesUsuario[u.id] || ''}
                      disabled={guardando}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleRoleChange(u.id, value ? Number(value) : 0);
                      }}
                    >
                      <option value="">Sin rol</option>
                      {roles.filter(r => r.activo).map((rol) => (
                        <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                      ))}
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