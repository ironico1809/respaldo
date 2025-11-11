-- Esquema de base de datos para SmartSale

-- Tabla de usuarios (Django)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    correo VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL,
    estado BOOLEAN DEFAULT TRUE
);

-- Tabla de clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) UNIQUE NOT NULL,
    direccion TEXT NOT NULL,
    ci VARCHAR(20) UNIQUE NOT NULL,
    fecha_registro DATE DEFAULT CURRENT_DATE,
    estado BOOLEAN DEFAULT TRUE
);

-- Tabla de empleados
CREATE TABLE empleados (
    id SERIAL PRIMARY KEY,
    usuario_id INT UNIQUE,
    nombre_completo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    ci VARCHAR(20) UNIQUE NOT NULL,
    rol VARCHAR(50) NOT NULL,
    direccion TEXT NOT NULL,
    fecha_contratacion DATE DEFAULT CURRENT_DATE,
    salario DECIMAL(10, 2),
    estado BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_empleado_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de permisos
CREATE TABLE permisos (
    id SERIAL PRIMARY KEY,
    crear BOOLEAN DEFAULT FALSE,
    editar BOOLEAN DEFAULT FALSE,
    eliminar BOOLEAN DEFAULT FALSE,
    ver BOOLEAN DEFAULT TRUE,
    vista VARCHAR(50) NOT NULL,
    usuario_id INT NOT NULL,
    CONSTRAINT fk_permiso_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT unique_usuario_vista UNIQUE (usuario_id, vista)
);

-- Tabla de bitácora
CREATE TABLE bitacora (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    ip VARCHAR(45) NOT NULL,
    fecha_hora TIMESTAMP NOT NULL,
    accion TEXT NOT NULL,
    descripcion TEXT NOT NULL
);

-- Tabla de categorías
CREATE TABLE categoria (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'Activo'
);

-- Tabla de productos
CREATE TABLE producto (
    id SERIAL PRIMARY KEY,
    categoria_id INT,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 5,
    imagen_url TEXT,
    estado VARCHAR(20) DEFAULT 'Activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categoria(id) ON DELETE SET NULL
);

-- Tabla para movimientos de inventario
CREATE TABLE movimiento_inventario (
    id SERIAL PRIMARY KEY,
    producto_id INT NOT NULL,
    tipo_movimiento VARCHAR(20) NOT NULL, -- 'entrada', 'salida', 'ajuste'
    cantidad INT NOT NULL,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_responsable_id INT,
    motivo TEXT,
    CONSTRAINT fk_movimiento_producto FOREIGN KEY (producto_id) REFERENCES producto(id) ON DELETE CASCADE,
    CONSTRAINT fk_movimiento_usuario FOREIGN KEY (usuario_responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de carrito
CREATE TABLE carrito (
    id SERIAL PRIMARY KEY,
    usuario_id INT UNIQUE NOT NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_carrito_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de ítems del carrito
CREATE TABLE carrito_item (
    id SERIAL PRIMARY KEY,
    carrito_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_item_carrito FOREIGN KEY (carrito_id) REFERENCES carrito(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_producto FOREIGN KEY (producto_id) REFERENCES producto(id) ON DELETE CASCADE
);

-- Tabla de ventas
CREATE TABLE venta (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL,
    vendedor_id INT,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    monto_total DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50),
    referencia_pago VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'Completada',
    CONSTRAINT fk_venta_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    CONSTRAINT fk_venta_vendedor FOREIGN KEY (vendedor_id) REFERENCES empleados(id) ON DELETE SET NULL
);

-- Tabla de detalles de venta
CREATE TABLE venta_detalle (
    id SERIAL PRIMARY KEY,
    venta_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_detalle_venta FOREIGN KEY (venta_id) REFERENCES venta(id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES producto(id) ON DELETE RESTRICT
);

CREATE TABLE prediccion_ventas (
    id_prediccion SERIAL PRIMARY KEY,
    fecha_prediccion DATE NOT NULL,
    monto_predicho DECIMAL(10, 2) NOT NULL,
    id_categoria INT,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modelo_usado VARCHAR(100) DEFAULT 'Random Forest Regressor'
);

CREATE TABLE reporte_log (
    id_reporte SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    prompt_original TEXT,
    tipo_archivo VARCHAR(10) NOT NULL,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archivo_url TEXT,
    CONSTRAINT fk_reporte_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE dispositivo_usuario (
    id_dispositivo SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    fcm_token TEXT NOT NULL,
    plataforma VARCHAR(20),
    ultimo_acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dispositivo_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE notificacion (
    id_notificacion SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notificacion_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- Tabla para movimientos de inventario
CREATE TABLE movimiento_inventario (
    id_movimiento SERIAL PRIMARY KEY,
    id_producto INT NOT NULL,
    tipo_movimiento VARCHAR(20) NOT NULL, -- 'entrada', 'salida', 'ajuste', etc.
    cantidad INT NOT NULL,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_responsable INT, -- id_usuario que realiza el movimiento
    motivo TEXT,
    CONSTRAINT fk_movimiento_producto FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    CONSTRAINT fk_movimiento_usuario FOREIGN KEY (usuario_responsable) REFERENCES usuario(id_usuario)
);

-- Ocultar producto en el inventario sin eliminarlo
UPDATE producto SET estado = 'Inactivo' WHERE nombre = 'Mouse Logitech';
