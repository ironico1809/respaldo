import React, { useState } from 'react';
import './GestionarVentas.css';
import Button from '../components/Button';
import ViewDetailsButton from '../components/ViewDetailsButton';
import Modal from '../components/Modal';
import RegistrarVentaForm from '../components/RegistrarVentaForm';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import FacturaModal from '../components/FacturaModal';
import type { Venta } from '../components/FacturaModal';

const GestionarVentas: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFacturaModalOpen, setIsFacturaModalOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenFacturaModal = (venta: Venta) => {
    setSelectedVenta(venta);
    setIsFacturaModalOpen(true);
  };

  const handleCloseFacturaModal = () => {
    setSelectedVenta(null);
    setIsFacturaModalOpen(false);
  };

  // Mockup de ventas ampliado
  const mockVentas: Venta[] = [
    { 
      id_venta: 1, 
      cliente: 'Juan Pérez', 
      fecha: '2024-07-28', 
      total: 1350.00, 
      estado: 'Completada',
      metodo_pago: 'Tarjeta de Crédito',
      items: [
        { productId: 1, name: 'Laptop Pro', price: 1200.00, quantity: 1 },
        { productId: 2, name: 'Mouse Gamer', price: 50.00, quantity: 3 },
      ]
    },
    { 
      id_venta: 2, 
      cliente: 'Ana Gómez', 
      fecha: '2024-07-27', 
      total: 780.50, 
      estado: 'Completada',
      metodo_pago: 'Transferencia Bancaria',
      items: [
        { productId: 4, name: 'Monitor 4K', price: 700.00, quantity: 1 },
        { productId: 5, name: 'Webcam HD', price: 80.00, quantity: 1 },
      ]
    },
    { 
      id_venta: 3, 
      cliente: 'Carlos Ruiz', 
      fecha: '2024-07-29', 
      total: 85.00, 
      estado: 'Pendiente',
      metodo_pago: 'Efectivo',
      items: [
        { productId: 2, name: 'Mouse Gamer', price: 50.00, quantity: 1 },
        { productId: 5, name: 'Webcam HD', price: 35.00, quantity: 1 },
      ]
    },
    { 
      id_venta: 4, 
      cliente: 'Lucía Fernández', 
      fecha: '2024-07-26', 
      total: 500.00, 
      estado: 'Cancelada',
      metodo_pago: 'No especificado',
      items: [
        { productId: 3, name: 'Teclado Mecánico', price: 150.00, quantity: 2 },
        { productId: 2, name: 'Mouse Gamer', price: 50.00, quantity: 4 },
      ]
    },
  ];

  const ventasFiltradas = mockVentas.filter(
    (v) =>
      v.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.estado.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getEstadoClass = (estado: string) => {
    switch (estado) {
      case 'Completada': return 'venta-estado completada';
      case 'Pendiente': return 'venta-estado pendiente';
      case 'Cancelada': return 'venta-estado cancelada';
      default: return 'venta-estado';
    }
  };

  return (
    <div className="gestionar-ventas-container">
      <Button onClick={handleOpenModal} className="btn-primary btn-nuevo">+ Registrar Venta</Button>
      <div className="ventas-card">
        <div className="ventas-card-header">
          <span className="ventas-card-title">Gestión de Ventas</span>
          <span className="ventas-card-count">{ventasFiltradas.length} ventas</span>
          <input
            className="ventas-buscar"
            type="text"
            placeholder="Buscar por cliente o estado..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="ventas-table-container">
          <table className="ventas-table">
            <thead>
              <tr>
                <th>ID Venta</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.map((venta) => (
                <tr key={venta.id_venta}>
                  <td>#{venta.id_venta}</td>
                  <td>{venta.cliente}</td>
                  <td>{new Date(venta.fecha).toLocaleDateString()}</td>
                  <td>Bs {venta.total.toLocaleString()}</td>
                  <td>
                    <span className={getEstadoClass(venta.estado)}>
                      {venta.estado}
                    </span>
                  </td>
                  <td className="ventas-acciones">
                    <ViewDetailsButton onClick={() => handleOpenFacturaModal(venta)} />
                    <EditButton onClick={() => console.log('Edit')} />
                    <DeleteButton onClick={() => console.log('Delete')} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Registrar Nueva Venta">
        <RegistrarVentaForm onClose={handleCloseModal} />
      </Modal>

      <FacturaModal 
        isOpen={isFacturaModalOpen}
        onClose={handleCloseFacturaModal}
        venta={selectedVenta}
      />
    </div>
  );
};

export default GestionarVentas;
