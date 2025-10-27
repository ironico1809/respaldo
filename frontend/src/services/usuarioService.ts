import apiClient from '../api/axiosConfig';

type GetUsuariosMode = 'activos' | 'todos';

export const getUsuarios = (mode: GetUsuariosMode = 'activos') => {
  const url = mode === 'todos' ? '/usuarios/todos/' : '/usuarios/';
  return apiClient.get(url);
};
export const crearUsuario = (data: any) => apiClient.post('/usuarios/crear/', data);
export const actualizarUsuario = (id: number, data: any) => apiClient.put(`/usuarios/${id}/editar/`, data);
export const eliminarUsuario = (id: number) => apiClient.delete(`/usuarios/${id}/eliminar/`);
