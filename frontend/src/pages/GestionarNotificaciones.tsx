import React, { useState, useEffect } from 'react';
import './GestionarNotificaciones.css';
import DeleteButton from '../components/DeleteButton';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import notificacionService from '../services/notificacionService';

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_envio: string;
}

const GestionarNotificaciones: React.FC = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [errorForm, setErrorForm] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const cargarNotificaciones = async () => {
    try {
      setCargando(true);
  // Reemplaza 1 por el id del usuario actual si tienes contexto
  const data = await notificacionService.getMisNotificaciones(1);
  setNotificaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  const crearNotificacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTitulo.trim() || !nuevoMensaje.trim()) {
      setErrorForm('Completa ambos campos');
      return;
    }
    try {
      setCargando(true);
      // Si el backend requiere usuario, agregar usuario_id aquí
      const nueva = await notificacionService.create({
        usuario: 1, // Reemplaza por el id del usuario actual
        titulo: nuevoTitulo,
        mensaje: nuevoMensaje,
        leida: false,
      });
      setNotificaciones([nueva, ...notificaciones]);
      setNuevoTitulo('');
      setNuevoMensaje('');
      setErrorForm('');
      setModalAbierto(false);
    } catch (error) {
      console.error('Error al crear notificación:', error);
      setErrorForm('Error al crear la notificación');
    } finally {
      setCargando(false);
    }
  };

  const marcarComoLeida = async (id: number) => {
    try {
      await notificacionService.marcarLeida(id);
      setNotificaciones(
        notificaciones.map((notif) =>
          notif.id === id ? { ...notif, leida: true } : notif
        )
      );
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const eliminarNotificacion = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta notificación?')) {
      try {
  await notificacionService.delete(id);
  setNotificaciones(notificaciones.filter((notif) => notif.id !== id));
      } catch (error) {
        console.error('Error al eliminar notificación:', error);
      }
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
    <div className="gestionar-notificaciones">
      <div className="header-notificaciones">
        <h1>Notificaciones</h1>
        <Button className="btn-flotante-notificacion btn-primary" onClick={() => setModalAbierto(true)}>
          + Crear notificación
        </Button>
      </div>

      {modalAbierto && (
        <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title="Crear notificación">
          <form className="form-notificacion" onSubmit={crearNotificacion}>
            <Input
              id="titulo-notificacion"
              label="Título"
              value={nuevoTitulo}
              onChange={e => setNuevoTitulo(e.target.value)}
              placeholder="Título de la notificación"
              className="input-modal"
            />
            <div className="form-group">
              <label htmlFor="mensaje-notificacion">Mensaje</label>
              <textarea
                id="mensaje-notificacion"
                className="textarea-modal"
                placeholder="Mensaje de la notificación"
                value={nuevoMensaje}
                onChange={e => setNuevoMensaje(e.target.value)}
                rows={4}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div className="modal-notificacion-actions">
              <Button type="submit" className="btn-primary btn-crear-notificacion">Crear</Button>
              <Button type="button" className="btn-secondary btn-cancelar-notificacion" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            </div>
            {errorForm && <div className="error-form">{errorForm}</div>}
          </form>
        </Modal>
      )}

      <div className="lista-notificaciones">
        {cargando ? (
          <div className="sin-notificaciones">
            <p>Cargando notificaciones...</p>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="sin-notificaciones">
            <p>No tienes notificaciones</p>
          </div>
        ) : (
          notificaciones.map((notif) => (
            <div
              key={notif.id}
              className={`notificacion-item ${notif.leida ? 'leida' : 'no-leida'}`}
            >
              <div className="notificacion-contenido">
                <div className="notificacion-header">
                  <h3>{notif.titulo}</h3>
                  <span className="fecha">{formatearFecha(notif.fecha_envio)}</span>
                </div>
                <p className="mensaje">{notif.mensaje}</p>
              </div>
              <div className="notificacion-acciones">
                {!notif.leida && (
                  <Button
                    type="button"
                    className="btn-secondary btn-marcar-leida"
                    onClick={() => marcarComoLeida(notif.id)}
                  >
                    ✓
                  </Button>
                )}
                <DeleteButton onClick={() => eliminarNotificacion(notif.id)} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GestionarNotificaciones;
