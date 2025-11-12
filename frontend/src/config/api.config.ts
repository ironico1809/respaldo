/**
 * Configuración centralizada de la API
 * 
 * Para desarrollo local: usa http://localhost:8000
 * Para producción en AWS: cambia API_BASE_URL a tu URL de AWS
 * 
 * Ejemplo para AWS:
 * export const API_BASE_URL = 'https://api.tudominio.com';
 * 
 * O usa variables de entorno:
 * export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
 */

// Cambia esta URL cuando subas a AWS
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Endpoints de la API
export const API_ENDPOINTS = {
  // Autenticación y Usuarios
  auth: {
    login: `${API_BASE_URL}/api/usuarios/login/`,
    register: `${API_BASE_URL}/api/usuarios/register/`,
    logout: `${API_BASE_URL}/api/usuarios/logout/`,
  },
  
  // Productos
  productos: {
    list: `${API_BASE_URL}/api/productos/`,
    detail: (id: number) => `${API_BASE_URL}/api/productos/${id}/`,
    categorias: `${API_BASE_URL}/api/productos/categorias/`,
    movimientos: `${API_BASE_URL}/api/productos/movimientos/`,
  },
  
  // Carrito
  carrito: {
    miCarrito: (usuarioId: number) => `${API_BASE_URL}/api/carritos/mi_carrito/?usuario_id=${usuarioId}`,
    agregarItem: `${API_BASE_URL}/api/carritos/agregar_item/`,
    actualizarCantidad: `${API_BASE_URL}/api/carritos/actualizar_cantidad/`,
    eliminarItem: `${API_BASE_URL}/api/carritos/eliminar_item/`,
    vaciar: `${API_BASE_URL}/api/carritos/vaciar/`,
  },
  
  // Ventas
  ventas: {
    list: `${API_BASE_URL}/api/ventas/`,
    crearDesdeCarrito: `${API_BASE_URL}/api/ventas/crear_desde_carrito/`,
    metodosPago: `${API_BASE_URL}/api/ventas/metodos_pago/`,
  },
  
  // Pagos (Stripe)
  pagos: {
    createCheckoutSession: `${API_BASE_URL}/api/pagos/create-checkout-session/`,
    verifyCheckoutSession: (sessionId: string) => `${API_BASE_URL}/api/pagos/verify-checkout-session/?session_id=${sessionId}`,
  },
  
  // Predicciones
  predicciones: {
    dashboard: `${API_BASE_URL}/api/predicciones/dashboard/`,
    entrenarModelo: `${API_BASE_URL}/api/predicciones/predicciones/entrenar_modelo/`,
  },
  
  // Reportes
  reportes: {
    generarPDF: `${API_BASE_URL}/api/reportes/generar_pdf/`,
  },
  
  // Clientes
  clientes: {
    list: `${API_BASE_URL}/api/clientes/`,
    detail: (id: number) => `${API_BASE_URL}/api/clientes/${id}/`,
  },
  
  // Usuarios
  usuarios: {
    list: `${API_BASE_URL}/api/usuarios/`,
    detail: (id: number) => `${API_BASE_URL}/api/usuarios/${id}/`,
  },
  
  // Roles y Permisos
  permisos: {
    misPermisos: `${API_BASE_URL}/api/permisos/mis-permisos/`,
    roles: `${API_BASE_URL}/api/permisos/roles/`,
    asignarRol: `${API_BASE_URL}/api/permisos/usuarios/asignar-rol/`,
    asignarPermiso: `${API_BASE_URL}/api/permisos/roles/asignar-permiso/`,
    modulos: `${API_BASE_URL}/api/permisos/modulos/`,
    // Permisos antiguos (para compatibilidad)
    listar: `${API_BASE_URL}/api/permisos/listar/`,
    crear: `${API_BASE_URL}/api/permisos/crear/`,
    actualizar: (id: number) => `${API_BASE_URL}/api/permisos/${id}/actualizar/`,
    eliminar: (id: number) => `${API_BASE_URL}/api/permisos/${id}/eliminar/`,
  },
  
  // Bitácora
  bitacora: {
    list: `${API_BASE_URL}/api/bitacora/`,
  },
  
  // Notificaciones
  notificaciones: {
    list: `${API_BASE_URL}/api/notificaciones/`,
    detail: (id: number) => `${API_BASE_URL}/api/notificaciones/${id}/`,
  },
};

// Headers por defecto para las peticiones
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Función helper para hacer peticiones
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response;
};
