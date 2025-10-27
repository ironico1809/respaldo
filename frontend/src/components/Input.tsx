import React from 'react';
import type { ChangeEvent } from 'react';
import './Input.css';

interface InputProps {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({ id, label, type = 'text', value, onChange, placeholder, disabled, autoComplete, className }) => {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={className}
      />
    </div>
  );
};

export default Input;
