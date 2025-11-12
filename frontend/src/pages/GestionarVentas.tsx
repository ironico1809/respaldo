import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './GestionarVentas.css';
import Button from '../components/Button';
import ViewDetailsButton from '../components/ViewDetailsButton';
import Modal from '../components/Modal';
import RegistrarVentaForm from '../components/RegistrarVentaForm';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import FacturaModal from '../components/FacturaModal';
import type { Venta } from '../components/FacturaModal';
import pagoService from '../services/pagoService';
import ventaService from '../services/ventaService';

const GestionarVentas: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [busqueda, setBusqueda] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFacturaModalOpen, setIsFacturaModalOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [ventaIdExitosa, setVentaIdExitosa] = useState<string | null>(null);
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar ventas desde el backend
  const cargarVentas = async () => {
    try {
      setLoading(true);
      const ventasData = await ventaService.getAll();
      setVentas(ventasData);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar ventas al montar el componente
  useEffect(() => {
    cargarVentas();
  }, []);

  // Verificar si viene de un pago exitoso
  useEffect(() => {
    const verificarPago = async () => {
      const pagoExitoso = searchParams.get('pago_exitoso');
      const sessionId = searchParams.get('session_id');
      const ventaId = searchParams.get('venta_id');

      if (pagoExitoso === 'true' && sessionId && ventaId) {
        try {
          // Verificar el pago con Stripe
          await pagoService.verifyCheckoutSession(sessionId);
          
          // Mostrar mensaje de éxito
          setShowSuccessMessage(true);
          setVentaIdExitosa(ventaId);
          
          // Recargar las ventas
          cargarVentas();
          
          // Limpiar los parámetros de la URL después de 5 segundos
          setTimeout(() => {
            setShowSuccessMessage(false);
            setSearchParams({});
          }, 5000);
        } catch (error) {
          console.error('Error al verificar pago:', error);
        }
      }
    };

    verificarPago();
  }, [searchParams, setSearchParams]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Recargar ventas después de cerrar el modal
    cargarVentas();
  };

  const handleOpenFacturaModal = (venta: Venta) => {
    setSelectedVenta(venta);
    setIsFacturaModalOpen(true);
  };

  const handleCloseFacturaModal = () => {
    setSelectedVenta(null);
    setIsFacturaModalOpen(false);
  };

  // Convertir ventas del backend al formato que espera la interfaz
  const ventasFormateadas: Venta[] = ventas.map(venta => ({
    id_venta: venta.id,
    cliente: venta.cliente_nombre || 'Cliente desconocido',
    fecha: new Date(venta.fecha_venta).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }),
    total: parseFloat(venta.monto_total),
    estado: venta.estado,
    metodo_pago: venta.metodo_pago,
    items: venta.detalles?.map((detalle: any) => ({
      productId: detalle.producto,
      name: detalle.producto_nombre,
      price: parseFloat(detalle.precio_unitario),
      quantity: detalle.cantidad
    })) || []
  }));

  const ventasFiltradas = ventasFormateadas.filter(
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
      {showSuccessMessage && (
        <div className="alert alert-success" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '1rem 1.5rem',
          backgroundColor: '#10b981',
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          animation: 'slideInRight 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <div>
            <strong>¡Pago exitoso!</strong>
            <p style={{margin: '0.25rem 0 0 0', fontSize: '0.9rem'}}>
              Venta #{ventaIdExitosa} registrada correctamente
            </p>
          </div>
        </div>
      )}
      
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
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="spinner" style={{ margin: '0 auto', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ marginTop: '1rem', color: '#6b7280' }}>Cargando ventas...</p>
                  </td>
                </tr>
              ) : ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No se encontraron ventas
                  </td>
                </tr>
              ) : (
                ventasFiltradas.map((venta) => (
                  <tr key={venta.id_venta}>
                    <td>#{venta.id_venta}</td>
                    <td>{venta.cliente}</td>
                    <td>{venta.fecha}</td>
                    <td>Bs {venta.total.toFixed(2)}</td>
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
                ))
              )}
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
