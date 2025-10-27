import apiClient from '../api/axiosConfig';

export const getBitacora = () => apiClient.get('/bitacora/');
