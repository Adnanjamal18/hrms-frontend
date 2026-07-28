import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { activateAccount } from '../api/employees';
import { authClient } from '../app/better-auth';
import { CheckCircle2, XCircle, Sparkles, ArrowRight, Building2, ShieldCheck, UserCheck, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ActivatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Activation token is missing from the link.');
      return;
    }

    let isMounted = true;

    const performActivation = async () => {
      try {
        const res = await activateAccount(token);
        if (isMounted) {
          setStatus('success');
          setMessage(res.message || 'Account activated successfully!');
          setUserInfo(res.user);
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          const msg =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            'Invalid or expired activation link.';
          setMessage(msg);
        }
      }
    };

    performActivation();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSignInAsActivatedUser = async () => {
    try {
      await authClient.signOut();
    } catch (e) {
      // ignore
    }
    navigate('/auth');
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 text-center">
        
        {/* Loading State */}
        {status === 'loading' && (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Activating your Account...</h2>
            <p className="text-slate-400 text-sm">Please wait while we verify your HRMS invitation token.</p>
          </div>
        )}

        {/* Success / Welcome Screen */}
        {status === 'success' && (
          <div className="py-4 flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Animated Celebration Icon */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={42} />
              </div>
              <div className="absolute -top-2 -right-2 bg-primary text-white p-1.5 rounded-full shadow-md animate-bounce">
                <Sparkles size={14} />
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <UserCheck size={12} /> Account Verified & Activated
              </span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Welcome to HRMS! 🎉
              </h1>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                {userInfo?.fullName
                  ? `Hello ${userInfo.fullName}, your employee account is now active.`
                  : 'Your employee account has been successfully activated.'}
              </p>
            </div>

            {/* Account Card Summary */}
            {userInfo && (
              <div className="w-full bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-left grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Building2 size={12} /> Email Address
                  </p>
                  <p className="text-sm font-semibold text-white truncate">{userInfo.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <ShieldCheck size={12} /> Role
                  </p>
                  <p className="text-sm font-semibold text-emerald-400 capitalize">
                    {userInfo.role?.rolename || 'Employee'}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="w-full pt-4 flex flex-col gap-3">
              <Button
                onClick={handleSignInAsActivatedUser}
                className="w-full py-6 text-base font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 gap-2 group"
              >
                <LogOut size={18} />
                Sign In as {userInfo?.fullName || 'Activated Employee'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full py-5 text-sm font-semibold border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Error Screen */}
        {status === 'error' && (
          <div className="py-6 flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/10">
              <XCircle size={42} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Activation Failed</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">{message}</p>
            </div>

            <div className="pt-2 w-full">
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                className="w-full border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl"
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
