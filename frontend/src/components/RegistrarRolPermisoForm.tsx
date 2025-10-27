import React, { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import Input from './Input';
import Button from './Button';
import './RegistrarRolPermisoForm.css';

type Permiso = {
  id: number;
  nombre: string;
  descripcion: string;
};

type Rol = {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: Permiso['id'][];
  estado: 'Activo' | 'Inactivo';
};

interface RegistrarRolPermisoFormProps {
  rol: Rol | null;
  permisosDisponibles: Permiso[];
  onSuccess: () => void;
  onCancel: () => void;
}

const RegistrarRolPermisoForm: React.FC<RegistrarRolPermisoFormProps> = ({ rol, permisosDisponibles, onSuccess, onCancel }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<Permiso['id'][]>([]);
  const [estado, setEstado] = useState<'Activo' | 'Inactivo'>('Activo');
  const [error, setError] = useState('');

  useEffect(() => {
    if (rol) {
      setNombre(rol.nombre);
      setDescripcion(rol.descripcion);
      setPermisosSeleccionados(rol.permisos);
      setEstado(rol.estado);
    } else {
      // Resetear para un nuevo rol
      setNombre('');
      setDescripcion('');
      setPermisosSeleccionados([]);
      setEstado('Activo');
      setError('');
    }
  }, [rol]);

  const handlePermisoChange = (permisoId: number) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(permisoId) ? prev.filter((id) => id !== permisoId) : [...prev, permisoId]
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!nombre || !descripcion) {
      setError('Nombre y Descripción son campos obligatorios.');
      return;
    }

    if (rol) {
      // Lógica para llamar a la API y ACTUALIZAR el rol
      console.log('Actualizando rol:', { id: rol.id, nombre, descripcion, permisos: permisosSeleccionados, estado });
    } else {
      // Lógica para llamar a la API y REGISTRAR el rol
      console.log('Registrando rol:', { nombre, descripcion, permisos: permisosSeleccionados, estado });
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="registrar-rol-permiso-form">
      {error && <p className="form-error-message">{error}</p>}
      <div className="form-grid">
        <Input id="nombre" label="Nombre del Rol" value={nombre} onChange={(e: ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)} />
        <Input id="descripcion" label="Descripción" value={descripcion} onChange={(e: ChangeEvent<HTMLInputElement>) => setDescripcion(e.target.value)} />
        
        <div className="form-group">
          <label htmlFor="estado">Estado</label>
          <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value as 'Activo' | 'Inactivo')} className="form-select">
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        <div className="form-group form-group-checkboxes">
          <label>Permisos</label>
          {permisosDisponibles.map((permiso) => (
            <div key={permiso.id} className="checkbox-item">
              <input type="checkbox" id={`permiso-${permiso.id}`} checked={permisosSeleccionados.includes(permiso.id)} onChange={() => handlePermisoChange(permiso.id)} />
              <label htmlFor={`permiso-${permiso.id}`}>{permiso.nombre}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="form-actions">
        <Button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="btn-primary">{rol ? 'Guardar Cambios' : 'Registrar Rol'}</Button>
      </div>
    </form>
  );
};

export default RegistrarRolPermisoForm;