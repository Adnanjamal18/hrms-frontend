import React, { type InputHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  actionLabel, 
  onActionClick, 
  ...props 
}) => {
  return (
    <div className="input-group">
      <div className="input-header">
        <label className="input-label">{label}</label>
        {actionLabel && (
          <button 
            type="button" 
            className="input-action-btn" 
            onClick={onActionClick}
          >
            {actionLabel}
          </button>
        )}
      </div>
      <input 
        className={`input-field ${error ? 'input-error' : ''}`} 
        {...props} 
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};
