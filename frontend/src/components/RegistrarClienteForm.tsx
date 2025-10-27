import React, { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import Input from './Input';
import Button from './Button';
import './RegistrarClienteForm.css';
import { crearCliente, actualizarCliente } from '../services/clienteService';

type Cliente = {
  id: number;
  nombre_completo: string;
  ci: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  estado: boolean;
};

interface RegistrarClienteFormProps {
  cliente: Cliente | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const RegistrarClienteForm: React.FC<RegistrarClienteFormProps> = ({ cliente, onSuccess, onCancel }) => {
  const [nombre, setNombre] = useState('');
  const [ci, setCi] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cliente) {
      setNombre(cliente.nombre_completo);
      setCi(cliente.ci);
      setCorreo(cliente.correo || '');
      setTelefono(cliente.telefono || '');
      setDireccion(cliente.direccion || '');
    } else {
      // Resetear para un nuevo cliente
      setNombre('');
      setCi('');
      setCorreo('');
      setTelefono('');
      setDireccion('');
      setError('');
    }
  }, [cliente]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!nombre || !ci) {
      setError('Nombre y CI son campos obligatorios.');
      setLoading(false);
      return;
    }

    const clienteData = { nombre, ci, correo, telefono, direccion };

    try {
      if (cliente) {
        await actualizarCliente(cliente.id, clienteData);
      } else {
        await crearCliente(clienteData);
      }
      onSuccess();
    } catch (err: any) {
      if (err.response && err.response.data) {
        const apiErrors = Object.values(err.response.data).flat().join(' ');
        setError(apiErrors || 'Ocurrió un error al guardar el cliente.');
      } else {
        setError('Ocurrió un error de conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="registrar-cliente-form">
      {error && <p className="form-error-message">{error}</p>}
      <div className="form-grid">
        <Input id="nombre" label="Nombre Completo" value={nombre} onChange={(e: ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)} />
        <Input id="ci" label="Cédula de Identidad (CI)" value={ci} onChange={(e: ChangeEvent<HTMLInputElement>) => setCi(e.target.value)} />
        <Input id="correo" label="Correo Electrónico" type="email" value={correo} onChange={(e: ChangeEvent<HTMLInputElement>) => setCorreo(e.target.value)} />
        <Input id="telefono" label="Teléfono" type="tel" value={telefono} onChange={(e: ChangeEvent<HTMLInputElement>) => setTelefono(e.target.value)} />
        <Input id="direccion" label="Dirección" value={direccion} onChange={(e: ChangeEvent<HTMLInputElement>) => setDireccion(e.target.value)} className="full-width" />
      </div>
      <div className="form-actions">
        <Button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="btn-primary" disabled={loading}>
          {cliente ? 'Guardar Cambios' : 'Registrar Cliente'}
        </Button>
      </div>
    </form>
  );
};

export default RegistrarClienteForm;