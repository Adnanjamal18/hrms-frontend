import React, { useState } from 'react';
import { AuthLayout } from '../../layout/AuthLayout';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import './AuthPage.css';

type AuthView = 'signin' | 'signup' | 'reset';

export const AuthPage: React.FC = () => {
  const [view, setView] = useState<AuthView>('signin');

  return (
    <AuthLayout>
      <div className="auth-view-container">
        {view === 'signin' && (
          <SignInForm 
            onToggleSignUp={() => setView('signup')} 
            onToggleReset={() => setView('reset')}
          />
        )}
        {view === 'signup' && (
          <SignUpForm 
            onToggleSignIn={() => setView('signin')} 
          />
        )}
        {view === 'reset' && (
          <ResetPasswordForm 
            onBackToSignIn={() => setView('signin')} 
          />
        )}
      </div>
    </AuthLayout>
  );
};
