import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEmployeeById, sendInvite } from '../api/employees';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Link as LinkIcon,
  Building,
  User,
  Calendar,
  ExternalLink,
  Mail,
  Phone,
  Shield,
  Building2,
  Send,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { ViewDocumentButton } from "@/components/ViewDocumentButton";
import { JoiningChecklistWidget } from '@/components/JoiningChecklistWidget';

export function EmployeeDetailsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [sendingInvite, setSendingInvite] = useState(false);

  const { data: employee, isLoading, isError } = useQuery({
    queryKey: ['employee', userId],
    queryFn: () => getEmployeeById(userId as string),
    enabled: !!userId,
  });

  const handleSendInvite = async () => {
    if (!userId || !employee?.email) {
      toast.error("Employee email not found");
      return;
    }
    try {
      setSendingInvite(true);
      const res = await sendInvite(userId);
      toast.success(res.message || `Invitation sent to ${employee.email}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to send invitation email';
      toast.error(msg);
    } finally {
      setSendingInvite(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <User size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Employee Not Found</h3>
        <p className="text-slate-500 mb-6">We couldn't find the details for this employee.</p>
        <Button onClick={() => navigate('/employees')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
        </Button>
      </div>
    );
  }

  const fullName = employee.fullName || `User #${employee.id}`;
  const username = employee.username ? `@${employee.username}` : '';
  const email = employee.email || 'N/A';
  const mobile = employee.mobile || 'N/A';
  const roleName = employee.role?.rolename || 'Employee';

  const assignedDept = employee.departments?.[0]?.department?.departmentName || 'Not Assigned';

  const initial = fullName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/employees')}
            className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              {fullName}
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ID: {employee.id}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm">
              {username} • {roleName} Profile & HR Information
            </p>
          </div>
        </div>

        <Button
          onClick={handleSendInvite}
          disabled={sendingInvite}
          className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-xs"
        >
          {sendingInvite ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Sending Invite...
            </>
          ) : (
            <>
              <Send size={16} />
              Send Invitation Email
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Profile Summary Card */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl mb-4 uppercase shadow-inner border border-primary/20">
              {initial}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{fullName}</h2>
            <p className="text-slate-500 text-sm mb-2">{email}</p>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium text-xs border border-emerald-200 mb-4">
              <Shield size={12} />
              {roleName}
            </div>

            <div className="w-full pt-4 border-t border-slate-100 flex justify-around">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Experience</p>
                <p className="text-slate-900 font-bold text-lg">{employee.experience} Yrs</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Leaves</p>
                <p className="text-slate-900 font-bold text-lg">{employee.leaveCount || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info Cards */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Personal & Work Details Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-2">
              <Briefcase size={18} className="text-slate-500" />
              <h3 className="font-semibold text-slate-800">Personal & Job Assignment</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2"><Building2 size={14} /> Department</p>
                <p className="text-slate-900 font-semibold">{assignedDept}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2"><Shield size={14} /> Role</p>
                <p className="text-slate-900 font-semibold">{roleName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2"><Mail size={14} /> Email</p>
                <p className="text-slate-900">{email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2"><Phone size={14} /> Mobile</p>
                <p className="text-slate-900">{mobile}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2"><MapPin size={14} /> Address</p>
                <p className="text-slate-900">{employee.address || <span className="text-slate-400 italic">Not provided</span>}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2"><Calendar size={14} /> Record Created</p>
                <p className="text-slate-900">{employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : 'Unknown'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2"><LinkIcon size={14} /> LinkedIn</p>
                {employee.linkedinUrl ? (
                  <a href={employee.linkedinUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 font-medium">
                    View Profile <ExternalLink size={12} />
                  </a>
                ) : <span className="text-slate-400 italic">Not provided</span>}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2"><LinkIcon size={14} /> Resume Document</p>
                {employee.resumeLink ? (
                  <ViewDocumentButton
                    userId={employee.id}
                    employeeName={fullName}
                    hasResume={!!employee.resumeLink}
                    variant="link"
                  />
                ) : <span className="text-slate-400 italic">Not provided</span>}
              </div>
            </div>
          </div>

          {/* Bank Details Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-2">
              <Building size={18} className="text-slate-500" />
              <h3 className="font-semibold text-slate-800">Bank Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div className="space-y-1 pb-4 border-b border-slate-100 sm:border-0 sm:pb-0">
                <p className="text-sm font-medium text-slate-500">Bank Name</p>
                <p className="text-slate-900 font-medium">{employee.bankName || 'N/A'}</p>
              </div>
              <div className="space-y-1 pb-4 border-b border-slate-100 sm:border-0 sm:pb-0">
                <p className="text-sm font-medium text-slate-500">Branch</p>
                <p className="text-slate-900 font-medium">{employee.branch || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Account Number</p>
                <p className="text-slate-900 font-medium font-mono">{employee.accountNumber || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">IFSC / Routing Code</p>
                <p className="text-slate-900 font-medium font-mono">{employee.ifscCode || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Joining Onboarding Checklist Card */}
          <JoiningChecklistWidget userId={employee.id} userName={fullName} />

        </div>
      </div>
    </div>
  );
}
