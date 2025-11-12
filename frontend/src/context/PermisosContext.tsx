import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { API_ENDPOINTS } from '../config/api.config';

interface Permiso {
  modulo: string;
  nombre_menu: string;
  ruta: string;
  icono: string;
  puede_ver: boolean;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
}

interface PermisosContextType {
  permisos: Permiso[];
  loading: boolean;
  tienePermiso: (modulo: string) => boolean;
  puedeCrear: (modulo: string) => boolean;
  puedeEditar: (modulo: string) => boolean;
  puedeEliminar: (modulo: string) => boolean;
  recargarPermisos: () => Promise<void>;
}

const PermisosContext = createContext<PermisosContextType | undefined>(undefined);

export const usePermisos = () => {
  const context = useContext(PermisosContext);
  if (!context) {
    throw new Error('usePermisos debe usarse dentro de un PermisosProvider');
  }
  return context;
};

interface PermisosProviderProps {
  children: ReactNode;
}

export const PermisosProvider: React.FC<PermisosProviderProps> = ({ children }) => {
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarPermisos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No hay token en localStorage');
        setPermisos([]);
        setLoading(false);
        return;
      }

      console.log('🔄 Cargando permisos desde:', API_ENDPOINTS.permisos.misPermisos);
      const response = await fetch(API_ENDPOINTS.permisos.misPermisos, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Datos recibidos:', data);
        console.log('📦 Módulos:', data.modulos);
        setPermisos(data.modulos || []);
      } else {
        console.error('❌ Error en respuesta:', response.status);
        const errorText = await response.text();
        console.error('Error detalle:', errorText);
        setPermisos([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar permisos:', error);
      setPermisos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPermisos();
  }, []);

  const tienePermiso = (modulo: string): boolean => {
    const tiene = permisos.some(p => p.modulo === modulo && p.puede_ver);
    console.log(`🔍 tienePermiso('${modulo}'):`, tiene, '| Total permisos:', permisos.length);
    return tiene;
  };

  const puedeCrear = (modulo: string): boolean => {
    const permiso = permisos.find(p => p.modulo === modulo);
    return permiso?.puede_crear || false;
  };

  const puedeEditar = (modulo: string): boolean => {
    const permiso = permisos.find(p => p.modulo === modulo);
    return permiso?.puede_editar || false;
  };

  const puedeEliminar = (modulo: string): boolean => {
    const permiso = permisos.find(p => p.modulo === modulo);
    return permiso?.puede_eliminar || false;
  };

  const recargarPermisos = async () => {
    setLoading(true);
    await cargarPermisos();
  };

  return (
    <PermisosContext.Provider
      value={{
        permisos,
        loading,
        tienePermiso,
        puedeCrear,
        puedeEditar,
        puedeEliminar,
        recargarPermisos,
      }}
    >
      {children}
    </PermisosContext.Provider>
  );
};
