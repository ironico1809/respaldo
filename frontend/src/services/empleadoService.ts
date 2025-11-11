import axios from '../api/axiosConfig';

const API_URL = '/api/empleados';

// Interfaces
export interface Empleado {
  id: number;
  usuario?: number;
  usuario_username?: string;
  usuario_email?: string;
  nombre: string;
  apellido: string;
  cargo: string;
  departamento?: string;
  fecha_contratacion: string;
  salario?: number;
  telefono?: string;
  direccion?: string;
  estado: string;
  fecha_registro: string;
}

export interface EmpleadoCreate {
  usuario?: number;
  nombre: string;
  apellido: string;
  cargo: string;
  departamento?: string;
  fecha_contratacion: string;
  salario?: number;
  telefono?: string;
  direccion?: string;
  estado: string;
}

// Servicios de Empleados
const empleadoService = {
  // Obtener todos los empleados
  getAll: async (): Promise<Empleado[]> => {
    const response = await axios.get(`${API_URL}/empleados/`);
    return response.data;
  },

  // Obtener empleado por ID
  getById: async (id: number): Promise<Empleado> => {
    const response = await axios.get(`${API_URL}/empleados/${id}/`);
    return response.data;
  },

  // Crear nuevo empleado
  create: async (empleado: EmpleadoCreate): Promise<Empleado> => {
    const response = await axios.post(`${API_URL}/empleados/`, empleado);
    return response.data;
  },

  // Actualizar empleado
  update: async (id: number, empleado: Partial<EmpleadoCreate>): Promise<Empleado> => {
    const response = await axios.put(`${API_URL}/empleados/${id}/`, empleado);
    return response.data;
  },

  // Eliminar empleado
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/empleados/${id}/`);
  },

  // Obtener empleados activos
  getActivos: async (): Promise<Empleado[]> => {
    const response = await axios.get(`${API_URL}/empleados/?estado=activo`);
    return response.data;
  },

  // Obtener empleados por departamento
  getPorDepartamento: async (departamento: string): Promise<Empleado[]> => {
    const response = await axios.get(`${API_URL}/empleados/?departamento=${departamento}`);
    return response.data;
  },

  // Obtener empleados por cargo
  getPorCargo: async (cargo: string): Promise<Empleado[]> => {
    const response = await axios.get(`${API_URL}/empleados/?cargo=${cargo}`);
    return response.data;
  },

  // Buscar empleados
  buscar: async (query: string): Promise<Empleado[]> => {
    const response = await axios.get(`${API_URL}/empleados/?search=${query}`);
    return response.data;
  },
};

export default empleadoService;
