import React from 'react';
import './ActionButton.css';

interface InactivarProductoButtonProps {
  onClick: () => void;
}

const InactivarProductoButton: React.FC<InactivarProductoButtonProps> = ({ onClick }) => {
  return (
    <button className="btn-accion btn-inactivar" title="Inactivar" onClick={onClick}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
      </svg>
    </button>
  );
};

export default InactivarProductoButton;