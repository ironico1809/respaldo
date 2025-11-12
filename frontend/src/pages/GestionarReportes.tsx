import React, { useState, useEffect } from 'react';
import './GestionarReportes.css';
import Button from '../components/Button';
import DeleteButton from '../components/DeleteButton';
import reporteService from '../services/reporteService';
import { useBitacora } from '../hooks/useBitacora';

interface Reporte {
  id: number;
  prompt_original: string;
  tipo_reporte: string;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_generacion: string;
}

const GestionarReportes: React.FC = () => {
  const [reportes, setReportes] = useState<Reporte[]>([]);

  const [escuchando, setEscuchando] = useState(false);
  const [transcripcion, setTranscripcion] = useState('');
  const [procesando, setProcesando] = useState(false);

  const { registrar } = useBitacora();

  useEffect(() => {
    // Registrar acceso a la página
    registrar('ACCESO', 'Accedió a Gestionar Reportes');
  }, []);

  const iniciarGrabacion = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setEscuchando(true);
      setTranscripcion('');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTranscripcion(transcript);
      setEscuchando(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Error de reconocimiento:', event.error);
      setEscuchando(false);
      alert('Error al escuchar. Intenta de nuevo.');
    };

    recognition.onend = () => {
      setEscuchando(false);
    };

    recognition.start();
  };

  const detenerGrabacion = () => {
    setEscuchando(false);
    if (transcripcion.trim()) {
      procesarComando(transcripcion);
    }
  };

  const procesarComando = async (comando: string) => {
    const comandoLower = comando.toLowerCase();
    
    // Verificar si menciona un tipo de reporte reconocible
    const reconocido = comandoLower.includes('venta') || 
                       comandoLower.includes('inventario') || 
                       comandoLower.includes('cliente') || 
                       comandoLower.includes('producto') ||
                       comandoLower.includes('bitácora') ||
                       comandoLower.includes('bitacora') ||
                       comandoLower.includes('actividad');
    
    if (reconocido) {
      await generarReporte(comando);
    } else {
      alert('No se reconoció el tipo de reporte. Intenta: "Generar reporte de ventas", "Generar reporte de inventario", etc.');
      setTranscripcion('');
    }
  };

  const generarReporte = async (comando: string) => {
    setProcesando(true);
    
    try {
      // Determinar tipo de reporte y fechas basado en el comando
      const comandoLower = comando.toLowerCase();
      let tipo_reporte = 'ventas';
      let fecha_inicio = '';
      let fecha_fin = '';
      
      // Detectar tipo de reporte
      if (comandoLower.includes('producto') || comandoLower.includes('inventario')) {
        tipo_reporte = 'productos';
      } else if (comandoLower.includes('cliente')) {
        tipo_reporte = 'clientes';
      }
      
      // Detectar período de tiempo
      const hoy = new Date();
      if (comandoLower.includes('hoy')) {
        fecha_inicio = hoy.toISOString().split('T')[0];
        fecha_fin = hoy.toISOString().split('T')[0];
      } else if (comandoLower.includes('semana')) {
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        fecha_inicio = inicioSemana.toISOString().split('T')[0];
        fecha_fin = hoy.toISOString().split('T')[0];
      } else if (comandoLower.includes('mes') || comandoLower.includes('último mes') || comandoLower.includes('ultimo mes')) {
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fecha_inicio = inicioMes.toISOString().split('T')[0];
        fecha_fin = hoy.toISOString().split('T')[0];
      } else {
        // Por defecto: últimos 30 días
        const hace30 = new Date(hoy);
        hace30.setDate(hoy.getDate() - 30);
        fecha_inicio = hace30.toISOString().split('T')[0];
        fecha_fin = hoy.toISOString().split('T')[0];
      }
      
      // Agregar el reporte a la lista local
      const nuevoReporte: Reporte = {
        id: Date.now(),
        prompt_original: comando,
        tipo_reporte,
        fecha_inicio,
        fecha_fin,
        fecha_generacion: new Date().toISOString(),
      };
      
      setReportes([nuevoReporte, ...reportes]);
      
      // Registrar en bitácora
      await registrar('GENERAR_REPORTE', `Generó reporte de ${tipo_reporte} del ${fecha_inicio} al ${fecha_fin}`);
      
      alert(`Reporte de ${tipo_reporte} agregado. Puedes descargarlo en PDF o Excel desde la lista de abajo.`);
      setTranscripcion('');
    } catch (error) {
      console.error('Error al procesar reporte:', error);
      alert('Error al procesar el reporte');
    } finally {
      setProcesando(false);
    }
  };

  const eliminarReporte = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este reporte?')) {
      setReportes(reportes.filter((r) => r.id !== id));
    }
  };

  const descargarReporte = async (reporte: Reporte, formato: 'PDF' | 'EXCEL') => {
    try {
      if (formato === 'PDF') {
        // Generar y descargar PDF
        const response = await fetch('http://localhost:8000/api/reportes/generar_pdf/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tipo: reporte.tipo_reporte,
            fecha_inicio: reporte.fecha_inicio,
            fecha_fin: reporte.fecha_fin
          })
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte_${reporte.tipo_reporte}_${new Date().getTime()}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          
          // Registrar descarga en bitácora
          await registrar('DESCARGAR_PDF', `Descargó reporte ${reporte.tipo_reporte} en PDF`);
          
          alert(`Reporte PDF descargado exitosamente`);
        } else {
          alert('Error al generar reporte PDF');
        }
      } else {
        // Generar y descargar EXCEL
        const excelBlob = await reporteService.generar({
          usuario: 1,
          prompt_original: reporte.prompt_original,
          tipo_archivo: formato,
        });
        
        const url = window.URL.createObjectURL(excelBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_${reporte.tipo_reporte}_${new Date().getTime()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Registrar descarga en bitácora
        await registrar('DESCARGAR_EXCEL', `Descargó reporte ${reporte.tipo_reporte} en Excel`);
        
        alert(`Reporte Excel descargado exitosamente`);
      }
    } catch (error) {
      console.error('Error al descargar reporte:', error);
      alert('Error al descargar el reporte');
    }
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

      <div className="seccion-historial">
        <h2>Reportes Generados</h2>
        {reportes.length === 0 ? (
          <div className="sin-reportes">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p>No hay reportes generados todavía</p>
            <p className="hint-text">Usa el comando de voz o escribe para generar reportes</p>
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
                    <span className={`badge-tipo ${reporte.tipo_reporte}`}>
                      {reporte.tipo_reporte.toUpperCase()}
                    </span>
                  </div>
                  <div className="reporte-meta">
                    <span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {formatearFecha(reporte.fecha_generacion)}
                    </span>
                    <span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {reporte.fecha_inicio} - {reporte.fecha_fin}
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
