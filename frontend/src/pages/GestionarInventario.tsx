import React, { useState, useEffect } from 'react';
import './GestionarInventario.css';
import ModalMovimientos from '../components/ModalMovimientos';
import ModalFormularioProducto from '../components/ModalFormularioProducto';
import ModalRegistrarMovimiento from '../components/ModalRegistrarMovimiento';
import EditButton from '../components/EditButton';
import InactivarProductoButton from '../components/InactivarProductoButton';
interface Categoria {
  id: number;
  nombre: string;
}
interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  estado: 'Activo' | 'Inactivo';
  categoria: number;
  categoria_nombre?: string;
}
interface MovimientoInventario {
  id_movimiento: number;
  id_producto: number;
  tipo_movimiento: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  fecha_movimiento: string;
  motivo?: string;
}

const GestionarInventario: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalMovimientosOpen, setIsModalMovimientosOpen] = useState(false);
  const [isModalRegistrarMovimientoOpen, setIsModalRegistrarMovimientoOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | 'Activo' | 'Inactivo'>('Activo');

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const productosRes = await fetch('http://localhost:8000/api/productos/');
      const productosData = await productosRes.json();
      setProductos(productosData);
      aplicarFiltros(productosData, busqueda, filtroEstado);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = (listaProductos: Producto[], terminoBusqueda: string, estado: 'Todos' | 'Activo' | 'Inactivo') => {
    let productosFiltrados = listaProductos;

    // Filtrar por estado
    if (estado !== 'Todos') {
      productosFiltrados = productosFiltrados.filter(p => p.estado === estado);
    }

    // Filtrar por búsqueda
    if (terminoBusqueda) {
      const termino = terminoBusqueda.toLowerCase();
      productosFiltrados = productosFiltrados.filter(
        (p) =>
          p.nombre.toLowerCase().includes(termino) ||
          p.descripcion.toLowerCase().includes(termino) ||
          (p.categoria_nombre && p.categoria_nombre.toLowerCase().includes(termino))
      );
    }

    setProductosFiltrados(productosFiltrados);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await cargarProductos();
        const categoriasRes = await fetch('http://localhost:8000/api/productos/categorias/');
        const categoriasData = await categoriasRes.json();
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Error al cargar productos/categorias:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBuscar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const termino = e.target.value;
    setBusqueda(termino);
    aplicarFiltros(productos, termino, filtroEstado);
  };

  const handleFiltroEstado = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoEstado = e.target.value as 'Todos' | 'Activo' | 'Inactivo';
    setFiltroEstado(nuevoEstado);
    aplicarFiltros(productos, busqueda, nuevoEstado);
  };

  const handleNuevoProducto = () => {
    setProductoSeleccionado(null);
    setIsModalOpen(true);
  };

  const handleEditarProducto = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setIsModalOpen(true);
  };  

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductoSeleccionado(null);
  };

  const handleProductoGuardado = async (producto: Omit<Producto, 'id'> | Producto) => {
    try {
      // Si el producto tiene id, es edición; si no, es nuevo
      if ('id' in producto && producto.id) {
        // Actualizar producto existente
        const response = await fetch(`http://localhost:8000/api/productos/${producto.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            stock: producto.stock,
            estado: producto.estado,
            categoria: Number(producto.categoria),
          }),
        });
        if (response.ok) {
          await cargarProductos(); // Recargar la lista completa con categoria_nombre
          alert('Producto actualizado exitosamente');
        } else {
          alert('Error al actualizar el producto');
        }
      } else {
        // Crear nuevo producto
        const response = await fetch('http://localhost:8000/api/productos/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            stock: producto.stock,
            estado: producto.estado,
            categoria: Number(producto.categoria),
          }),
        });
        if (response.ok) {
          await cargarProductos(); // Recargar la lista completa con categoria_nombre
          alert('Producto creado exitosamente');
        } else {
          alert('Error al crear el producto');
        }
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar el producto');
    }
  };

  const handleVerMovimientos = (producto: Producto) => {
    setProductoSeleccionado(producto);
  // Aquí deberías cargar los movimientos desde el backend usando el id del producto
  // Ejemplo:
  // fetch(`/api/movimientos?producto_id=${producto.id_producto}`)
  //   .then(res => res.json())
  //   .then(data => setMovimientos(data));
  setMovimientos([]); // Por defecto vacío hasta implementar la consulta real
    setIsModalMovimientosOpen(true);
  };

  const handleCloseModalMovimientos = () => {
    setIsModalMovimientosOpen(false);
    setProductoSeleccionado(null);
    setMovimientos([]);
  };

  return (
    <div className="gestionar-inventario-container">
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button className="btn btn-primary btn-nuevo" onClick={handleNuevoProducto}>+ Nuevo Producto</button>
        <button className="btn btn-success" onClick={() => setIsModalRegistrarMovimientoOpen(true)}>Registrar Movimiento</button>
      </div>
      <div className="inventario-card">
        <div className="inventario-card-header">
            <span className="inventario-card-title">Inventario de Productos</span>
            <span className="inventario-card-count">{productosFiltrados.length} productos</span>
          <div className="inventario-controles">
              <select 
                className="inventario-filtro-estado" 
                value={filtroEstado} 
                onChange={handleFiltroEstado}
              >
                <option value="Todos">Todos</option>
                <option value="Activo">Activos</option>
                <option value="Inactivo">Inactivos</option>
              </select>
              <input
                className="inventario-buscar"
                type="text"
                placeholder="Buscar por nombre, descripción o categoría..."
                value={busqueda}
                onChange={handleBuscar}
              />
            </div>
          </div>
        {loading && <p>Cargando productos...</p>}
        <div className="inventario-table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
              {productosFiltrados.map((producto) => (
                <tr key={producto.id}>
                  <td><b>{producto.nombre}</b></td>
                  <td>{(producto as any).categoria_nombre}</td>
                  <td>{`Bs ${Number(producto.precio).toFixed(2)}`}</td>
                  <td>{producto.stock}</td>
                  <td>
                    <span className={`inventario-estado ${producto.estado === 'Activo' ? 'activo' : 'inactivo'}`}>
                      {producto.estado}
                    </span>
                  </td>
                  <td className=" -acciones">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <EditButton onClick={() => handleEditarProducto(producto)} />
                      <button className="btn-accion btn-ver" title="Ver Movimientos" onClick={() => handleVerMovimientos(producto)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      <InactivarProductoButton onClick={async () => {
                        const response = await fetch(`http://localhost:8000/api/productos/${producto.id}/`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ estado: 'Inactivo' })
                        });
                        if (response.ok) {
                          setFiltroEstado('Activo');
                          await cargarProductos();
                          alert('Producto inactivado exitosamente');
                        } else {
                          alert('Error al inactivar el producto');
                        }
                      }} />
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
          {isModalOpen && (
            <ModalFormularioProducto
              abierto={isModalOpen}
              alCerrar={handleCloseModal}
              alGuardar={handleProductoGuardado}
              producto={productoSeleccionado}
              categorias={categorias}
            />
          )}
          <ModalMovimientos
            abierto={isModalMovimientosOpen}
            alCerrar={handleCloseModalMovimientos}
            producto={productoSeleccionado}
            movimientos={movimientos}
          />
          <ModalRegistrarMovimiento
            abierto={isModalRegistrarMovimientoOpen}
            alCerrar={() => setIsModalRegistrarMovimientoOpen(false)}
            alGuardar={async () => {
              await cargarProductos();
              setIsModalRegistrarMovimientoOpen(false);
            }}
            productos={productos}
          />
    </div>

    </div>  
  );
};

export default GestionarInventario;