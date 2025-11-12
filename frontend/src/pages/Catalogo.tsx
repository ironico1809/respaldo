import React, { useState, useEffect } from 'react';
import './Catalogo.css';
import { API_ENDPOINTS } from '../config/api.config';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_bs?: number;
  stock: number;
  imagen_url?: string;
  categoria?: string;
  estado: string;
  categoria_nombre?: string;
}

const Catalogo: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState<string>('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');
  const [mostrarNotificacion, setMostrarNotificacion] = useState<boolean>(false);
  const [mensajeNotificacion, setMensajeNotificacion] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(true);
  const [totalItemsCarrito, setTotalItemsCarrito] = useState<number>(0);
  const [escuchandoVoz, setEscuchandoVoz] = useState<boolean>(false);
  const [soportaVoz, setSoportaVoz] = useState<boolean>(false);

  useEffect(() => {
    cargarProductos();
    cargarCarrito();
    // Verificar si el navegador soporta reconocimiento de voz
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSoportaVoz(true);
    }
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const response = await fetch(API_ENDPOINTS.productos.list);
      const data = await response.json();
      // Mapear y filtrar productos activos con stock disponible
      const TIPO_CAMBIO = 6.96; // USD a BOB
      const productosActivos = data
        .filter((p: any) => (p.estado === 'Activo') && p.stock > 0)
        .map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: Number(p.precio),
          precio_bs: Number(p.precio) * TIPO_CAMBIO,
          stock: p.stock,
          imagen_url: p.imagen_url,
          categoria: p.categoria_nombre || p.categoria,
          estado: p.estado,
        }));
      setProductos(productosActivos);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      mostrarNotificacionTemporal('Error al cargar productos', 'error');
    } finally {
      setCargando(false);
    }
  };

  const cargarCarrito = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.carrito.miCarrito(1));
      const data = await response.json();
      setTotalItemsCarrito(data.total_items || 0);
    } catch (error) {
      console.error('Error al cargar carrito:', error);
    }
  };

  const agregarAlCarrito = async (producto: Producto) => {
    try {
      const response = await fetch(API_ENDPOINTS.carrito.agregarItem, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: 1,
          producto_id: producto.id,
          cantidad: 1
        }),
      });

      const data = await response.json();

      if (response.ok) {
        mostrarNotificacionTemporal('✓ Producto agregado al carrito', 'success');
        setTotalItemsCarrito(data.carrito.total_items || 0);
      } else {
        mostrarNotificacionTemporal(data.error || 'Error al agregar producto', 'error');
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      mostrarNotificacionTemporal('Error al agregar al carrito', 'error');
    }
  };

  const mostrarNotificacionTemporal = (mensaje: string, tipo?: string) => {
    setMensajeNotificacion(`${tipo ? `[${tipo.toUpperCase()}] ` : ''}${mensaje}`);
    setMostrarNotificacion(true);
    setTimeout(() => setMostrarNotificacion(false), 2500);
  };

  const iniciarBusquedaPorVoz = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      mostrarNotificacionTemporal('Tu navegador no soporta reconocimiento de voz', 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setEscuchandoVoz(true);
      mostrarNotificacionTemporal('🎤 Escuchando... Di el nombre del producto', 'info');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      // Limpiar puntuación y espacios extra
      const textoLimpio = transcript
        .replace(/[.,;:!?¿¡]/g, '') // Eliminar puntuación
        .replace(/\s+/g, ' ')        // Espacios múltiples a uno solo
        .trim();                     // Eliminar espacios al inicio/final
      
      setBusqueda(textoLimpio);
      setEscuchandoVoz(false);
      mostrarNotificacionTemporal(`Buscando: "${textoLimpio}"`, 'success');
    };

    recognition.onerror = (event: any) => {
      console.error('Error de reconocimiento:', event.error);
      setEscuchandoVoz(false);
      mostrarNotificacionTemporal('Error al escuchar. Intenta de nuevo.', 'error');
    };

    recognition.onend = () => {
      setEscuchandoVoz(false);
    };

    recognition.start();
  };

  const productosFiltrados = productos.filter(producto => {
    const cumpleBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          producto.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    const cumpleCategoria = !categoriaFiltro || producto.categoria === categoriaFiltro;
    return cumpleBusqueda && cumpleCategoria;
  });

  const categorias = Array.from(new Set(productos.map(p => p.categoria).filter(Boolean)));

  return (
    <div className="catalogo-container">
      <div className="catalogo-header">
        <div className="catalogo-titulo-section">
          <h1 className="catalogo-titulo">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2l1.5 2h9L18 2" />
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M7 10v2a5 5 0 0 0 10 0v-2" />
            </svg>
            Catálogo de Productos
          </h1>
          <p className="catalogo-subtitulo">Encuentra los mejores productos para tu negocio</p>
        </div>
        <a href="/carrito" className="carrito-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {totalItemsCarrito > 0 && <span className="carrito-count">{totalItemsCarrito}</span>}
        </a>
      </div>

      {mostrarNotificacion && (
        <div className={`notificacion-agregado ${mensajeNotificacion.includes('Error') ? 'error' : ''}`}>
          {mensajeNotificacion}
        </div>
      )}

      <div className="catalogo-filtros">
        <div className="filtro-busqueda">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="catalogo-busqueda"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {soportaVoz && (
            <button
              className={`btn-voz-busqueda ${escuchandoVoz ? 'escuchando' : ''}`}
              onClick={iniciarBusquedaPorVoz}
              disabled={escuchandoVoz}
              title="Buscar por voz"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>
          )}
          {busqueda && (
            <button
              className="btn-limpiar-busqueda"
              onClick={() => setBusqueda('')}
              title="Limpiar búsqueda"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
        {categorias.length > 0 && (
          <select
            className="catalogo-categoria-filtro"
            value={categoriaFiltro}
            onChange={e => setCategoriaFiltro(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
      </div>

      {cargando ? (
        <div className="catalogo-cargando">
          <div className="spinner"></div>
          <p>Cargando productos...</p>
        </div>
      ) : (
        <div className="catalogo-grid">
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map(producto => (
              <div key={producto.id} className="producto-card">
                <div className="producto-imagen">
                  {producto.imagen_url ? (
                    <img src={producto.imagen_url} alt={producto.nombre} />
                  ) : (
                    <div className="producto-imagen-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                  )}
                  {producto.stock < 10 && (
                    <span className="producto-badge-stock">¡Últimas unidades!</span>
                  )}
                </div>
                <div className="producto-info">
                  <h3 className="producto-nombre">{producto.nombre}</h3>
                  {producto.descripcion && (
                    <p className="producto-descripcion">{producto.descripcion}</p>
                  )}
                  <div className="producto-detalles">
                    <span className="producto-precio">Bs {(producto.precio_bs || 0).toFixed(2)}</span>
                    <span className="producto-stock">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      </svg>
                      Stock: {producto.stock}
                    </span>
                  </div>
                  <button
                    className="producto-btn-agregar"
                    onClick={() => agregarAlCarrito(producto)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    Agregar al carrito
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="catalogo-sin-productos">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>No se encontraron productos</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Catalogo;
