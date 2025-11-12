import apiClient from '../api/axiosConfig';

export const getBitacora = () => apiClient.get('/bitacora/');

export const registrarBitacora = (data: {
  username: string;
  ip: string;
  fecha_hora: string;
  accion: string;
  descripcion: string;
}) => apiClient.post('/bitacora/registrar/', data);
