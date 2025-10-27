import React, { useState, useEffect, useCallback } from 'react';
import './GestionarClientes.css';
import Modal from '../components/Modal';
import RegistrarClienteForm from '../components/RegistrarClienteForm';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import { getClientes, eliminarCliente, restaurarCliente } from '../services/clienteService';

type Cliente = {
  id: number;
  nombre_completo: string;
  ci: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  fecha_registro: string;
  estado: boolean;
};

const GestionarClientes: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteAEditar, setClienteAEditar] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getClientes('todos');
      setClientes(response.data);
      setClientesFiltrados(response.data);
    } catch (err) {
      setError('No se pudieron cargar los clientes. Inténtalo de nuevo más tarde.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  const handleBuscar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const termino = e.target.value.toLowerCase();
    setBusqueda(termino);
    setClientesFiltrados(
      clientes.filter(
        (c) =>
          c.nombre_completo.toLowerCase().includes(termino) ||
          c.ci.toLowerCase().includes(termino) ||
          (c.telefono && c.telefono.includes(termino))
      )
    );
  };

  const handleNuevoCliente = () => {
    setClienteAEditar(null);
    setIsModalOpen(true);
  };

  const handleEditarCliente = (cliente: Cliente) => {
    setClienteAEditar(cliente);
    setIsModalOpen(true);
  };

  const handleToggleEstadoCliente = async (cliente: Cliente) => {
    const confirmMessage = cliente.estado
  ? `¿Estás seguro de que deseas desactivar al cliente "${cliente.nombre_completo}"?`
  : `¿Estás seguro de que deseas restaurar al cliente "${cliente.nombre_completo}"?`;

    if (window.confirm(confirmMessage)) {
      try {
        if (cliente.estado) {
          await eliminarCliente(cliente.id);
        } else {
          await restaurarCliente(cliente.id);
        }
        cargarClientes();
      } catch (err) {
  setError(`No se pudo cambiar el estado del cliente ${cliente.nombre_completo}.`);
        console.error(err);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setClienteAEditar(null);
  };

  const handleClienteGuardado = () => {
    cargarClientes();
    handleCloseModal();
  };

  return (
    <div className="gestionar-clientes-container">
      <button className="btn btn-primary btn-nuevo" onClick={handleNuevoCliente}>+ Nuevo Cliente</button>
      <div className="clientes-card">
        <div className="clientes-card-header">
          <span className="clientes-card-title">Lista de Clientes</span>
          <span className="clientes-card-count">{clientesFiltrados.length} clientes</span>
          <input
            className="clientes-buscar"
            type="text"
            placeholder="Buscar por nombre, CI o teléfono..."
            value={busqueda}
            onChange={handleBuscar}
          />
        </div>
        {loading && <p>Cargando clientes...</p>}
        {error && <p className="form-error-message">{error}</p>}
        <div className="clientes-table-container">
          <table className="clientes-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>CI</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Fecha Registro</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td><b>{c.nombre_completo}</b></td>
                  <td>{c.ci}</td>
                  <td>{c.telefono || '-'}</td>
                  <td>{c.direccion || '-'}</td>
                  <td>{new Date(c.fecha_registro).toLocaleDateString()}</td>
                  <td>
                    <span className={`clientes-estado ${c.estado ? 'activo' : 'inactivo'}`}>{c.estado ? 'Activo' : 'Inactivo'}</span>
                  </td>
                  <td className="clientes-acciones">
                    <EditButton onClick={() => handleEditarCliente(c)} />
                    <DeleteButton onClick={() => handleToggleEstadoCliente(c)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={clienteAEditar ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
      >
        <RegistrarClienteForm
          cliente={clienteAEditar}
          onSuccess={handleClienteGuardado}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default GestionarClientes;