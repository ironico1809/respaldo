import axios from '../api/axiosConfig';

const API_URL = '/api/productos';

// Interfaces
export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: string;
}

export interface Producto {
  id: number;
  categoria?: number;
  categoria_nombre?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  stock_minimo: number;
  imagen_url?: string;
  estado: string;
  fecha_creacion: string;
  es_critico: boolean;
}

export interface MovimientoInventario {
  id: number;
  producto: number;
  producto_nombre: string;
  tipo_movimiento: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  fecha_movimiento: string;
  usuario_responsable?: number;
  usuario_username?: string;
  motivo?: string;
}

// Servicios de Categorías
export const categoriaService = {
  // Obtener todas las categorías
  getAll: async (): Promise<Categoria[]> => {
    const response = await axios.get(`${API_URL}/categorias/`);
    return response.data;
  },

  // Obtener categoría por ID
  getById: async (id: number): Promise<Categoria> => {
    const response = await axios.get(`${API_URL}/categorias/${id}/`);
    return response.data;
  },

  // Crear nueva categoría
  create: async (categoria: Omit<Categoria, 'id'>): Promise<Categoria> => {
    const response = await axios.post(`${API_URL}/categorias/`, categoria);
    return response.data;
  },

  // Actualizar categoría
  update: async (id: number, categoria: Partial<Categoria>): Promise<Categoria> => {
    const response = await axios.put(`${API_URL}/categorias/${id}/`, categoria);
    return response.data;
  },

  // Eliminar categoría
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/categorias/${id}/`);
  },
};

// Servicios de Productos
export const productoService = {
  // Obtener todos los productos
  getAll: async (): Promise<Producto[]> => {
    const response = await axios.get(`${API_URL}/productos/`);
    return response.data;
  },

  // Obtener producto por ID
  getById: async (id: number): Promise<Producto> => {
    const response = await axios.get(`${API_URL}/productos/${id}/`);
    return response.data;
  },

  // Crear nuevo producto
  create: async (producto: Omit<Producto, 'id' | 'categoria_nombre' | 'fecha_creacion' | 'es_critico'>): Promise<Producto> => {
    const response = await axios.post(`${API_URL}/productos/`, producto);
    return response.data;
  },

  // Actualizar producto
  update: async (id: number, producto: Partial<Producto>): Promise<Producto> => {
    const response = await axios.put(`${API_URL}/productos/${id}/`, producto);
    return response.data;
  },

  // Eliminar producto
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/productos/${id}/`);
  },

  // Obtener productos con inventario crítico
  getInventarioCritico: async (): Promise<Producto[]> => {
    const response = await axios.get(`${API_URL}/productos/inventario_critico/`);
    return response.data;
  },

  // Obtener productos activos
  getActivos: async (): Promise<Producto[]> => {
    const response = await axios.get(`${API_URL}/productos/activos/`);
    return response.data;
  },

  // Ajustar stock de un producto
  ajustarStock: async (
    id: number,
    cantidad: number,
    tipoMovimiento: 'entrada' | 'salida' | 'ajuste',
    motivo: string,
    usuarioId: number
  ): Promise<Producto> => {
    const response = await axios.post(`${API_URL}/productos/${id}/ajustar_stock/`, {
      cantidad,
      tipo_movimiento: tipoMovimiento,
      motivo,
      usuario_id: usuarioId,
    });
    return response.data;
  },
};

// Servicios de Movimientos de Inventario
export const movimientoService = {
  // Obtener todos los movimientos
  getAll: async (): Promise<MovimientoInventario[]> => {
    const response = await axios.get(`${API_URL}/movimientos/`);
    return response.data;
  },

  // Obtener movimiento por ID
  getById: async (id: number): Promise<MovimientoInventario> => {
    const response = await axios.get(`${API_URL}/movimientos/${id}/`);
    return response.data;
  },

  // Obtener movimientos por producto
  getPorProducto: async (productoId: number): Promise<MovimientoInventario[]> => {
    const response = await axios.get(`${API_URL}/movimientos/por_producto/?producto_id=${productoId}`);
    return response.data;
  },
};

export default { categoriaService, productoService, movimientoService };
