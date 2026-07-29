import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodayStatus, checkIn, checkOut } from '../api/attendance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn, LogOut, Clock, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  userId: string;
}

export function AttendanceWidget({ userId }: Props) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: statusData, isLoading } = useQuery({
    queryKey: ['today-attendance', userId],
    queryFn: () => getTodayStatus(userId),
    enabled: !!userId,
  });

  const checkInMutation = useMutation({
    mutationFn: checkIn,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['today-attendance', userId] });
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-report'] });
      toast.success(res.message || 'Checked in successfully!');
      setNotes('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Check-in failed');
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: checkOut,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['today-attendance', userId] });
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-report'] });
      toast.success(res.message || 'Checked out successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Check-out failed');
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const isCheckedIn = statusData?.isCheckedIn;
  const isCheckedOut = statusData?.isCheckedOut;
  const record = statusData?.record;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">Daily Attendance</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary-foreground text-xs font-semibold border border-primary/30 flex items-center gap-1">
              <Sparkles size={11} /> Live Tracker
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">Record check-in and check-out timestamps</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 font-mono text-sm font-bold text-slate-200">
          <Clock size={16} className="text-primary animate-pulse" />
          {currentTime}
        </div>
      </div>

      {!isCheckedIn ? (
        <div className="space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/40">
            <p className="text-xs text-slate-300 font-medium mb-2">Optional Check-In Notes / Location</p>
            <Input
              placeholder="e.g. Working from office / Remote..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-primary text-sm"
            />
          </div>

          <Button
            onClick={() => checkInMutation.mutate({ userId, notes })}
            disabled={checkInMutation.isPending}
            className="w-full py-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/25 gap-2 text-base"
          >
            {checkInMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <LogIn size={20} />
                Check In Now
              </>
            )}
          </Button>
        </div>
      ) : !isCheckedOut ? (
        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between text-emerald-400">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} />
              <div>
                <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Status: Checked In</p>
                <p className="text-sm font-bold text-white">
                  Since {record?.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'N/A'}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-500/30">
              {record?.status || 'PRESENT'}
            </span>
          </div>

          <Button
            onClick={() => checkOutMutation.mutate({ userId })}
            disabled={checkOutMutation.isPending}
            variant="destructive"
            className="w-full py-6 font-bold rounded-xl shadow-lg gap-2 text-base"
          >
            {checkOutMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <LogOut size={20} />
                Check Out Now
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-xl text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">Attendance Completed Today</h3>
          <p className="text-slate-400 text-xs">
            Check-In: <span className="text-white font-mono">{new Date(record.checkIn).toLocaleTimeString()}</span> • Check-Out:{' '}
            <span className="text-white font-mono">{new Date(record.checkOut!).toLocaleTimeString()}</span>
          </p>
          <div className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30">
            Total Work Hours: {record.workHours || 0} hrs
          </div>
        </div>
      )}
    </div>
  );
}
