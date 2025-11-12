import { registrarBitacora } from '../services/bitacoraService';

export const useBitacora = () => {
  const registrar = async (accion: string, descripcion: string) => {
    try {
      // Obtener usuario del localStorage
      const userStr = localStorage.getItem('user');
      const username = userStr ? JSON.parse(userStr).username : 'Anónimo';
      
      // IP se puede obtener del backend en producción
      const ip = '127.0.0.1';
      
      await registrarBitacora({
        username,
        ip,
        fecha_hora: new Date().toISOString(),
        accion,
        descripcion,
      });
    } catch (error) {
      console.error('Error al registrar en bitácora:', error);
    }
  };

  return { registrar };
};

