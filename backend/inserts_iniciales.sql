-- =====================================================
-- SCRIPT DE INSERCIÓN DE DATOS INICIALES
-- Sistema SmartSale
-- =====================================================

-- =====================================================
-- 1. USUARIOS
-- =====================================================
-- Contraseñas: admin123, vendedor123, cliente123
INSERT INTO usuarios (username, email, password, tipo_usuario, estado) VALUES
('admin', 'admin@smartsale.com', 'pbkdf2_sha256$600000$randomsalt$hashedpassword', 'admin', 'activo'),
('vendedor1', 'vendedor1@smartsale.com', 'pbkdf2_sha256$600000$randomsalt$hashedpassword', 'vendedor', 'activo'),
('vendedor2', 'vendedor2@smartsale.com', 'pbkdf2_sha256$600000$randomsalt$hashedpassword', 'vendedor', 'activo'),
('cliente1', 'cliente1@example.com', 'pbkdf2_sha256$600000$randomsalt$hashedpassword', 'cliente', 'activo'),
('cliente2', 'cliente2@example.com', 'pbkdf2_sha256$600000$randomsalt$hashedpassword', 'cliente', 'activo');

-- =====================================================
-- 2. EMPLEADOS
-- =====================================================
INSERT INTO empleados (usuario_id, nombre, apellido, cargo, departamento, fecha_contratacion, salario, telefono, direccion, estado) VALUES
(2, 'Carlos', 'López', 'Vendedor', 'Ventas', '2024-01-15', 2500.00, '555-0101', 'Calle Principal 123', 'activo'),
(3, 'Ana', 'Martínez', 'Vendedor Senior', 'Ventas', '2023-06-10', 3000.00, '555-0102', 'Avenida Central 456', 'activo');

-- =====================================================
-- 3. CLIENTES
-- =====================================================
INSERT INTO clientes (usuario_id, nombre, apellido, telefono, direccion, ciudad, codigo_postal, fecha_registro, puntos_fidelidad) VALUES
(4, 'Juan', 'Pérez', '555-0201', 'Calle Norte 789', 'Ciudad A', '12345', NOW(), 150),
(5, 'María', 'García', '555-0202', 'Avenida Sur 321', 'Ciudad B', '67890', NOW(), 200),
(NULL, 'Roberto', 'Sánchez', '555-0203', 'Calle Este 654', 'Ciudad A', '12346', NOW(), 50),
(NULL, 'Laura', 'Rodríguez', '555-0204', 'Avenida Oeste 987', 'Ciudad C', '11111', NOW(), 300);

-- =====================================================
-- 4. CATEGORÍAS
-- =====================================================
INSERT INTO categorias (nombre, descripcion, estado) VALUES
('Electrónica', 'Productos electrónicos y tecnológicos', 'activa'),
('Computadoras', 'Equipos de cómputo y accesorios', 'activa'),
('Periféricos', 'Dispositivos periféricos para computadoras', 'activa'),
('Audio', 'Equipos de audio y sonido', 'activa'),
('Redes', 'Equipos y accesorios de redes', 'activa');

-- =====================================================
-- 5. PRODUCTOS
-- =====================================================
INSERT INTO productos (categoria_id, nombre, descripcion, precio, stock, stock_minimo, imagen_url, estado) VALUES
(2, 'Laptop HP Pavilion', 'Laptop HP Pavilion 15.6" Intel Core i5 8GB RAM 256GB SSD', 899.99, 15, 5, 'laptop_hp.jpg', 'activo'),
(2, 'Laptop Dell Inspiron', 'Laptop Dell Inspiron 14" Intel Core i7 16GB RAM 512GB SSD', 1299.99, 8, 5, 'laptop_dell.jpg', 'activo'),
(2, 'MacBook Air M2', 'MacBook Air 13" Apple M2 8GB RAM 256GB SSD', 1499.99, 5, 3, 'macbook_air.jpg', 'activo'),
(3, 'Mouse Logitech MX Master', 'Mouse inalámbrico ergonómico Logitech MX Master 3', 99.99, 25, 10, 'mouse_logitech.jpg', 'activo'),
(3, 'Teclado Mecánico Corsair', 'Teclado mecánico RGB Corsair K95 switches Cherry MX', 179.99, 12, 5, 'teclado_corsair.jpg', 'activo'),
(3, 'Webcam Logitech C920', 'Webcam Full HD 1080p con micrófono estéreo', 79.99, 3, 8, 'webcam_logitech.jpg', 'activo'),
(4, 'Audífonos Sony WH-1000XM5', 'Audífonos inalámbricos con cancelación de ruido', 399.99, 10, 5, 'audifonos_sony.jpg', 'activo'),
(4, 'Bocinas JBL Flip 6', 'Bocina Bluetooth portátil resistente al agua', 129.99, 20, 8, 'bocinas_jbl.jpg', 'activo'),
(5, 'Router TP-Link AX6000', 'Router Wi-Fi 6 de alto rendimiento', 299.99, 7, 5, 'router_tplink.jpg', 'activo'),
(5, 'Switch Cisco 24 Puertos', 'Switch Gigabit administrable 24 puertos', 449.99, 4, 3, 'switch_cisco.jpg', 'activo');

