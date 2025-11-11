import React from 'react';
import Modal from './Modal';
import Button from './Button';
import './FacturaModal.css';
import logo from '../assets/logo.png'; // Asegúrate de que la ruta al logo sea correcta

interface SaleItem {
    productId: number;
    name: string;
    quantity: number;
    price: number;
}

export interface Venta {
    id_venta: number;
    cliente: string;
    fecha: string;
    total: number;
    estado: 'Completada' | 'Pendiente' | 'Cancelada';
    items: SaleItem[];
    metodo_pago?: string;
}

interface FacturaModalProps {
    isOpen: boolean;
    onClose: () => void;
    venta: Venta | null;
}

const FacturaModal: React.FC<FacturaModalProps> = ({ isOpen, onClose, venta }) => {
    if (!venta) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Factura #${venta.id_venta}`}>
            <div className="factura-container" id="factura-imprimible">
                <div className="factura-header">
                    <div className="factura-logo">
                        <img src={logo} alt="Logo" />
                        <h1>SmartSale</h1>
                    </div>
                    <div className="factura-info">
                        <p><strong>Factura N°:</strong> {venta.id_venta}</p>
                        <p><strong>Fecha:</strong> {new Date(venta.fecha).toLocaleDateString()}</p>
                        <p><strong>Estado:</strong> <span className={`factura-estado ${venta.estado.toLowerCase()}`}>{venta.estado}</span></p>
                    </div>
                </div>

                <div className="factura-cliente">
                    <h2>Facturar a:</h2>
                    <p>{venta.cliente}</p>
                    {/* Se pueden añadir más detalles del cliente si están disponibles */}
                </div>

                <table className="factura-items-table">
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th>Cantidad</th>
                            <th>Precio Unit.</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {venta.items.map(item => (
                            <tr key={item.productId}>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>Bs {item.price.toFixed(2)}</td>
                                <td>Bs {(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="factura-total">
                    <p><strong>Subtotal:</strong> Bs {venta.total.toFixed(2)}</p>
                    <p><strong>Impuestos (0%):</strong> Bs 0.00</p>
                    <h3><strong>Total a Pagar:</strong> Bs {venta.total.toFixed(2)}</h3>
                </div>

                <div className="factura-footer">
                    <p><strong>Método de Pago:</strong> {venta.metodo_pago || 'No especificado'}</p>
                    <p>Gracias por su compra.</p>
                </div>
            </div>
            <div className="factura-actions">
                <Button onClick={onClose} className="btn-secondary">Cerrar</Button>
                <Button onClick={handlePrint} className="btn-primary">Imprimir</Button>
            </div>
        </Modal>
    );
};

export default FacturaModal;
