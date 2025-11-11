import axios from '../api/axiosConfig';

const API_URL = '/api/permisos';

// Interfaces
export interface Permiso {
  id: number;
  usuario: number;
  usuario_username?: string;
  usuario_nombre?: string;
  vista: string;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
  puede_ver: boolean;
  fecha_asignacion: string;
}

export interface PermisoCreate {
  usuario: number;
  vista: string;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
  puede_ver: boolean;
}

export interface PermisoUpdate {
  puede_crear?: boolean;
  puede_editar?: boolean;
  puede_eliminar?: boolean;
  puede_ver?: boolean;
}

// Servicios de Permisos
const permisoService = {
  // Obtener todos los permisos
  getAll: async (): Promise<Permiso[]> => {
    const response = await axios.get(`${API_URL}/permisos/`);
    return response.data;
  },

  // Obtener permiso por ID
  getById: async (id: number): Promise<Permiso> => {
    const response = await axios.get(`${API_URL}/permisos/${id}/`);
    return response.data;
  },

  // Crear nuevo permiso
  create: async (permiso: PermisoCreate): Promise<Permiso> => {
    const response = await axios.post(`${API_URL}/permisos/`, permiso);
    return response.data;
  },

  // Actualizar permiso
  update: async (id: number, permiso: PermisoUpdate): Promise<Permiso> => {
    const response = await axios.put(`${API_URL}/permisos/${id}/`, permiso);
    return response.data;
  },

  // Eliminar permiso
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/permisos/${id}/`);
  },

  // Obtener permisos de un usuario
  getPorUsuario: async (usuarioId: number): Promise<Permiso[]> => {
    const response = await axios.get(`${API_URL}/permisos/por_usuario/?usuario_id=${usuarioId}`);
    return response.data;
  },

  // Obtener permisos de un usuario para una vista específica
  getPorUsuarioVista: async (usuarioId: number, vista: string): Promise<Permiso | null> => {
    const response = await axios.get(`${API_URL}/permisos/por_usuario/?usuario_id=${usuarioId}&vista=${vista}`);
    return response.data.length > 0 ? response.data[0] : null;
  },

  // Verificar si un usuario tiene un permiso específico
  verificarPermiso: async (
    usuarioId: number,
    vista: string,
    accion: 'crear' | 'editar' | 'eliminar' | 'ver'
  ): Promise<boolean> => {
    const permiso = await permisoService.getPorUsuarioVista(usuarioId, vista);
    if (!permiso) return false;

    switch (accion) {
      case 'crear':
        return permiso.puede_crear;
      case 'editar':
        return permiso.puede_editar;
      case 'eliminar':
        return permiso.puede_eliminar;
      case 'ver':
        return permiso.puede_ver;
      default:
        return false;
    }
  },

  // Actualizar permisos de un usuario para una vista
  actualizarPermisos: async (
    usuarioId: number,
    vista: string,
    permisos: PermisoUpdate
  ): Promise<Permiso> => {
    // Primero buscar si existe el permiso
    const permisoExistente = await permisoService.getPorUsuarioVista(usuarioId, vista);
    
    if (permisoExistente) {
      // Si existe, actualizar
      return await permisoService.update(permisoExistente.id, permisos);
    } else {
      // Si no existe, crear nuevo
      const nuevoPermiso: PermisoCreate = {
        usuario: usuarioId,
        vista,
        puede_crear: permisos.puede_crear ?? false,
        puede_editar: permisos.puede_editar ?? false,
        puede_eliminar: permisos.puede_eliminar ?? false,
        puede_ver: permisos.puede_ver ?? false,
      };
      return await permisoService.create(nuevoPermiso);
    }
  },
};

export default permisoService;
