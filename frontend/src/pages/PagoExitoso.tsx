import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './PagoExitoso.css';

const PagoExitoso: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificando, setVerificando] = useState(true);
  const [pagoConfirmado, setPagoConfirmado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datosPago, setDatosPago] = useState<any>(null);

  useEffect(() => {
    verificarPago();
  }, []);

  const verificarPago = async () => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setError('No se encontró el ID de sesión');
      setVerificando(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/pagos/verify-checkout-session/?session_id=${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPagoConfirmado(true);
        setDatosPago(data);
      } else {
        setError(data.error || 'Error al verificar el pago');
      }
    } catch (error) {
      console.error('Error al verificar pago:', error);
      setError('Error al verificar el pago');
    } finally {
      setVerificando(false);
    }
  };

  const irACatalogo = () => {
    navigate('/catalogo');
  };

  const irAMisPedidos = () => {
    navigate('/mis-pedidos');
  };

  if (verificando) {
    return (
      <div className="pago-exitoso-container">
        <div className="verificando-pago">
          <div className="spinner"></div>
          <h2>Verificando tu pago...</h2>
          <p>Por favor espera mientras confirmamos tu transacción</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pago-exitoso-container">
        <div className="pago-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <h2>Error al procesar el pago</h2>
          <p>{error}</p>
          <button onClick={irACatalogo} className="btn-volver">
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  if (pagoConfirmado) {
    return (
      <div className="pago-exitoso-container">
        <div className="pago-exitoso">
          <div className="pago-exitoso-icono">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h1>¡Pago exitoso!</h1>
          <p className="pago-mensaje">Tu pago ha sido procesado correctamente</p>
          
          {datosPago && (
            <div className="pago-detalles">
              <div className="pago-detalle-item">
                <span>ID de compra:</span>
                <strong>#{datosPago.carrito_id}</strong>
              </div>
              <div className="pago-detalle-item">
                <span>Total pagado:</span>
                <strong>${datosPago.amount_total?.toFixed(2)} USD</strong>
              </div>
              <div className="pago-detalle-item">
                <span>Estado:</span>
                <strong className="estado-pagado">{datosPago.payment_status}</strong>
              </div>
            </div>
          )}

          <div className="pago-acciones">
            <button onClick={irACatalogo} className="btn-catalogo">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Seguir comprando
            </button>
            <button onClick={irAMisPedidos} className="btn-pedidos">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
              Ver mis pedidos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PagoExitoso;