-- =====================================================
-- 6. MOVIMIENTOS DE INVENTARIO
-- =====================================================
INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, usuario_responsable_id, motivo) VALUES
(1, 'entrada', 20, 2, 'Compra inicial de inventario'),
(2, 'entrada', 15, 2, 'Compra inicial de inventario'),
(3, 'entrada', 10, 2, 'Compra inicial de inventario'),
(4, 'entrada', 50, 2, 'Compra inicial de inventario'),
(5, 'entrada', 20, 2, 'Compra inicial de inventario'),
(6, 'entrada', 15, 2, 'Compra inicial de inventario'),
(1, 'salida', 5, 2, 'Venta a cliente'),
(2, 'salida', 7, 3, 'Venta a cliente'),
(4, 'salida', 25, 2, 'Venta múltiple'),
(5, 'salida', 8, 3, 'Venta a cliente');

-- =====================================================
-- 7. VENTAS
-- =====================================================
INSERT INTO ventas (cliente_id, empleado_id, total, metodo_pago, estado) VALUES
(1, 1, 1079.98, 'tarjeta', 'completada'),
(2, 2, 1299.99, 'efectivo', 'completada'),
(3, 1, 279.98, 'transferencia', 'completada'),
(1, 2, 99.99, 'tarjeta', 'completada'),
(4, 1, 529.98, 'tarjeta', 'completada');

-- =====================================================
-- 8. DETALLES DE VENTAS
-- =====================================================
INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario) VALUES
-- Venta 1
(1, 1, 1, 899.99),
(1, 4, 2, 99.99),
-- Venta 2
(2, 2, 1, 1299.99),
-- Venta 3
(3, 5, 1, 179.99),
(3, 4, 1, 99.99),
-- Venta 4
(4, 4, 1, 99.99),
-- Venta 5
(5, 7, 1, 399.99),
(5, 8, 1, 129.99);

-- =====================================================
-- 9. CARRITOS
-- =====================================================
INSERT INTO carritos (usuario_id) VALUES
(4),
(5);

-- =====================================================
-- 10. ITEMS DEL CARRITO
-- =====================================================
INSERT INTO carrito_items (carrito_id, producto_id, cantidad) VALUES
(1, 3, 1),
(1, 9, 1),
(2, 6, 2),
(2, 8, 1);

-- =====================================================
-- 11. PERMISOS
-- =====================================================
INSERT INTO permisos (usuario_id, vista, puede_crear, puede_editar, puede_eliminar, puede_ver) VALUES
-- Admin tiene todos los permisos
(1, 'productos', true, true, true, true),
(1, 'categorias', true, true, true, true),
(1, 'clientes', true, true, true, true),
(1, 'empleados', true, true, true, true),
(1, 'ventas', true, true, true, true),
(1, 'reportes', true, true, true, true),
(1, 'usuarios', true, true, true, true),
(1, 'permisos', true, true, true, true),
(1, 'bitacora', false, false, false, true),
(1, 'notificaciones', true, true, true, true),
-- Vendedor 1 tiene permisos limitados
(2, 'productos', true, true, false, true),
(2, 'categorias', false, false, false, true),
(2, 'clientes', true, true, false, true),
(2, 'ventas', true, false, false, true),
(2, 'reportes', false, false, false, true),
(2, 'notificaciones', false, false, false, true),
-- Vendedor 2 tiene permisos similares
(3, 'productos', true, true, false, true),
(3, 'clientes', true, true, false, true),
(3, 'ventas', true, false, false, true);

-- =====================================================
-- 12. NOTIFICACIONES
-- =====================================================
INSERT INTO notificaciones (usuario_id, titulo, mensaje, leida) VALUES
(2, 'Stock bajo', 'El producto "Webcam Logitech C920" tiene stock crítico (3 unidades)', false),
(2, 'Nueva venta', 'Se ha completado una nueva venta por $1,079.98', true),
(3, 'Stock bajo', 'Hay 1 producto con stock por debajo del mínimo', false),
(1, 'Sistema', 'Bienvenido al sistema SmartSale', true),
(4, 'Compra exitosa', 'Tu compra ha sido procesada exitosamente', true);

