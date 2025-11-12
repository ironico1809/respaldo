import React, { useState, useEffect } from 'react';
import './Carrito.css';

interface CarritoItem {
  id: number;
  producto: number;
  producto_nombre: string;
  producto_precio: number;
  producto_precio_bs: number;
  producto_imagen: string | null;
  producto_stock: number;
  producto_descripcion: string;
  cantidad: number;
  subtotal: number;
  subtotal_bs: number;
}

interface CarritoData {
  id: number;
  items: CarritoItem[];
  total_items: number;
  subtotal: number;
  subtotal_bs: number;
  igv: number;
  igv_bs: number;
  total: number;
  total_bs: number;
  tipo_cambio: number;
}

interface MetodoPago {
  value: string;
  label: string;
  icon: string;
}

const Carrito: React.FC = () => {
  const [carrito, setCarrito] = useState<CarritoData | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [mostrandoCheckout, setMostrandoCheckout] = useState<boolean>(false);
  const [mostrandoConfirmacion, setMostrandoConfirmacion] = useState<boolean>(false);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<string>('');
  const [referenciaPago, setReferenciaPago] = useState<string>('');
  const [procesandoCompra, setProcesandoCompra] = useState<boolean>(false);

  useEffect(() => {
    cargarCarrito();
    cargarMetodosPago();
  }, []);

  const cargarCarrito = async () => {
    try {
      setCargando(true);
      const response = await fetch('http://localhost:8000/api/carritos/mi_carrito/?usuario_id=1');
      const data = await response.json();
      setCarrito(data);
    } catch (error) {
      console.error('Error al cargar carrito:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarMetodosPago = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/ventas/metodos_pago/');
      const data = await response.json();
      setMetodosPago(data.metodos);
      if (data.metodos.length > 0) {
        setMetodoSeleccionado(data.metodos[0].value);
      }
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
    }
  };

  const actualizarCantidad = async (itemId: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarItem(itemId);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/carritos/actualizar_cantidad/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: 1,
          item_id: itemId,
          cantidad: nuevaCantidad
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCarrito(data.carrito);
      } else {
        alert(data.error || 'Error al actualizar cantidad');
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      alert('Error al actualizar cantidad');
    }
  };

  const eliminarItem = async (itemId: number) => {
    try {
      const response = await fetch('http://localhost:8000/api/carritos/eliminar_item/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: 1,
          item_id: itemId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCarrito(data.carrito);
      } else {
        alert(data.error || 'Error al eliminar item');
      }
    } catch (error) {
      console.error('Error al eliminar item:', error);
      alert('Error al eliminar item');
    }
  };

  const vaciarCarrito = async () => {
    if (!confirm('¿Estás seguro de vaciar el carrito?')) return;

    try {
      const response = await fetch('http://localhost:8000/api/carritos/vaciar/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: 1
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCarrito(data.carrito);
      } else {
        alert(data.error || 'Error al vaciar carrito');
      }
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
      alert('Error al vaciar carrito');
    }
  };

  const procesarCompra = async () => {
    if (!carrito || carrito.items.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    if (!metodoSeleccionado) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    setProcesandoCompra(true);

    try {
      const response = await fetch('http://localhost:8000/api/ventas/crear_desde_carrito/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: 1,
          cliente_id: 1,
          metodo_pago: metodoSeleccionado,
          referencia_pago: referenciaPago
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMostrandoCheckout(false);
        setMostrandoConfirmacion(true);
        setTimeout(() => {
          setMostrandoConfirmacion(false);
          window.location.href = '/catalogo';
        }, 3000);
      } else {
        alert(data.error || 'Error al procesar la compra');
      }
    } catch (error) {
      console.error('Error al procesar compra:', error);
      alert('Error al procesar la compra');
    } finally {
      setProcesandoCompra(false);
    }
  };

  const pagarConStripe = async () => {
    if (!carrito || carrito.items.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setProcesandoCompra(true);

    try {
      // Obtener el token JWT del localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Debes iniciar sesión para continuar con el pago');
        window.location.href = '/login';
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/pagos/create-checkout-session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          usuario_id: 1,  // Usuario de demo
          success_url: `${window.location.origin}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/carrito`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redireccionar a la página de pago de Stripe
        window.location.href = data.checkout_url;
      } else {
        if (response.status === 401 || response.status === 403) {
          alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          window.location.href = '/login';
        } else {
          alert(data.error || 'Error al crear la sesión de pago');
        }
      }
    } catch (error) {
      console.error('Error al crear sesión de pago:', error);
      alert('Error al crear la sesión de pago');
    } finally {
      setProcesandoCompra(false);
    }
  };

  if (cargando) {
    return (
      <div className="carrito-container">
        <div className="carrito-cargando">
          <div className="spinner"></div>
          <p>Cargando carrito...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <div className="carrito-header">
        <div className="carrito-titulo-section">
          <h1 className="carrito-titulo">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            Mi Carrito de Compras
          </h1>
          <p className="carrito-subtitulo">{carrito?.total_items || 0} {(carrito?.total_items || 0) === 1 ? 'producto' : 'productos'}</p>
        </div>
        <a href="/catalogo" className="btn-volver-catalogo">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Seguir comprando
        </a>
      </div>

      {mostrandoConfirmacion && (
        <div className="confirmacion-compra">
          ✓ ¡Compra procesada exitosamente! Redirigiendo...
        </div>
      )}

      {carrito && carrito.items.length > 0 ? (
        <div className="carrito-contenido">
          <div className="carrito-items">
            <div className="carrito-items-header">
              <h2>Productos en tu carrito</h2>
              <button className="btn-vaciar" onClick={vaciarCarrito}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Vaciar carrito
              </button>
            </div>

            {carrito.items.map(item => (
              <div key={item.id} className="carrito-item">
                <div className="carrito-item-imagen">
                  {item.producto_imagen ? (
                    <img src={item.producto_imagen} alt={item.producto_nombre} />
                  ) : (
                    <div className="carrito-item-imagen-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="carrito-item-info">
                  <h3 className="carrito-item-nombre">{item.producto_nombre}</h3>
                  {item.producto_descripcion && (
                    <p className="carrito-item-descripcion">{item.producto_descripcion}</p>
                  )}
                  <span className="carrito-item-precio-unitario">
                    Bs {Number(item.producto_precio_bs).toFixed(2)} c/u
                  </span>
                </div>

                <div className="carrito-item-cantidad">
                  <button
                    className="btn-cantidad"
                    onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={item.producto_stock}
                    value={item.cantidad}
                    onChange={e => actualizarCantidad(item.id, Number(e.target.value))}
                    className="input-cantidad"
                  />
                  <button
                    className="btn-cantidad"
                    onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="carrito-item-total">
                  <span className="carrito-item-precio-total">
                    Bs {Number(item.subtotal_bs).toFixed(2)}
                  </span>
                  <button
                    className="btn-eliminar-item"
                    onClick={() => eliminarItem(item.id)}
                    title="Eliminar producto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="carrito-resumen">
            <h2 className="carrito-resumen-titulo">Resumen de compra</h2>
            
            <div className="carrito-resumen-detalle">
              <span>Tipo de cambio:</span>
              <span className="tipo-cambio">1 USD = {Number(carrito.tipo_cambio).toFixed(2)} Bs</span>
            </div>
            
            <div className="carrito-resumen-linea">
              <span>Subtotal:</span>
              <span>Bs {Number(carrito.subtotal_bs).toFixed(2)}</span>
            </div>
            
            <div className="carrito-resumen-linea">
              <span>IGV (18%):</span>
              <span>Bs {Number(carrito.igv_bs).toFixed(2)}</span>
            </div>
            
            <div className="carrito-resumen-linea carrito-resumen-total">
              <span>Total:</span>
              <span>Bs {Number(carrito.total_bs).toFixed(2)}</span>
            </div>

            <button 
              className="btn-procesar-compra" 
              onClick={pagarConStripe}
              disabled={procesandoCompra}
            >
              {procesandoCompra ? (
                <>
                  <div className="spinner-small"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  Pagar con Stripe
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="carrito-vacio">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h2>Tu carrito está vacío</h2>
          <p>Agrega productos desde el catálogo para comenzar tu compra</p>
          <a href="/catalogo" className="btn-ir-catalogo">
            Ver catálogo de productos
          </a>
        </div>
      )}

      {mostrandoCheckout && (
        <div className="checkout-modal-overlay" onClick={() => !procesandoCompra && setMostrandoCheckout(false)}>
          <div className="checkout-modal" onClick={e => e.stopPropagation()}>
            <div className="checkout-header">
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                Método de Pago
              </h2>
              <button className="btn-cerrar-modal" onClick={() => !procesandoCompra && setMostrandoCheckout(false)}>
                ×
              </button>
            </div>

            <div className="checkout-body">
              <div className="checkout-total">
                <span>Total a pagar:</span>
                <span className="checkout-monto">S/ {Number(carrito?.total).toFixed(2)}</span>
              </div>

              <div className="metodos-pago-grid">
                {metodosPago.map(metodo => (
                  <label 
                    key={metodo.value} 
                    className={`metodo-pago-card ${metodoSeleccionado === metodo.value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="metodo_pago"
                      value={metodo.value}
                      checked={metodoSeleccionado === metodo.value}
                      onChange={e => setMetodoSeleccionado(e.target.value)}
                    />
                    <div className="metodo-pago-content">
                      <span className="metodo-pago-icon">{metodo.icon}</span>
                      <span className="metodo-pago-label">{metodo.label}</span>
                    </div>
                  </label>
                ))}
              </div>

              {['tarjeta', 'yape', 'plin', 'transferencia'].includes(metodoSeleccionado) && (
                <div className="checkout-referencia">
                  <label htmlFor="referencia">Número de operación / referencia (opcional):</label>
                  <input
                    type="text"
                    id="referencia"
                    value={referenciaPago}
                    onChange={e => setReferenciaPago(e.target.value)}
                    placeholder="Ej: 123456789"
                    className="input-referencia"
                  />
                </div>
              )}
            </div>

            <div className="checkout-footer">
              <button 
                className="btn-cancelar-checkout" 
                onClick={() => !procesandoCompra && setMostrandoCheckout(false)}
                disabled={procesandoCompra}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirmar-compra" 
                onClick={procesarCompra}
                disabled={procesandoCompra}
              >
                {procesandoCompra ? (
                  <>
                    <div className="spinner-small"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Confirmar compra
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrito;
