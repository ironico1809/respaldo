import axios from '../api/axiosConfig';

const API_URL = '/api';

// Interfaces
export interface Notificacion {
  id: number;
  usuario: number;
  usuario_username: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_envio: string;
}

export interface DispositivoUsuario {
  id: number;
  usuario: number;
  usuario_username: string;
  fcm_token: string;
  plataforma?: string;
  ultimo_acceso: string;
}

// Servicios
export const notificacionService = {
  // Obtener todas las notificaciones
  getAll: async (): Promise<Notificacion[]> => {
    const response = await axios.get(`${API_URL}/notificaciones/`);
    return response.data;
  },

  // Obtener notificación por ID
  getById: async (id: number): Promise<Notificacion> => {
    const response = await axios.get(`${API_URL}/notificaciones/${id}/`);
    return response.data;
  },

  // Crear nueva notificación
  create: async (notificacion: Omit<Notificacion, 'id' | 'usuario_username' | 'fecha_envio'>): Promise<Notificacion> => {
    const response = await axios.post(`${API_URL}/notificaciones/`, notificacion);
    return response.data;
  },

  // Actualizar notificación
  update: async (id: number, notificacion: Partial<Notificacion>): Promise<Notificacion> => {
    const response = await axios.put(`${API_URL}/notificaciones/${id}/`, notificacion);
    return response.data;
  },

  // Eliminar notificación
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/notificaciones/${id}/`);
  },

  // Obtener mis notificaciones
  getMisNotificaciones: async (usuarioId: number): Promise<Notificacion[]> => {
    const response = await axios.get(`${API_URL}/notificaciones/mis_notificaciones/?usuario_id=${usuarioId}`);
    return response.data;
  },

  // Obtener notificaciones no leídas
  getNoLeidas: async (usuarioId: number): Promise<Notificacion[]> => {
    const response = await axios.get(`${API_URL}/notificaciones/no_leidas/?usuario_id=${usuarioId}`);
    return response.data;
  },

  // Marcar notificación como leída
  marcarLeida: async (id: number): Promise<Notificacion> => {
    const response = await axios.post(`${API_URL}/notificaciones/${id}/marcar_leida/`);
    return response.data;
  },

  // Marcar todas las notificaciones como leídas
  marcarTodasLeidas: async (usuarioId: number): Promise<void> => {
    await axios.post(`${API_URL}/notificaciones/marcar_todas_leidas/`, { usuario_id: usuarioId });
  },
};

// Servicios de dispositivos
export const dispositivoService = {
  // Obtener todos los dispositivos
  getAll: async (): Promise<DispositivoUsuario[]> => {
    const response = await axios.get(`${API_URL}/dispositivos/`);
    return response.data;
  },

  // Registrar dispositivo
  create: async (dispositivo: Omit<DispositivoUsuario, 'id' | 'usuario_username' | 'ultimo_acceso'>): Promise<DispositivoUsuario> => {
    const response = await axios.post(`${API_URL}/dispositivos/`, dispositivo);
    return response.data;
  },

  // Eliminar dispositivo
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/dispositivos/${id}/`);
  },
};

export default notificacionService;
