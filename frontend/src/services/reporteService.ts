import axios from '../api/axiosConfig';

const API_URL = '/api';

// Interfaces
export interface ReporteLog {
  id: number;
  usuario: number;
  usuario_username: string;
  prompt_original?: string;
  tipo_archivo: 'PDF' | 'EXCEL';
  fecha_generacion: string;
  archivo_url?: string;
}

// Servicios
export const reporteService = {
  // Obtener todos los reportes
  getAll: async (): Promise<ReporteLog[]> => {
    const response = await axios.get(`${API_URL}/reportes/`);
    return response.data;
  },

  // Obtener reporte por ID
  getById: async (id: number): Promise<ReporteLog> => {
    const response = await axios.get(`${API_URL}/reportes/${id}/`);
    return response.data;
  },

  // Crear nuevo reporte
  create: async (reporte: Omit<ReporteLog, 'id' | 'usuario_username' | 'fecha_generacion'>): Promise<ReporteLog> => {
    const response = await axios.post(`${API_URL}/reportes/`, reporte);
    return response.data;
  },

  // Eliminar reporte
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/reportes/${id}/`);
  },

  // Obtener mis reportes
  getMisReportes: async (usuarioId: number): Promise<ReporteLog[]> => {
    const response = await axios.get(`${API_URL}/reportes/mis_reportes/?usuario_id=${usuarioId}`);
    return response.data;
  },

  // Generar reporte
  generar: async (reporte: Omit<ReporteLog, 'id' | 'usuario_username' | 'fecha_generacion'>): Promise<ReporteLog> => {
    const response = await axios.post(`${API_URL}/reportes/generar/`, reporte);
    return response.data;
  },
};

export default reporteService;
