import React, { useState, useEffect } from 'react';
import './GestionarReportes.css';
import Button from '../components/Button';
import DeleteButton from '../components/DeleteButton';
import reporteService from '../services/reporteService';

interface Reporte {
  id: number;
  usuario: number;
  usuario_username?: string;
  prompt_original: string;
  tipo_archivo: 'PDF' | 'EXCEL';
  fecha_generacion: string;
}

const GestionarReportes: React.FC = () => {
  const [reportes, setReportes] = useState<Reporte[]>([]);

  const [escuchando, setEscuchando] = useState(false);
  const [transcripcion, setTranscripcion] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [comandoTemp, setComandoTemp] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    try {
      setCargando(true);
  // Reemplaza 1 por el id del usuario actual si tienes contexto
  const data = await reporteService.getMisReportes(1);
      // Mapeo para asegurar que prompt_original siempre sea string
      setReportes(Array.isArray(data)
        ? data.map((r) => ({
            ...r,
            prompt_original: r.prompt_original ?? '',
          }))
        : []);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setCargando(false);
    }
  };

  const iniciarGrabacion = () => {
    setEscuchando(true);
    setTranscripcion('');
    // Simulación de reconocimiento de voz
    setTimeout(() => {
      const ejemplos = [
        'Generar reporte de ventas',
        'Generar reporte de inventario crítico',
        'Generar reporte de clientes activos',
        'Generar reporte de bitácora de actividades'
      ];
      const ejemplo = ejemplos[Math.floor(Math.random() * ejemplos.length)];
      setTranscripcion(ejemplo);
      setEscuchando(false);
    }, 2000);
  };

  const detenerGrabacion = () => {
    setEscuchando(false);
    if (transcripcion.trim()) {
      procesarComando(transcripcion);
    }
  };

  const procesarComando = (comando: string) => {
    const comandoLower = comando.toLowerCase();
    
    // Verificar si menciona un tipo de reporte reconocible
    const reconocido = comandoLower.includes('venta') || 
                       comandoLower.includes('inventario') || 
                       comandoLower.includes('cliente') || 
                       comandoLower.includes('bitácora') ||
                       comandoLower.includes('bitacora') ||
                       comandoLower.includes('actividad');
    
    if (reconocido) {
      setComandoTemp(comando);
      setMostrarOpciones(true);
    } else {
      alert('No se reconoció el tipo de reporte. Intenta: "Generar reporte de ventas", "Generar reporte de inventario", etc.');
      setTranscripcion('');
    }
  };

  const generarReporte = async (tipoArchivo: 'PDF' | 'EXCEL') => {
    setProcesando(true);
    setMostrarOpciones(false);
    
    try {
      const nuevoReporte = await reporteService.generar({
        usuario: 1, // Reemplaza por el id del usuario actual
        prompt_original: comandoTemp,
        tipo_archivo: tipoArchivo,
      });
      setReportes([
        {
          ...nuevoReporte,
          prompt_original: nuevoReporte.prompt_original ?? '',
        },
        ...reportes,
      ]);
      setTranscripcion('');
      setComandoTemp('');
      alert(`Reporte generado exitosamente en formato ${tipoArchivo}`);
    } catch (error) {
      console.error('Error al generar reporte:', error);
      alert('Error al generar el reporte');
    } finally {
      setProcesando(false);
    }
  };

  const eliminarReporte = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este reporte?')) {
      try {
        await reporteService.delete(id);
        setReportes(reportes.filter((r) => r.id !== id));
      } catch (error) {
        console.error('Error al eliminar reporte:', error);
      }
    }
  };

  const descargarReporte = (reporte: Reporte, formato: 'PDF' | 'EXCEL') => {
    alert(`Descargando reporte en formato ${formato}: ${reporte.prompt_original}`);
    // Aquí iría la lógica real de descarga
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="gestionar-reportes">
      <div className="header-reportes">
        <h1>Generador de Reportes por Voz</h1>
      </div>

      <div className="panel-voz">
        <div className="voz-container">
          <div className={`microfono-visual ${escuchando ? 'activo' : ''} ${procesando ? 'procesando' : ''}`}>
            <button
              className={`btn-microfono ${escuchando ? 'grabando' : ''}`}
              onClick={escuchando ? detenerGrabacion : iniciarGrabacion}
              disabled={procesando}
            >
              {procesando ? (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              ) : escuchando ? (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="2" />
                  <rect x="14" y="4" width="4" height="16" rx="2" />
                </svg>
              ) : (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </button>
            {escuchando && (
              <div className="ondas-sonido">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>

          <div className="voz-info">
            <h2>
              {procesando
                ? 'Generando reporte...'
                : escuchando
                ? 'Escuchando...'
                : 'Presiona el micrófono para hablar'}
            </h2>
            <p className="instrucciones">
              {escuchando
                ? 'Dí qué reporte deseas generar. Ejemplo: "Genera un reporte de ventas de este mes"'
                : 'Usa tu voz para solicitar reportes del sistema'}
            </p>
          </div>

          <div className="input-alternativo">
            <input
              type="text"
              placeholder="O escribe tu solicitud aquí..."
              value={transcripcion}
              onChange={(e) => setTranscripcion(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && transcripcion.trim()) {
                  procesarComando(transcripcion);
                }
              }}
              disabled={procesando}
              className="input-texto"
            />
            <Button
              className="btn-primary"
              onClick={() => transcripcion.trim() && procesarComando(transcripcion)}
              disabled={!transcripcion.trim() || procesando}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Enviar
            </Button>
          </div>
        </div>

        <div className="sugerencias-comandos">
          <h3>Comandos sugeridos:</h3>
          <div className="grid-sugerencias">
            <button
              className="sugerencia-btn"
              onClick={() => setTranscripcion('Genera un reporte de ventas del último mes')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Reporte de ventas
            </button>
            <button
              className="sugerencia-btn"
              onClick={() => setTranscripcion('Muestra el inventario con productos críticos')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              Inventario crítico
            </button>
            <button
              className="sugerencia-btn"
              onClick={() => setTranscripcion('Lista de clientes activos en Excel')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Clientes activos
            </button>
            <button
              className="sugerencia-btn"
              onClick={() => setTranscripcion('Reporte de actividades de la bitácora')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Bitácora de actividades
            </button>
          </div>
        </div>
      </div>

      {/* Modal de opciones de formato */}
      {mostrarOpciones && (
        <div className="modal-overlay" onClick={() => setMostrarOpciones(false)}>
          <div className="modal-opciones" onClick={(e) => e.stopPropagation()}>
            <h3>¿En qué formato deseas el reporte?</h3>
            <p className="comando-reconocido">"{comandoTemp}"</p>
            <div className="opciones-formato">
              <button
                className="opcion-btn pdf"
                onClick={() => generarReporte('PDF')}
                disabled={procesando}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                <span>PDF</span>
              </button>
              <button
                className="opcion-btn excel"
                onClick={() => generarReporte('EXCEL')}
                disabled={procesando}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                </svg>
                <span>Excel</span>
              </button>
            </div>
            <button 
              className="btn-cancelar"
              onClick={() => {
                setMostrarOpciones(false);
                setTranscripcion('');
                setComandoTemp('');
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="seccion-historial">
        <h2>Reportes Generados</h2>
        {cargando ? (
          <div className="sin-reportes">
            <p>Cargando reportes...</p>
          </div>
        ) : reportes.length === 0 ? (
          <div className="sin-reportes">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p>No hay reportes generados todavía</p>
          </div>
        ) : (
          <div className="lista-reportes">
            {reportes.map((reporte) => (
              <div key={reporte.id} className="item-reporte">
                <div className="reporte-icono">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="reporte-info">
                  <div className="reporte-titulo">
                    <h4>{reporte.prompt_original}</h4>
                    <span className={`badge-tipo ${reporte.tipo_archivo.toLowerCase()}`}>
                      {reporte.tipo_archivo}
                    </span>
                  </div>
                  <div className="reporte-meta">
                    <span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {reporte.usuario_username || 'Usuario'}
                    </span>
                    <span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {formatearFecha(reporte.fecha_generacion)}
                    </span>
                  </div>
                </div>
                <div className="reporte-acciones">
                  <Button
                    className="btn-descargar btn-pdf"
                    onClick={() => descargarReporte(reporte, 'PDF')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    PDF
                  </Button>
                  <Button
                    className="btn-descargar btn-excel"
                    onClick={() => descargarReporte(reporte, 'EXCEL')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Excel
                  </Button>
                  <DeleteButton onClick={() => eliminarReporte(reporte.id)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionarReportes;
