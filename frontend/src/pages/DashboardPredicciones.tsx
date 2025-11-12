import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import './DashboardPredicciones.css';

interface VentaHistorica {
  mes: string;
  total: number;
  cantidad: number;
}

interface Prediccion {
  mes?: string;
  fecha?: string;
  prediccion: number;
  año?: number;
  mes_numero?: number;
}

interface ProductoTop {
  nombre: string;
  cantidad: number;
}

interface DashboardData {
  ventas_historicas: VentaHistorica[];
  predicciones_mensuales: Prediccion[];
  predicciones_diarias: Prediccion[];
  productos_top: ProductoTop[];
  modelo_entrenado: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DashboardPredicciones: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entrenando, setEntrenando] = useState(false);
  const [vistaActual, setVistaActual] = useState<'mensual' | 'diario'>('mensual');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/predicciones/dashboard/');
      const result = await response.json();

      if (result.success) {
        setData(result);
      } else {
        setError(result.error || 'Error al cargar datos');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const entrenarModelo = async () => {
    try {
      setEntrenando(true);
      
      const response = await fetch('http://localhost:8000/api/predicciones/predicciones/entrenar_modelo/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usar_datos_reales: true })
      });

      const result = await response.json();

      if (result.success) {
        alert(`Modelo entrenado exitosamente!\n\nMétricas:\n- R² Score: ${result.metricas.r2_score.toFixed(4)}\n- RMSE: ${result.metricas.rmse.toFixed(2)}\n- Muestras: ${result.metricas.n_samples}\n- Tipo: ${result.metricas.data_type}`);
        await cargarDatos();
      } else {
        alert('Error al entrenar modelo: ' + result.error);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error de conexión');
    } finally {
      setEntrenando(false);
    }
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 0
    }).format(valor);
  };

  const combinarDatosHistoricosYPredicciones = () => {
    if (!data) return [];

    const historicos = data.ventas_historicas.map(v => ({
      periodo: v.mes,
      real: v.total,
      tipo: 'Histórico'
    }));

    const predicciones = data.predicciones_mensuales.map(p => ({
      periodo: p.mes,
      prediccion: p.prediccion,
      tipo: 'Predicción'
    }));

    return [...historicos, ...predicciones];
  };

  if (cargando) {
    return (
      <div className="dashboard-predicciones">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando dashboard de predicciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-predicciones">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={cargarDatos} className="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const datosCombinados = combinarDatosHistoricosYPredicciones();
  const totalHistorico = data?.ventas_historicas.reduce((sum, v) => sum + v.total, 0) || 0;
  const totalPredicho = data?.predicciones_mensuales.reduce((sum, p) => sum + p.prediccion, 0) || 0;
  const promedioMensual = totalHistorico / (data?.ventas_historicas.length || 1);

  return (
    <div className="dashboard-predicciones">
      <div className="dashboard-header">
        <h1>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="20" x2="12" y2="10"></line>
            <line x1="18" y1="20" x2="18" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="16"></line>
          </svg>
          Dashboard de Predicción de Ventas
        </h1>
        <div className="dashboard-actions">
          <button 
            onClick={entrenarModelo} 
            className="btn-entrenar"
            disabled={entrenando}
          >
            {entrenando ? (
              <>
                <div className="spinner-small"></div>
                Entrenando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Entrenar Modelo
              </>
            )}
          </button>
          <span className={`estado-modelo ${data?.modelo_entrenado ? 'entrenado' : 'no-entrenado'}`}>
            {data?.modelo_entrenado ? '✓ Modelo entrenado' : '⚠ Modelo no entrenado'}
          </span>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon ventas">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Histórico</p>
            <p className="stat-value">{formatearMoneda(totalHistorico)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon prediccion">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Predicción 6 Meses</p>
            <p className="stat-value">{formatearMoneda(totalPredicho)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon promedio">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Promedio Mensual</p>
            <p className="stat-value">{formatearMoneda(promedioMensual)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon productos">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Productos Analizados</p>
            <p className="stat-value">{data?.productos_top.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Gráfico principal: Ventas históricas vs Predicciones */}
      <div className="chart-container">
        <h2>Ventas Históricas vs Predicciones Mensuales</h2>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={datosCombinados}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="periodo" />
            <YAxis tickFormatter={(value) => `Bs ${(value / 1000).toFixed(0)}k`} />
            <Tooltip 
              formatter={(value: number) => formatearMoneda(value)}
              labelFormatter={(label) => `Período: ${label}`}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="real" 
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.6}
              name="Ventas Reales"
            />
            <Area 
              type="monotone" 
              dataKey="prediccion" 
              stroke="#82ca9d" 
              fill="#82ca9d" 
              fillOpacity={0.6}
              name="Predicciones"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Vista de predicciones diarias/mensuales */}
      <div className="chart-container">
        <div className="chart-header">
          <h2>Predicciones Detalladas</h2>
          <div className="chart-toggle">
            <button 
              className={vistaActual === 'mensual' ? 'active' : ''}
              onClick={() => setVistaActual('mensual')}
            >
              Mensual
            </button>
            <button 
              className={vistaActual === 'diario' ? 'active' : ''}
              onClick={() => setVistaActual('diario')}
            >
              Diario (30 días)
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          {vistaActual === 'mensual' ? (
            <BarChart data={data?.predicciones_mensuales || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(value) => `Bs ${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatearMoneda(value)} />
              <Legend />
              <Bar dataKey="prediccion" fill="#82ca9d" name="Predicción" />
            </BarChart>
          ) : (
            <LineChart data={data?.predicciones_diarias || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="fecha" 
                tickFormatter={(value) => {
                  const fecha = new Date(value);
                  return `${fecha.getDate()}/${fecha.getMonth() + 1}`;
                }}
              />
              <YAxis tickFormatter={(value) => `Bs ${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number) => formatearMoneda(value)}
                labelFormatter={(label) => `Fecha: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="prediccion" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Predicción Diaria"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Productos más vendidos */}
      <div className="productos-container">
        <h2>Productos Más Vendidos</h2>
        <div className="productos-grid">
          {data?.productos_top.map((producto, index) => (
            <div key={index} className="producto-card">
              <div className="producto-rank" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                #{index + 1}
              </div>
              <div className="producto-info">
                <h3>{producto.nombre}</h3>
                <p className="producto-cantidad">{producto.cantidad} unidades vendidas</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico de pie para productos */}
      {data && data.productos_top.length > 0 && (
        <div className="chart-container">
          <h2>Distribución de Ventas por Producto</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={data.productos_top as any}
                dataKey="cantidad"
                nameKey="nombre"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={(props) => props.payload?.nombre}
              >
                {data.productos_top.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DashboardPredicciones;
