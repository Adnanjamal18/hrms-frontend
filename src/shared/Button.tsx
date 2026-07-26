import React, { type ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  isLoading, 
  fullWidth, 
  className = '', 
  ...props 
}) => {
  return (
    <button 
      className={`btn-primary ${fullWidth ? 'btn-full' : ''} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="btn-spinner"></span>
      ) : (
        <>
          {children}
          <span className="btn-icon">→</span>
        </>
      )}
    </button>
  );
};
