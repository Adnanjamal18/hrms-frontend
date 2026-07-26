import React from 'react';
import './AuthLayout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-layout-container">
      {/* Left Side - Branding */}
      <div className="auth-branding-side dotted-bg">
        <div className="auth-branding-content">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              {/* Simplified building icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <path d="M9 22v-4h6v4"></path>
                <path d="M8 6h.01"></path>
                <path d="M16 6h.01"></path>
                <path d="M12 6h.01"></path>
                <path d="M12 10h.01"></path>
                <path d="M12 14h.01"></path>
                <path d="M16 10h.01"></path>
                <path d="M16 14h.01"></path>
                <path d="M8 10h.01"></path>
                <path d="M8 14h.01"></path>
              </svg>
            </div>
            <span className="auth-logo-text">HRMS Enterprise</span>
          </div>

          <div className="auth-hero-text">
            <h1>Powering the future<br/>of human capital.</h1>
            <p>A unified platform for workforce management,<br/>recruitment, and payroll excellence.</p>
          </div>

          <div className="auth-stats-footer">
            <div className="stat-item">
              <span className="stat-label">WORKFORCE SIZE</span>
              <strong className="stat-value">50k+</strong>
              <span className="stat-desc">Employees Managed</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">OPERATIONS</span>
              <strong className="stat-value">1.2k</strong>
              <span className="stat-desc">Projects Delivered</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">FINANCIAL THROUGHPUT</span>
              <strong className="stat-value">$4B</strong>
              <span className="stat-desc">Payroll Processed</span>
            </div>
          </div>
          
          <div className="auth-copyright">
            © 2024 HRMS ENTERPRISE SOLUTIONS. SYSTEM STATUS: <span className="status-nominal">NOMINAL.</span>
          </div>
        </div>
      </div>

      {/* Right Side - Forms */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          {children}
        </div>
      </div>
    </div>
  );
};
