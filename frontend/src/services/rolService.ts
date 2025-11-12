import { API_ENDPOINTS, getAuthHeaders, API_BASE_URL } from '../config/api.config';

export const getRoles = async () => {
  const res = await fetch(API_ENDPOINTS.permisos.roles, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('No se pudieron obtener los roles');
  return res.json();
};

export const getRolesDeUsuario = async (usuarioId: number) => {
  const res = await fetch(`${API_BASE_URL}/api/permisos/usuarios/${usuarioId}/roles/`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('No se pudieron obtener los roles del usuario');
  return res.json();
};

export const asignarRolAUsuario = async (usuarioId: number, rolId: number) => {
  const res = await fetch(API_ENDPOINTS.permisos.asignarRol, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ usuario: usuarioId, rol: rolId })
  });
  if (!res.ok) throw new Error('No se pudo asignar el rol');
  return res.json();
};

export const quitarRolAUsuario = async (usuarioId: number, rolId: number) => {
  const res = await fetch(`${API_BASE_URL}/api/permisos/usuarios/${usuarioId}/roles/${rolId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 404) {
      // Si el rol no existe, no es un error crítico
      return { message: 'Rol no encontrado (ya eliminado)' };
    }
    throw new Error(errorData.error || 'No se pudo quitar el rol');
  }
  return res.json();
};
