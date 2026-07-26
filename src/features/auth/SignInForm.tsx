import React, { useState } from 'react';
import { Input } from '../../shared/Input';
import { Button } from '../../shared/Button';
import { authClient } from '../../app/better-auth';

interface SignInFormProps {
  onToggleSignUp: () => void;
  onToggleReset: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onToggleSignUp, onToggleReset }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await authClient.signIn.email({
        email,
        password,
      });
      
      if (signInError) {
        setError(signInError.message || "Failed to sign in. Please check your credentials.");
      } else {
        // Handle successful sign in (e.g. redirect to dashboard)
        console.log("Signed in successfully:", data);
        window.location.href = '/'; // Simple redirect to dashboard
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
        <h2>Welcome back</h2>
        <p>Access your enterprise dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <Input 
          label="EMAIL ADDRESS"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Input 
          label="PASSWORD"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          actionLabel="Forgot Password?"
          onActionClick={onToggleReset}
          required
        />
        
        {error && <div className="form-error-banner">{error}</div>}

        <Button type="submit" fullWidth isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <div className="auth-footer-toggle">
        Don't have an account? <button type="button" onClick={onToggleSignUp}>Sign Up</button>
      </div>
    </div>
  );
};
