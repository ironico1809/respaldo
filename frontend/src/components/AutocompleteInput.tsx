import React, { useState, useEffect, useRef } from 'react';
import './AutocompleteInput.css';

interface AutocompleteOption {
  value: string;
  label: string;
  metadata?: any;
}

interface AutocompleteInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string, option?: AutocompleteOption) => void;
  placeholder?: string;
  options: AutocompleteOption[];
  minChars?: number;
  maxSuggestions?: number;
  required?: boolean;
  disabled?: boolean;
  type?: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  options,
  minChars = 1,
  maxSuggestions = 5,
  required = false,
  disabled = false,
  type = 'text'
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length >= minChars) {
      const filtered = options
        .filter(option => 
          option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
          option.value.toLowerCase().includes(inputValue.toLowerCase())
        )
        .slice(0, maxSuggestions);
      
      setFilteredOptions(filtered);
      setShowSuggestions(filtered.length > 0);
      setHighlightedIndex(-1);
    } else {
      setShowSuggestions(false);
      setFilteredOptions([]);
    }
  };

  const handleSuggestionClick = (option: AutocompleteOption) => {
    onChange(option.value, option);
    setShowSuggestions(false);
    setFilteredOptions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSuggestionClick(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setFilteredOptions([]);
        break;
    }
  };

  const handleFocus = () => {
    if (value.length >= minChars && filteredOptions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <label htmlFor={id} className="autocomplete-label">
        {label}
        {required && <span className="required-indicator">*</span>}
      </label>
      <div className="autocomplete-input-container">
        <input
          ref={inputRef}
          id={id}
          type={type}
          className="autocomplete-input"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
        />
        {showSuggestions && filteredOptions.length > 0 && (
          <ul className="autocomplete-suggestions">
            {filteredOptions.map((option, index) => (
              <li
                key={`${option.value}-${index}`}
                className={`autocomplete-suggestion-item ${
                  index === highlightedIndex ? 'highlighted' : ''
                }`}
                onClick={() => handleSuggestionClick(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="suggestion-label">{option.label}</div>
                {option.value !== option.label && (
                  <div className="suggestion-value">{option.value}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AutocompleteInput;
