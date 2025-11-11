import React from 'react';
import './ActionButton.css';

interface ViewDetailsButtonProps {
  onClick: () => void;
}

const ViewDetailsButton: React.FC<ViewDetailsButtonProps> = ({ onClick }) => {
  return (
    <button className="btn-accion btn-ver-detalles" title="Ver Detalles" onClick={onClick}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    </button>
  );
};

export default ViewDetailsButton;
