import React, { useState, useEffect, useCallback } from 'react';
import './GestionarBitacora.css';
import { getBitacora } from '../services/bitacoraService';

type BitacoraEntry = {
  id: number;
  username: string;
  ip: string;
  fecha_hora: string;
  accion: string;
  descripcion: string;
};

const GestionarBitacora: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [registros, setRegistros] = useState<BitacoraEntry[]>([]);
  const [registrosFiltrados, setRegistrosFiltrados] = useState<BitacoraEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarBitacora = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getBitacora();
      setRegistros(response.data);
      setRegistrosFiltrados(response.data);
    } catch (err) {
      setError('No se pudo cargar la bitácora. Inténtalo de nuevo más tarde.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarBitacora();
  }, [cargarBitacora]);

  const handleBuscar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const termino = e.target.value.toLowerCase();
    setBusqueda(termino);
    setRegistrosFiltrados(
      registros.filter(
        (entry) =>
          entry.username.toLowerCase().includes(termino) ||
          entry.ip.includes(termino) ||
          entry.accion.toLowerCase().includes(termino) ||
          entry.descripcion.toLowerCase().includes(termino)
      )
    );
  };

  return (
    <div className="gestionar-bitacora-container">
      <div className="bitacora-card">
        <div className="bitacora-card-header">
          <span className="bitacora-card-title">Bitácora de Actividad</span>
          <span className="bitacora-card-count">{registrosFiltrados.length} registros</span>
          <input
            className="bitacora-buscar"
            type="text"
            placeholder="Buscar por usuario, IP, acción o descripción..."
            value={busqueda}
            onChange={handleBuscar}
          />
        </div>
        {loading && <p>Cargando bitácora...</p>}
        {error && <p className="form-error-message">{error}</p>}
        <div className="bitacora-table-container">
          <table className="bitacora-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>IP</th>
                <th>Fecha y Hora</th>
                <th>Acción</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {registrosFiltrados.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.id}</td>
                  <td><b>{entry.username}</b></td>
                  <td>{entry.ip}</td>
                  <td>{entry.fecha_hora}</td>
                  <td>{entry.accion}</td>
                  <td>{entry.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GestionarBitacora;