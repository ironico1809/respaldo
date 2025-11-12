import axios from '../api/axiosConfig';

const API_URL = '';  // baseURL ya tiene /api

// Interfaces
export interface Venta {
  id: number;
  cliente: number;
  cliente_nombre: string;
  vendedor?: number;
  vendedor_nombre?: string;
  fecha_venta: string;
  monto_total: number;
  metodo_pago: string;
  referencia_pago?: string;
  estado: string;
  detalles: VentaDetalle[];
}

export interface VentaDetalle {
  id: number;
  venta: number;
  producto: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface VentaCreate {
  cliente_id: number;
  vendedor_id?: number;
  metodo_pago: string;
  referencia_pago?: string;
  detalles: {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }[];
}

export interface MetodoPago {
  value: string;
  label: string;
  icon: string;
}

// Servicios
export const ventaService = {
  // Obtener todas las ventas
  getAll: async (): Promise<Venta[]> => {
    const response = await axios.get(`${API_URL}/ventas/`);
    return response.data;
  },

  // Obtener venta por ID
  getById: async (id: number): Promise<Venta> => {
    const response = await axios.get(`${API_URL}/ventas/${id}/`);
    return response.data;
  },

  // Crear nueva venta
  create: async (venta: VentaCreate): Promise<Venta> => {
    const response = await axios.post(`${API_URL}/ventas/`, venta);
    return response.data;
  },

  // Actualizar venta
  update: async (id: number, venta: Partial<Venta>): Promise<Venta> => {
    const response = await axios.put(`${API_URL}/ventas/${id}/`, venta);
    return response.data;
  },

  // Eliminar venta
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/ventas/${id}/`);
  },

  // Obtener estadísticas de ventas
  getEstadisticas: async () => {
    const response = await axios.get(`${API_URL}/ventas/estadisticas/`);
    return response.data;
  },

  // Obtener últimas ventas
  getUltimas: async (limit: number = 10): Promise<Venta[]> => {
    const response = await axios.get(`${API_URL}/ventas/ultimas/?limit=${limit}`);
    return response.data;
  },

  // Obtener métodos de pago disponibles
  getMetodosPago: async (): Promise<MetodoPago[]> => {
    const response = await axios.get(`${API_URL}/ventas/metodos_pago/`);
    return response.data.metodos;
  },
};

export default ventaService;
