
// --- Tipos de datos ---
export interface Categoria {
    id_categoria: number;
    nombre: string;
}

export interface Producto {
    id_producto: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    estado: 'Activo' | 'Inactivo';
    id_categoria: number;
    nombre_categoria?: string; // Se poblará con un JOIN
}

export interface MovimientoInventario {
    id_movimiento: number;
    id_producto: number;
    tipo_movimiento: 'entrada' | 'salida' | 'ajuste';
    cantidad: number;
    fecha_movimiento: string;
    motivo?: string;
}

// --- Simulación de llamadas a la API (backend) ---
// En una aplicación real, estas funciones harían peticiones a tu backend.
const api = {
    obtenerProductos: async (): Promise<Producto[]> => {
        console.log('Obteniendo productos...');
        // Simula un JOIN en el backend para obtener el nombre de la categoría
        return new Promise(resolve => setTimeout(() => resolve([
            { id_producto: 1, nombre: 'Laptop Gamer Pro', descripcion: 'Laptop de alta gama', precio: 1500.00, stock: 15, estado: 'Activo', id_categoria: 1, nombre_categoria: 'Electrónica' },
            { id_producto: 2, nombre: 'Mouse Inalámbrico', descripcion: 'Mouse ergonómico', precio: 45.50, stock: 50, estado: 'Activo', id_categoria: 1, nombre_categoria: 'Electrónica' },
            { id_producto: 3, nombre: 'Teclado Mecánico RGB', descripcion: 'Teclado con switches cherry mx', precio: 120.00, stock: 30, estado: 'Activo', id_categoria: 1, nombre_categoria: 'Electrónica' },
            { id_producto: 4, nombre: 'Monitor 4K 27"', descripcion: 'Monitor para diseño gráfico', precio: 750.00, stock: 10, estado: 'Inactivo', id_categoria: 1, nombre_categoria: 'Electrónica' },
        ]), 1000));
    },
    obtenerCategorias: async (): Promise<Categoria[]> => {
        console.log('Obteniendo categorías...');
        return new Promise(resolve => setTimeout(() => resolve([
            { id_categoria: 1, nombre: 'Electrónica' },
            { id_categoria: 2, nombre: 'Ropa' },
            { id_categoria: 3, nombre: 'Hogar' },
        ]), 500));
    },
    obtenerMovimientosProducto: async (idProducto: number): Promise<MovimientoInventario[]> => {
        console.log(`Obteniendo movimientos para el producto ${idProducto}...`);
        return new Promise(resolve => setTimeout(() => resolve([
            { id_movimiento: 1, id_producto: idProducto, tipo_movimiento: 'entrada', cantidad: 20, fecha_movimiento: new Date().toISOString(), motivo: 'Stock inicial' },
            { id_movimiento: 2, id_producto: idProducto, tipo_movimiento: 'salida', cantidad: 5, fecha_movimiento: new Date().toISOString(), motivo: 'Venta #1024' },
        ]), 800));
    },
    guardarProducto: async (producto: Omit<Producto, 'id_producto'> | Producto): Promise<Producto> => {
        console.log('Guardando producto...', producto);
        const esNuevo = !('id_producto' in producto);
        return new Promise(resolve => setTimeout(() => resolve({
            ...producto,
            id_producto: esNuevo ? Math.floor(Math.random() * 1000) : (producto as Producto).id_producto,
            nombre_categoria: 'Electrónica' // Simulación
        }), 1000));
    },
    eliminarProducto: async (idProducto: number): Promise<void> => {
        console.log(`Eliminando producto con ID: ${idProducto}`);
        return new Promise(resolve => setTimeout(resolve, 500));
    }
};

export const getProductos = async () => {
    return await api.obtenerProductos();
};

export const getCategorias = async () => {
    return await api.obtenerCategorias();
};

export const getMovimientosProducto = async (idProducto: number) => {
    return await api.obtenerMovimientosProducto(idProducto);
};

export const saveProducto = async (producto: Omit<Producto, 'id_producto'> | Producto) => {
    return await api.guardarProducto(producto);
};

export const deleteProducto = async (idProducto: number) => {
    return await api.eliminarProducto(idProducto);
};
