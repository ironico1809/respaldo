import apiClient from '../api/axiosConfig';

interface User {
  id: number;
  username: string;
  correo: string;
  tipo_usuario: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/usuarios/login/', {
      username,
      password,
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    // Primero, notifica al backend que el usuario está cerrando sesión.
    await apiClient.post('/usuarios/logout/');
  } finally {
    // Después, sin importar si la llamada falló, limpia los datos locales.
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
