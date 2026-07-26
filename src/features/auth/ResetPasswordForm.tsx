import React, { useState } from 'react';
import { Input } from '../../shared/Input';
import { Button } from '../../shared/Button';
import { authClient } from '../../app/better-auth';

interface ResetPasswordFormProps {
  onBackToSignIn: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBackToSignIn }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { data, error: resetError } = await authClient.forgetPassword({
        email,
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (resetError) {
        setError(resetError.message || "Failed to send reset link.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper">
      <div className="auth-header">
        <h2>Reset Password</h2>
        <p>Enter your email to receive a reset link</p>
      </div>

      {!success ? (
        <form onSubmit={handleSubmit} className="auth-form">
          <Input 
            label="EMAIL ADDRESS"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          {error && <div className="form-error-banner">{error}</div>}

          <Button type="submit" fullWidth isLoading={isLoading}>
            Send Reset Link
          </Button>
        </form>
      ) : (
        <div className="form-success-banner">
          A password reset link has been sent to your email. Please check your inbox.
        </div>
      )}

      <div className="auth-footer-toggle" style={{ marginTop: '2rem' }}>
        <button type="button" onClick={onBackToSignIn}>← Back to Sign In</button>
      </div>
    </div>
  );
};
