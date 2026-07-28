import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChecklist, updateChecklist, type JoiningChecklist } from '../api/checklist';
import { CheckSquare, Square, CheckCircle2, Clock, ShieldCheck, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  userId: string;
  userName?: string;
}

export function JoiningChecklistWidget({ userId, userName = 'Employee' }: Props) {
  const queryClient = useQueryClient();

  const { data: checklist, isLoading } = useQuery({
    queryKey: ['joining-checklist', userId],
    queryFn: () => getChecklist(userId),
    enabled: !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: updateChecklist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['joining-checklist', userId] });
      queryClient.invalidateQueries({ queryKey: ['all-checklists'] });
      toast.success('Checklist item updated!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update checklist');
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const items = [
    {
      key: 'documentsSubmitted',
      label: 'ID & Verification Documents Submitted',
      description: 'Passport, ID proof, address verification submitted',
      checked: !!checklist?.documentsSubmitted,
    },
    {
      key: 'bankDetailsVerified',
      label: 'Bank Account & Payroll Details Verified',
      description: 'Account number and IFSC routing verified for salary dispatch',
      checked: !!checklist?.bankDetailsVerified,
    },
    {
      key: 'idCardIssued',
      label: 'Employee ID Card & Access Badge Issued',
      description: 'Physical & digital entry access badges granted',
      checked: !!checklist?.idCardIssued,
    },
    {
      key: 'assetAssigned',
      label: 'Work Laptop & Equipment Assigned',
      description: 'Workstation hardware, laptop, and accessories handed over',
      checked: !!checklist?.assetAssigned,
    },
    {
      key: 'orientationDone',
      label: 'HR Orientation & Team Introduction Completed',
      description: 'Company policy briefing and department introduction completed',
      checked: !!checklist?.orientationDone,
    },
  ];

  const completedCount = items.filter((i) => i.checked).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  const handleToggle = (key: string, currentVal: boolean) => {
    updateMutation.mutate({
      userId,
      data: {
        [key]: !currentVal,
      },
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-primary" size={22} />
            Joining & Onboarding Checklist
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Track onboarding milestones for {userName}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border ${
            checklist?.status === 'COMPLETED'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : checklist?.status === 'IN_PROGRESS'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          {checklist?.status || 'PENDING'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-600">Onboarding Progress</span>
          <span className="text-primary font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3 pt-2">
        {items.map((item) => (
          <div
            key={item.key}
            onClick={() => handleToggle(item.key, item.checked)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
              item.checked
                ? 'bg-emerald-50/50 border-emerald-200/80 hover:bg-emerald-50'
                : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/60'
            }`}
          >
            <div className="pt-0.5 shrink-0 text-slate-400">
              {item.checked ? (
                <CheckSquare className="text-emerald-600 h-5 w-5" />
              ) : (
                <Square className="h-5 w-5" />
              )}
            </div>

            <div className="flex-1">
              <p
                className={`text-sm font-bold ${
                  item.checked ? 'text-slate-900 line-through decoration-emerald-500/50' : 'text-slate-800'
                }`}
              >
                {item.label}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
