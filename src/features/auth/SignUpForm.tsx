import React, { useState } from 'react';
import { Input } from '../../shared/Input';
import { Button } from '../../shared/Button';
import { authClient } from '../../app/better-auth';

interface SignUpFormProps {
  onToggleSignIn: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleSignIn }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name: fullName,
        username: email.split('@')[0], // Auto-generated from email
        mobile: "0000000000",          // Default fallback
        roleId: 2, // Default role ID (Employee)
      } as any);

      if (signUpError) {
        setError(signUpError.message || "Failed to sign up.");
      } else {
        console.log("Signed up successfully:", data);
        window.location.href = '/';
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
        <h2>Create an account</h2>
        <p>Join the enterprise dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <Input
          label="FULL NAME"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

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
          required
        />

        {error && <div className="form-error-banner">{error}</div>}

        <Button type="submit" fullWidth isLoading={isLoading}>
          Sign Up
        </Button>
      </form>

      <div className="auth-footer-toggle">
        Already have an account? <button type="button" onClick={onToggleSignIn}>Sign In</button>
      </div>
    </div>
  );
};
