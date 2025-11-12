import React, { useState, useEffect } from 'react';
import './ModalRegistrarMovimiento.css';

interface Producto {
  id: number;
  nombre: string;
  stock: number;
}

interface ModalRegistrarMovimientoProps {
  abierto: boolean;
  alCerrar: () => void;
  alGuardar: () => void;
  productos: Producto[];
}

const ModalRegistrarMovimiento: React.FC<ModalRegistrarMovimientoProps> = ({
  abierto,
  alCerrar,
  alGuardar,
  productos
}) => {
  const [productoId, setProductoId] = useState<number | ''>('');
  const [tipoMovimiento, setTipoMovimiento] = useState<'entrada' | 'salida' | 'ajuste'>('entrada');
  const [cantidad, setCantidad] = useState<number>(0);
  const [motivo, setMotivo] = useState<string>('');
  const [stockActual, setStockActual] = useState<number>(0);

  useEffect(() => {
    if (productoId) {
      const producto = productos.find(p => p.id === productoId);
      setStockActual(producto?.stock || 0);
    }
  }, [productoId, productos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productoId || cantidad <= 0) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/productos/movimientos/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          producto: productoId,
          tipo_movimiento: tipoMovimiento,
          cantidad: cantidad,
          motivo: motivo || `${tipoMovimiento} de inventario`,
          usuario_responsable: null // Aquí puedes agregar el ID del usuario logueado
        }),
      });

      if (response.ok) {
        alert('Movimiento registrado exitosamente');
        alGuardar();
        handleReset();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'No se pudo registrar el movimiento'}`);
      }
    } catch (error) {
      console.error('Error al registrar movimiento:', error);
      alert('Error al registrar el movimiento');
    }
  };

  const handleReset = () => {
    setProductoId('');
    setTipoMovimiento('entrada');
    setCantidad(0);
    setMotivo('');
    setStockActual(0);
  };

  const calcularNuevoStock = () => {
    if (tipoMovimiento === 'entrada') {
      return stockActual + cantidad;
    } else if (tipoMovimiento === 'salida') {
      return stockActual - cantidad;
    } else {
      return cantidad;
    }
  };

  if (!abierto) return null;

  return (
    <div className="modal-registrar-movimiento-overlay" onClick={alCerrar}>
      <div className="modal-registrar-movimiento" onClick={e => e.stopPropagation()}>
        <div className="modal-registrar-movimiento-titulo">
          Registrar Movimiento de Inventario
        </div>
        <form className="modal-registrar-movimiento-form" onSubmit={handleSubmit}>
          <label htmlFor="producto">Producto *</label>
          <select
            id="producto"
            value={productoId}
            onChange={e => setProductoId(Number(e.target.value))}
            required
          >
            <option value="">Seleccionar producto...</option>
            {productos.map(producto => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre} (Stock: {producto.stock})
              </option>
            ))}
          </select>

          {productoId && (
            <div className="stock-actual">
              Stock actual: {stockActual} → Nuevo stock: {calcularNuevoStock()}
            </div>
          )}

          <label htmlFor="tipoMovimiento">Tipo de Movimiento *</label>
          <select
            id="tipoMovimiento"
            value={tipoMovimiento}
            onChange={e => setTipoMovimiento(e.target.value as 'entrada' | 'salida' | 'ajuste')}
            required
          >
            <option value="entrada">Entrada (Agregar stock)</option>
            <option value="salida">Salida (Reducir stock)</option>
            <option value="ajuste">Ajuste (Establecer stock)</option>
          </select>

          <label htmlFor="cantidad">Cantidad *</label>
          <input
            id="cantidad"
            type="number"
            min="1"
            value={cantidad || ''}
            onChange={e => setCantidad(Number(e.target.value))}
            placeholder={tipoMovimiento === 'ajuste' ? 'Nuevo stock' : 'Cantidad'}
            required
          />

          <label htmlFor="motivo">Motivo</label>
          <textarea
            id="motivo"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Describe el motivo del movimiento..."
            rows={3}
          />

          <div className="modal-registrar-movimiento-acciones">
            <button type="button" className="cancelar" onClick={alCerrar}>
              Cancelar
            </button>
            <button type="submit" className="guardar">
              Registrar Movimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalRegistrarMovimiento;
