import React from 'react';
import Modal from './Modal';
import Button from './Button';
import './ModalMovimientos.css';

interface Producto {
    id: number;
    nombre: string;
}

interface MovimientoInventario {
    id_movimiento: number;
    tipo_movimiento: 'entrada' | 'salida' | 'ajuste';
    cantidad: number;
    fecha_movimiento: string;
    motivo?: string;
}

interface ModalMovimientosProps {
    abierto: boolean;
    alCerrar: () => void;
    producto: Producto | null;
    movimientos: MovimientoInventario[];
}

const ModalMovimientos: React.FC<ModalMovimientosProps> = ({ abierto, alCerrar, producto, movimientos }) => {
    
    const formatearFechaHora = (isoString: string) => {
        return new Date(isoString).toLocaleString('es-ES', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <Modal 
            isOpen={abierto} 
            onClose={alCerrar} 
            title={`Historial de Movimientos: ${producto?.nombre || ''}`}
        >
            <div>
                {movimientos.length > 0 ? (
                    <div className="inventario-table-container modal-movimientos-tabla-container">
                        <table className="inventario-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Cantidad</th>
                                    <th>Motivo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movimientos.map((mov) => (
                                    <tr key={mov.id_movimiento}>
                                        <td>{formatearFechaHora(mov.fecha_movimiento)}</td>
                                        <td>
                                            <span className={`movimiento-chip ${mov.tipo_movimiento}`}>
                                                {mov.tipo_movimiento}
                                            </span>
                                        </td>
                                        <td>{mov.cantidad}</td>
                                        <td>{mov.motivo || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="modal-movimientos-sin-registros">No hay movimientos registrados para este producto.</p>
                )}
                <div className="form-actions">
                    <Button onClick={alCerrar} className="btn-primary">Cerrar</Button>
                </div>
            </div>
        </Modal>
    );
};

export default ModalMovimientos;