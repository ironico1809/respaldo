import axios from '../api/axiosConfig';

const API_URL = '/api';

// Interfaces
export interface Carrito {
  id: number;
  usuario: number;
  usuario_username: string;
  fecha_actualizacion: string;
  items: CarritoItem[];
  total: number;
}

export interface CarritoItem {
  id: number;
  carrito: number;
  producto: number;
  producto_nombre: string;
  producto_precio: number;
  producto_imagen?: string;
  cantidad: number;
  subtotal: number;
}

// Servicios
export const carritoService = {
  // Obtener todos los carritos
  getAll: async (): Promise<Carrito[]> => {
    const response = await axios.get(`${API_URL}/carritos/`);
    return response.data;
  },

  // Obtener carrito por ID
  getById: async (id: number): Promise<Carrito> => {
    const response = await axios.get(`${API_URL}/carritos/${id}/`);
    return response.data;
  },

  // Obtener mi carrito
  getMiCarrito: async (usuarioId: number): Promise<Carrito> => {
    const response = await axios.get(`${API_URL}/carritos/mi_carrito/?usuario_id=${usuarioId}`);
    return response.data;
  },

  // Agregar item al carrito
  agregarItem: async (carritoId: number, productoId: number, cantidad: number): Promise<Carrito> => {
    const response = await axios.post(`${API_URL}/carritos/${carritoId}/agregar_item/`, {
      producto_id: productoId,
      cantidad: cantidad,
    });
    return response.data;
  },

  // Actualizar cantidad de un item
  actualizarCantidad: async (carritoId: number, itemId: number, cantidad: number): Promise<Carrito> => {
    const response = await axios.post(`${API_URL}/carritos/${carritoId}/actualizar_cantidad/`, {
      item_id: itemId,
      cantidad: cantidad,
    });
    return response.data;
  },

  // Eliminar item del carrito
  eliminarItem: async (carritoId: number, itemId: number): Promise<Carrito> => {
    const response = await axios.post(`${API_URL}/carritos/${carritoId}/eliminar_item/`, {
      item_id: itemId,
    });
    return response.data;
  },

  // Vaciar carrito
  vaciar: async (carritoId: number): Promise<Carrito> => {
    const response = await axios.post(`${API_URL}/carritos/${carritoId}/vaciar/`);
    return response.data;
  },
};

export default carritoService;
