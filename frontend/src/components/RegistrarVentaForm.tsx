import React, { useState, useMemo, useEffect } from 'react';
import Input from './Input';
import AutocompleteInput from './AutocompleteInput';
import Button from './Button';
import './RegistrarVentaForm.css';
import { getClientes } from '../services/clienteService';
import { productoService } from '../services/productoService';
import ventaService, { type MetodoPago } from '../services/ventaService';
import pagoService from '../services/pagoService';

type Cliente = {
  id: number;
  nombre_completo: string;
  ci: string;
  correo?: string;
  telefono?: string;
  estado: boolean;
};

interface RegistrarVentaFormProps {
    onClose: () => void;
}

interface SaleItem {
    productId: number;
    name: string;
    quantity: number;
    price: number;
}

const RegistrarVentaForm: React.FC<RegistrarVentaFormProps> = ({ onClose }) => {
    const [cliente, setCliente] = useState('');
    const [clienteId, setClienteId] = useState<number | null>(null);
    const [items, setItems] = useState<SaleItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState<number | string>(1);
    const [clientesExistentes, setClientesExistentes] = useState<Cliente[]>([]);
    const [productos, setProductos] = useState<any[]>([]);
    const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
    const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState('');
    const [referenciaPago, setReferenciaPago] = useState('');
    const [loading, setLoading] = useState(false);

    // Cargar clientes y productos para autocompletado
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [clientesRes, productosRes, metodosPagoRes] = await Promise.all([
                    getClientes('activos'),
                    productoService.getActivos(),
                    ventaService.getMetodosPago()
                ]);
                
                // Validar y establecer clientes
                const clientesData = clientesRes?.data || [];
                setClientesExistentes(Array.isArray(clientesData) ? clientesData : []);
                
                // Validar y establecer productos
                setProductos(Array.isArray(productosRes) ? productosRes : []);
                
                // Establecer métodos de pago
                setMetodosPago(metodosPagoRes || []);
                
                console.log('Datos cargados:', { 
                    clientes: clientesData.length, 
                    productos: Array.isArray(productosRes) ? productosRes.length : 0,
                    metodosPago: metodosPagoRes.length,
                    primerProducto: productosRes[0]
                });
            } catch (err) {
                console.error('Error al cargar datos para autocompletado:', err);
                // Establecer arrays vacíos en caso de error
                setClientesExistentes([]);
                setProductos([]);
                setMetodosPago([]);
            }
        };
        cargarDatos();
    }, []);

    const handleAddProduct = () => {
        if (!selectedProductId || !quantity) return;

        const product = productos.find(p => p.id === selectedProductId);
        if (!product) return;

        const existingItem = items.find(item => item.productId === product.id);

        if (existingItem) {
            setItems(items.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + Number(quantity) }
                    : item
            ));
        } else {
            setItems([...items, {
                productId: product.id,
                name: product.nombre,
                quantity: Number(quantity),
                price: Number(product.precio)
            }]);
        }

        setSelectedProduct('');
        setSelectedProductId(null);
        setQuantity(1);
    };

    const handleRemoveItem = (productId: number) => {
        setItems(items.filter(item => item.productId !== productId));
    };

    const totalVenta = useMemo(() => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [items]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!clienteId) {
            alert('Por favor selecciona un cliente');
            return;
        }
        
        if (items.length === 0) {
            alert('Por favor agrega al menos un producto');
            return;
        }
        
        if (!metodoPagoSeleccionado) {
            alert('Por favor selecciona un método de pago');
            return;
        }
        
        setLoading(true);
        
        try {
            // Si el método de pago es tarjeta, abrir Stripe Checkout
            if (metodoPagoSeleccionado === 'tarjeta') {
                // Primero crear la venta en estado "Pendiente"
                const ventaData = {
                    cliente_id: clienteId,
                    metodo_pago: metodoPagoSeleccionado,
                    referencia_pago: 'Pendiente de pago con Stripe',
                    detalles: items.map(item => ({
                        producto_id: item.productId,
                        cantidad: item.quantity,
                        precio_unitario: item.price
                    }))
                };
                
                const ventaCreada = await ventaService.create(ventaData);
                
                // Crear sesión de Stripe Checkout
                const currentUrl = window.location.origin;
                const checkoutSession = await pagoService.createCheckoutSession(
                    1, // usuario_id por defecto
                    `${currentUrl}/gestionar-ventas?venta_id=${ventaCreada.id}&session_id={CHECKOUT_SESSION_ID}&pago_exitoso=true`,
                    `${currentUrl}/gestionar-ventas`
                );
                
                // Redirigir a Stripe Checkout
                window.location.href = checkoutSession.checkout_url;
                return;
            }
            
            // Para otros métodos de pago, crear la venta directamente
            const ventaData = {
                cliente_id: clienteId,
                metodo_pago: metodoPagoSeleccionado,
                referencia_pago: referenciaPago,
                detalles: items.map(item => ({
                    producto_id: item.productId,
                    cantidad: item.quantity,
                    precio_unitario: item.price
                }))
            };
            
            const ventaCreada = await ventaService.create(ventaData);
            console.log('Venta creada:', ventaCreada);
            alert('¡Venta registrada exitosamente!');
            onClose();
        } catch (error: any) {
            console.error('Error al crear venta:', error);
            alert('Error al registrar la venta: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registrar-venta-form-container">
            <form onSubmit={handleSubmit} className="registrar-venta-form">
                <h2>Registrar Venta</h2>

                <AutocompleteInput
                    id="cliente"
                    label="Nombre del Cliente"
                    value={cliente}
                    onChange={(value, option) => {
                        setCliente(value);
                        if (option?.metadata) {
                            const clienteSeleccionado = option.metadata as Cliente;
                            setClienteId(clienteSeleccionado.id);
                        }
                    }}
                    options={clientesExistentes.map(c => ({
                        value: c.nombre_completo || '',
                        label: `${c.nombre_completo || 'Sin nombre'} - CI: ${c.ci || 'N/A'}`,
                        metadata: c
                    }))}
                    placeholder="Buscar cliente por nombre o CI"
                    required
                />

                <div className="add-product-section" style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'stretch'}}>
                    <AutocompleteInput
                        id="producto"
                        label="Producto"
                        value={selectedProduct}
                        onChange={(value, option) => {
                            setSelectedProduct(value);
                            if (option?.metadata) {
                                const productoSeleccionado = option.metadata;
                                setSelectedProductId(productoSeleccionado.id);
                            } else {
                                setSelectedProductId(null);
                            }
                        }}
                        options={productos.map(p => ({
                            value: p.nombre || '',
                            label: `${p.nombre || 'Sin nombre'} - Bs ${Number(p.precio || 0).toFixed(2)} (Stock: ${p.stock || 0})`,
                            metadata: p
                        }))}
                        placeholder="Buscar producto por nombre"
                        required
                    />
                    <AutocompleteInput
                        id="cantidad"
                        label="Cantidad"
                        value={String(quantity)}
                        onChange={(value) => {
                            // Solo permitir números enteros positivos
                            const num = value.replace(/[^0-9]/g, '');
                            setQuantity(num === '' ? 1 : Math.max(1, Number(num)));
                        }}
                        options={Array.from({length: 100}, (_, i) => ({ value: String(i+1), label: String(i+1) }))}
                        placeholder="Cantidad"
                        required
                        type="number"
                    />
                    <div className="add-button-wrapper">
                        <Button type="button" onClick={handleAddProduct} className="add-button">
                            + Agregar
                        </Button>
                    </div>
                </div>

                {items.length > 0 && (
                    <div className="sale-items-table-container">
                        <table className="sale-items-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio Unit.</th>
                                    <th>Subtotal</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.productId}>
                                        <td>{item.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>Bs {item.price.toFixed(2)}</td>
                                        <td>Bs {(item.price * item.quantity).toFixed(2)}</td>
                                        <td>
                                            <Button type="button" onClick={() => handleRemoveItem(item.productId)} className="remove-button">
                                                Quitar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {items.length > 0 && (
                    <>
                        <div className="payment-section">
                            <h3>Método de Pago</h3>
                            <div className="payment-methods">
                                {metodosPago.map(metodo => (
                                    <div 
                                        key={metodo.value}
                                        className={`payment-method ${metodoPagoSeleccionado === metodo.value ? 'selected' : ''}`}
                                        onClick={() => setMetodoPagoSeleccionado(metodo.value)}
                                    >
                                        <span className="payment-icon">{metodo.icon}</span>
                                        <span className="payment-label">{metodo.label}</span>
                                    </div>
                                ))}
                            </div>
                            
                            {metodoPagoSeleccionado && metodoPagoSeleccionado !== 'efectivo' && (
                                <Input
                                    id="referencia"
                                    label="Referencia de Pago"
                                    type="text"
                                    value={referenciaPago}
                                    onChange={(e) => setReferenciaPago(e.target.value)}
                                    placeholder="Número de transacción, últimos 4 dígitos, etc."
                                />
                            )}
                        </div>
                    </>
                )}

                <div className="total-section">
                    <strong>Total:</strong>
                    <span>Bs {totalVenta.toFixed(2)}</span>
                </div>

                <div className="form-actions">
                    <Button onClick={onClose} className="cancel-button" disabled={loading}>Cancelar</Button>
                    <Button 
                        type="submit" 
                        className="submit-button" 
                        disabled={items.length === 0 || !metodoPagoSeleccionado || loading}
                    >
                        {loading ? 'Procesando...' : 'Registrar Venta'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default RegistrarVentaForm;
