import axios from '../api/axiosConfig';

const API_URL = '/api/predicciones';

// Interfaces
export interface PrediccionVentas {
  id: number;
  categoria?: number;
  categoria_nombre?: string;
  fecha_prediccion: string;
  monto_predicho: number;
  modelo_usado: string;
  confianza?: number;
  fecha_creacion: string;
}

export interface PrediccionCreate {
  categoria?: number;
  fecha_prediccion: string;
  monto_predicho: number;
  modelo_usado: string;
  confianza?: number;
}

// Servicios de Predicciones
const prediccionService = {
  // Obtener todas las predicciones
  getAll: async (): Promise<PrediccionVentas[]> => {
    const response = await axios.get(`${API_URL}/predicciones/`);
    return response.data;
  },

  // Obtener predicción por ID
  getById: async (id: number): Promise<PrediccionVentas> => {
    const response = await axios.get(`${API_URL}/predicciones/${id}/`);
    return response.data;
  },

  // Crear nueva predicción
  create: async (prediccion: PrediccionCreate): Promise<PrediccionVentas> => {
    const response = await axios.post(`${API_URL}/predicciones/`, prediccion);
    return response.data;
  },

  // Actualizar predicción
  update: async (id: number, prediccion: Partial<PrediccionCreate>): Promise<PrediccionVentas> => {
    const response = await axios.put(`${API_URL}/predicciones/${id}/`, prediccion);
    return response.data;
  },

  // Eliminar predicción
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/predicciones/${id}/`);
  },

  // Obtener predicciones por categoría
  getPorCategoria: async (categoriaId: number): Promise<PrediccionVentas[]> => {
    const response = await axios.get(`${API_URL}/predicciones/?categoria=${categoriaId}`);
    return response.data;
  },

  // Obtener predicciones recientes
  getRecientes: async (limit: number = 10): Promise<PrediccionVentas[]> => {
    const response = await axios.get(`${API_URL}/predicciones/?limit=${limit}`);
    return response.data;
  },
};

export default prediccionService;
