import apiClient from '../api/axiosConfig';

type GetClientesMode = 'activos' | 'todos';

export const getClientes = (mode: GetClientesMode = 'activos') => {
  const url = mode === 'todos' ? '/clientes/todos/' : '/clientes/';
  return apiClient.get(url);
};
export const crearCliente = (data: any) => apiClient.post('/clientes/crear/', data);
export const actualizarCliente = (id: number, data: any) => apiClient.put(`/clientes/${id}/actualizar/`, data);
export const eliminarCliente = (id: number) => apiClient.delete(`/clientes/${id}/eliminar/`);
export const restaurarCliente = (id: number) => apiClient.post(`/clientes/${id}/restaurar/`);
