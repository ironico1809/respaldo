
import React, { useState, useEffect } from 'react';
import './Dashboard.css';

// Interfaces para mockup data
interface ProductoCritico {
  id: number;
  nombre: string;
  stock: number;
  stock_minimo: number;
}

interface ProductoMasVendido {
  id: number;
  nombre: string;
  cantidad_vendida: number;
  total_ventas: number;
}

const Dashboard: React.FC = () => {
  const [inventarioCritico, setInventarioCritico] = useState<ProductoCritico[]>([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState<ProductoMasVendido[]>([]);

  useEffect(() => {
    // Mockup de inventario crítico
    setInventarioCritico([
      { id: 1, nombre: 'Microondas Panasonic', stock: 3, stock_minimo: 5 },
      { id: 2, nombre: 'Lavadora Samsung', stock: 2, stock_minimo: 5 },
      { id: 3, nombre: 'Ventilador de Pie', stock: 4, stock_minimo: 8 },
    ]);

    // Mockup de productos más vendidos
    setProductosMasVendidos([
      { id: 1, nombre: 'Refrigeradora LG', cantidad_vendida: 45, total_ventas: 157500 },
      { id: 2, nombre: 'TV Sony 55"', cantidad_vendida: 38, total_ventas: 159600 },
      { id: 3, nombre: 'Cocina Mabe', cantidad_vendida: 32, total_ventas: 60800 },
    ]);
  }, []);

  return (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon primary">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm1 15.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zM12 4c4.97 0 9 4.03 9 9 0 4.08-3.05 7.44-7 7.93V17c0-1.1-.9-2-2-2h-1v-2h1c.55 0 1-.45 1-1s-.45-1-1-1h-1V9h2V7h-2V6c0-1.1.9-2 2-2V4z" fill="#2176FF"/></svg>
                </div>
                <span className="stat-trend up">↑ 12.5%</span>
              </div>
              <div className="stat-value">Bs 45,250</div>
              <div className="stat-label">Ventas del día</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon success">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4.07a2 2 0 0 0-2 0l-7 4.07A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4.07a2 2 0 0 0 2 0l7-4.07A2 2 0 0 0 21 16zM12 4.15l7 4.07-7 4.07-7-4.07 7-4.07zM5 8.92l7 4.07v6.15l-7-4.07V8.92zm14 6.15l-7 4.07v-6.15l7-4.07v6.15z" fill="#2ED573"/></svg>
                </div>
                <span className="stat-trend up">↑ 8.3%</span>
              </div>
              <div className="stat-value">328</div>
              <div className="stat-label">Productos en stock</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon warning">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14l.84-2h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12z" fill="#FF9F43"/></svg>
                </div>
                <span className="stat-trend up">↑ 5.7%</span>
              </div>
              <div className="stat-value">42</div>
              <div className="stat-label">Pedidos pendientes</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon danger">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5s-3 1.34-3 3 1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C15.64 13.36 17 14.28 17 15.5V19h5v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="#FF4757"/></svg>
                </div>
                <span className="stat-trend down">↓ 2.1%</span>
              </div>
              <div className="stat-value">1,245</div>
              <div className="stat-label">Clientes activos</div>
            </div>
          </div>
          <div className="content-grid">
            {/* Inventario Crítico */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">⚠️ Inventario Crítico</h2>
                <a href="/gestionar-inventario" className="card-action">Ver inventario →</a>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Stock Actual</th>
                      <th>Stock Mínimo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventarioCritico.map(producto => (
                      <tr key={producto.id}>
                        <td>{producto.nombre}</td>
                        <td>{producto.stock}</td>
                        <td>{producto.stock_minimo}</td>
                        <td><span className="status-badge warning">Crítico</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Productos Más Vendidos */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">🔥 Productos Más Vendidos</h2>
                <a href="#" className="card-action">Ver más →</a>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Total Ventas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosMasVendidos.map(producto => (
                      <tr key={producto.id}>
                        <td>{producto.nombre}</td>
                        <td>{producto.cantidad_vendida}</td>
                        <td>Bs {producto.total_ventas.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Ventas Recientes</h2>
                <a href="#" className="card-action">Ver todas →</a>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Producto</th>
                      <th>Monto</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#1254</td>
                      <td>María González</td>
                      <td>Refrigeradora LG</td>
                      <td>Bs 3,500</td>
                      <td><span className="status-badge completed">Completado</span></td>
                    </tr>
                    <tr>
                      <td>#1253</td>
                      <td>Carlos Pérez</td>
                      <td>Lavadora Samsung</td>
                      <td>Bs 2,800</td>
                      <td><span className="status-badge pending">Pendiente</span></td>
                    </tr>
                    <tr>
                      <td>#1252</td>
                      <td>Ana Rodríguez</td>
                      <td>Microondas Panasonic</td>
                      <td>Bs 650</td>
                      <td><span className="status-badge completed">Completado</span></td>
                    </tr>
                    <tr>
                      <td>#1251</td>
                      <td>Luis Martínez</td>
                      <td>TV Sony 55"</td>
                      <td>Bs 4,200</td>
                      <td><span className="status-badge cancelled">Cancelado</span></td>
                    </tr>
                    <tr>
                      <td>#1250</td>
                      <td>Sofia Torres</td>
                      <td>Cocina Mabe</td>
                      <td>Bs 1,900</td>
                      <td><span className="status-badge completed">Completado</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Actividad Reciente</h2>
              </div>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14l.84-2h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12z" fill="#2176FF"/></svg>
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">Nueva venta registrada</div>
                    <div className="activity-description">Refrigeradora LG - Bs 3,500</div>
                    <div className="activity-time">Hace 5 minutos</div>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4.07a2 2 0 0 0-2 0l-7 4.07A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4.07a2 2 0 0 0 2 0l7-4.07A2 2 0 0 0 21 16zM12 4.15l7 4.07-7 4.07-7-4.07 7-4.07zM5 8.92l7 4.07v6.15l-7-4.07V8.92zm14 6.15l-7 4.07v-6.15l7-4.07v6.15z" fill="#2ED573"/></svg>
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">Producto agregado</div>
                    <div className="activity-description">15 Microondas Panasonic</div>
                    <div className="activity-time">Hace 1 hora</div>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="#2176FF"/></svg>
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">Nuevo cliente</div>
                    <div className="activity-description">María González registrada</div>
                    <div className="activity-time">Hace 2 horas</div>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm1 15.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zM12 4c4.97 0 9 4.03 9 9 0 4.08-3.05 7.44-7 7.93V17c0-1.1-.9-2-2-2h-1v-2h1c.55 0 1-.45 1-1s-.45-1-1-1h-1V9h2V7h-2V6c0-1.1.9-2 2-2V4z" fill="#2ED573"/></svg>
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">Pago recibido</div>
                    <div className="activity-description">Pedido #1248 - Bs 2,800</div>
                    <div className="activity-time">Hace 3 horas</div>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M20 8h-3V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h1a2 2 0 0 0 4 0h4a2 2 0 0 0 4 0h1a1 1 0 0 0 1-1v-5l-3-3zm-7 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm8-2h-1a2 2 0 0 0-4 0h-4a2 2 0 0 0-4 0H4V4h12v4h4v7z" fill="#2176FF"/></svg>
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">Envío programado</div>
                    <div className="activity-description">Lavadora Samsung</div>
                    <div className="activity-time">Hace 4 horas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
  );
};

export default Dashboard;