-- =====================================================
-- 13. DISPOSITIVOS DE USUARIO (para notificaciones push)
-- =====================================================
INSERT INTO dispositivos_usuario (usuario_id, dispositivo_tipo, fcm_token) VALUES
(1, 'web', 'fcm_token_admin_web_12345'),
(2, 'android', 'fcm_token_vendedor1_android_67890'),
(3, 'web', 'fcm_token_vendedor2_web_abcde'),
(4, 'ios', 'fcm_token_cliente1_ios_fghij');

-- =====================================================
-- 14. REPORTES LOG
-- =====================================================
INSERT INTO reportes_log (usuario_id, prompt_original, tipo_archivo) VALUES
(1, 'Generar reporte de ventas del mes de octubre', 'PDF'),
(2, 'Mostrar inventario con productos críticos', 'EXCEL'),
(1, 'Reporte de clientes activos con más compras', 'PDF'),
(3, 'Ventas por empleado del último trimestre', 'EXCEL');

-- =====================================================
-- 15. PREDICCIONES DE VENTAS
-- =====================================================
INSERT INTO predicciones_ventas (categoria_id, fecha_prediccion, monto_predicho, modelo_usado, confianza) VALUES
(2, '2025-12-01', 15000.00, 'LSTM Neural Network', 0.87),
(3, '2025-12-01', 8500.00, 'LSTM Neural Network', 0.82),
(4, '2025-12-01', 6200.00, 'LSTM Neural Network', 0.79),
(5, '2025-12-01', 4800.00, 'LSTM Neural Network', 0.75),
(2, '2026-01-01', 16500.00, 'LSTM Neural Network', 0.85);

-- =====================================================
-- 16. BITÁCORA
-- =====================================================
INSERT INTO bitacora (usuario_id, accion, tabla_afectada, registro_id, descripcion, ip_address) VALUES
(1, 'crear', 'usuarios', 2, 'Creación de usuario vendedor1', '192.168.1.100'),
(1, 'crear', 'productos', 1, 'Creación de producto Laptop HP Pavilion', '192.168.1.100'),
(2, 'crear', 'ventas', 1, 'Registro de nueva venta #1', '192.168.1.101'),
(2, 'actualizar', 'productos', 1, 'Actualización de stock del producto #1', '192.168.1.101'),
(3, 'crear', 'ventas', 2, 'Registro de nueva venta #2', '192.168.1.102'),
(1, 'crear', 'clientes', 1, 'Registro de nuevo cliente Juan Pérez', '192.168.1.100'),
(2, 'actualizar', 'clientes', 1, 'Actualización de puntos de fidelidad', '192.168.1.101');

-- =====================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =====================================================
SELECT 'Usuarios insertados:' as tabla, COUNT(*) as cantidad FROM usuarios
UNION ALL
SELECT 'Empleados insertados:', COUNT(*) FROM empleados
UNION ALL
SELECT 'Clientes insertados:', COUNT(*) FROM clientes
UNION ALL
SELECT 'Categorías insertadas:', COUNT(*) FROM categorias
UNION ALL
SELECT 'Productos insertados:', COUNT(*) FROM productos
UNION ALL
SELECT 'Movimientos de inventario:', COUNT(*) FROM movimientos_inventario
UNION ALL
SELECT 'Ventas insertadas:', COUNT(*) FROM ventas
UNION ALL
SELECT 'Detalles de ventas:', COUNT(*) FROM ventas_detalle
UNION ALL
SELECT 'Carritos creados:', COUNT(*) FROM carritos
UNION ALL
SELECT 'Items en carritos:', COUNT(*) FROM carrito_items
UNION ALL
SELECT 'Permisos asignados:', COUNT(*) FROM permisos
UNION ALL
SELECT 'Notificaciones creadas:', COUNT(*) FROM notificaciones
UNION ALL
SELECT 'Dispositivos registrados:', COUNT(*) FROM dispositivos_usuario
UNION ALL
SELECT 'Reportes generados:', COUNT(*) FROM reportes_log
UNION ALL
SELECT 'Predicciones creadas:', COUNT(*) FROM predicciones_ventas
UNION ALL
SELECT 'Registros de bitácora:', COUNT(*) FROM bitacora;
