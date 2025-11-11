import React, { useState, useMemo } from 'react';
import Input from './Input';
import Button from './Button';
import './RegistrarVentaForm.css';

interface RegistrarVentaFormProps {
    onClose: () => void;
}

// Mockup de productos
const mockProducts = [
    { id: 1, name: 'Laptop Pro', price: 1200.00, stock: 15 },
    { id: 2, name: 'Mouse Gamer', price: 50.00, stock: 30 },
    { id: 3, name: 'Teclado Mecánico', price: 150.00, stock: 25 },
    { id: 4, name: 'Monitor 4K', price: 700.00, stock: 10 },
    { id: 5, name: 'Webcam HD', price: 80.00, stock: 20 },
];

interface SaleItem {
    productId: number;
    name: string;
    quantity: number;
    price: number;
}

const RegistrarVentaForm: React.FC<RegistrarVentaFormProps> = ({ onClose }) => {
    const [cliente, setCliente] = useState('');
    const [items, setItems] = useState<SaleItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<number | string>('');
    const [quantity, setQuantity] = useState<number | string>(1);

    const handleAddProduct = () => {
        if (!selectedProduct || !quantity) return;

        const product = mockProducts.find(p => p.id === Number(selectedProduct));
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
                name: product.name,
                quantity: Number(quantity),
                price: product.price
            }]);
        }

        setSelectedProduct('');
        setQuantity(1);
    };

    const handleRemoveItem = (productId: number) => {
        setItems(items.filter(item => item.productId !== productId));
    };

    const totalVenta = useMemo(() => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [items]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({
            cliente,
            items,
            total: totalVenta,
        });
        onClose();
    };

    return (
        <div className="registrar-venta-form-container">
            <form onSubmit={handleSubmit} className="registrar-venta-form">
                <h2>Registrar Venta</h2>

                <Input
                    id="cliente"
                    label="Nombre del Cliente"
                    type="text"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                />

                <div className="add-product-section">
                    <div className="product-selector">
                        <label htmlFor="product-select">Producto</label>
                        <select
                            id="product-select"
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                        >
                            <option value="" disabled>Seleccionar producto</option>
                            {mockProducts.map(p => (
                                <option key={p.id} value={p.id}>{p.name} - Bs {p.price.toFixed(2)}</option>
                            ))}
                        </select>
                    </div>
                    <Input
                        id="quantity"
                        label="Cantidad"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    />
                    <Button type="button" onClick={handleAddProduct} className="add-button">
                        + Agregar
                    </Button>
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

                <div className="total-section">
                    <strong>Total:</strong>
                    <span>Bs {totalVenta.toFixed(2)}</span>
                </div>

                <div className="form-actions">
                    <Button onClick={onClose} className="cancel-button">Cancelar</Button>
                    <Button type="submit" className="submit-button" disabled={items.length === 0}>Registrar Venta</Button>
                </div>
            </form>
        </div>
    );
};

export default RegistrarVentaForm;
