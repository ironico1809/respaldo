import React, { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import Input from './Input';
import AutocompleteInput from './AutocompleteInput';
import Button from './Button';
import './RegistrarClienteForm.css';
import { crearCliente, actualizarCliente, getClientes } from '../services/clienteService';

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
  const [clientesExistentes, setClientesExistentes] = useState<Cliente[]>([]);

  // Cargar clientes existentes para autocompletado
  useEffect(() => {
    const cargarClientesParaAutocompletado = async () => {
      try {
        const response = await getClientes('activos');
        setClientesExistentes(response.data);
      } catch (err) {
        console.error('Error al cargar clientes para autocompletado:', err);
      }
    };
    cargarClientesParaAutocompletado();
  }, []);

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

    const clienteData = { nombre_completo: nombre, ci, correo, telefono, direccion };

    console.log('Enviando datos del cliente:', clienteData); // Para depuración

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
        <AutocompleteInput
          id="nombre"
          label="Nombre Completo"
          value={nombre}
          onChange={(value) => setNombre(value)}
          options={clientesExistentes.map(c => ({
            value: c.nombre_completo,
            label: c.nombre_completo,
            metadata: c
          }))}
          placeholder="Ingrese el nombre completo"
          required
        />
        <AutocompleteInput
          id="ci"
          label="Cédula de Identidad (CI)"
          value={ci}
          onChange={(value, option) => {
            setCi(value);
            // Si selecciona de autocompletado, llenar los otros campos
            if (option?.metadata) {
              const clienteSeleccionado = option.metadata as Cliente;
              setNombre(clienteSeleccionado.nombre_completo);
              setCorreo(clienteSeleccionado.correo || '');
              setTelefono(clienteSeleccionado.telefono || '');
              setDireccion(clienteSeleccionado.direccion || '');
            }
          }}
          options={clientesExistentes.map(c => ({
            value: c.ci,
            label: `${c.ci} - ${c.nombre_completo}`,
            metadata: c
          }))}
          placeholder="Ingrese el CI"
          required
        />
        <AutocompleteInput
          id="correo"
          label="Correo Electrónico"
          value={correo}
          onChange={(value) => setCorreo(value)}
          type="email"
          options={clientesExistentes
            .filter(c => c.correo)
            .map(c => ({
              value: c.correo!,
              label: `${c.correo} - ${c.nombre_completo}`,
              metadata: c
            }))}
          placeholder="correo@ejemplo.com"
          required
        />
        <AutocompleteInput
          id="telefono"
          label="Teléfono"
          value={telefono}
          onChange={(value) => setTelefono(value)}
          type="tel"
          options={clientesExistentes
            .filter(c => c.telefono)
            .map(c => ({
              value: c.telefono!,
              label: `${c.telefono} - ${c.nombre_completo}`,
              metadata: c
            }))}
          placeholder="Ingrese el teléfono"
        />
        <Input 
          id="direccion" 
          label="Dirección" 
          value={direccion} 
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDireccion(e.target.value)} 
          className="full-width" 
          placeholder="Ingrese la dirección"
        />
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