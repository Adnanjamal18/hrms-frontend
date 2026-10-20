import { useState, useEffect } from 'react';
import {
  UserCheck,
  User,
  Lock,
  Clock,
  DollarSign,
  FileText,
  Mail,
  Building,
  Shield,
  Printer,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { authClient } from '../app/better-auth';
import { updateSelfProfile, updateSelfPassword } from '../api/selfservice';
import { getEmployeeById, type Employee } from '../api/employees';
import { getAttendanceHistory } from '../api/attendance';
import { getPayrollsByUserId, getPayslip, type PayrollRecord, type PayslipData } from '../api/payroll';

export function SelfServicePage() {
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id || '';

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'attendance' | 'payroll'>('profile');
  const [employeeProfile, setEmployeeProfile] = useState<Employee | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);

  // Profile Edit Form
  const [editFullName, setEditFullName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Change Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Payslip Modal
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipData | null>(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);

  useEffect(() => {
    if (currentUserId) {
      loadEmployeeData(currentUserId);
    }
  }, [currentUserId]);

  const loadEmployeeData = async (userId: string) => {
    try {
      const [profileData, attendanceData, payrollsData] = await Promise.all([
        getEmployeeById(userId).catch(() => null),
        getAttendanceHistory(userId).catch(() => []),
        getPayrollsByUserId(userId).catch(() => []),
      ]);

      if (profileData) {
        setEmployeeProfile(profileData);
        setEditFullName(profileData.fullName || session?.user?.name || '');
        setEditMobile(profileData.mobile || '');
      } else {
        setEditFullName(session?.user?.name || '');
      }

      setAttendanceRecords(attendanceData || []);
      setPayrollRecords(payrollsData || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile data');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;
    setIsUpdatingProfile(true);

    try {
      await updateSelfProfile(currentUserId, {
        fullName: editFullName,
        mobile: editMobile,
      });
      toast.success('Profile details updated successfully!');
      loadEmployeeData(currentUserId);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updateSelfPassword(currentUserId, currentPassword, newPassword);
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleViewPayslip = async (payrollId: number) => {
    try {
      const slip = await getPayslip(payrollId);
      setSelectedPayslip(slip);
      setIsPayslipOpen(true);
    } catch (err) {
      toast.error('Failed to retrieve payslip');
    }
  };

  const userInitial = (editFullName || session?.user?.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-lg border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md flex items-center justify-center text-3xl font-black text-white border-2 border-white/20">
              {userInitial}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {editFullName || session?.user?.name || 'Employee Portal'}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Active
                </span>
              </div>
              <p className="text-indigo-200 text-sm mt-1 flex items-center gap-2">
                <Mail size={14} className="opacity-70" />
                {session?.user?.email || 'employee@company.com'}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-300 mt-3 font-medium">
                <span className="flex items-center gap-1">
                  <Building size={13} className="text-indigo-400" />
                  {employeeProfile?.departments?.[0]?.department?.departmentName || 'Main Team'}
                </span>
                <span className="flex items-center gap-1">
                  <Shield size={13} className="text-purple-400" />
                  {employeeProfile?.role?.rolename || 'Employee'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-6">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Attendance</span>
              <p className="text-lg font-black text-white mt-0.5">{attendanceRecords.length} days</p>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Payslips</span>
              <p className="text-lg font-black text-emerald-400 mt-0.5">{payrollRecords.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors flex items-center gap-2 whitespace-nowrap relative ${
            activeTab === 'profile'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User size={16} /> My Profile & Info
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors flex items-center gap-2 whitespace-nowrap relative ${
            activeTab === 'security'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock size={16} /> Security & Password
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors flex items-center gap-2 whitespace-nowrap relative ${
            activeTab === 'attendance'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock size={16} /> My Attendance Logs ({attendanceRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors flex items-center gap-2 whitespace-nowrap relative ${
            activeTab === 'payroll'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign size={16} /> My Payroll & Payslips ({payrollRecords.length})
        </button>
      </div>

      {/* Tab 1: Profile & Info */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Edit Profile Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your contact details and view official employment credentials.
              </p>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name *</Label>
                  <Input
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="Your Full Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Mobile Number</Label>
                  <Input
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Work Email</Label>
                <Input
                  disabled
                  value={session?.user?.email || ''}
                  className="bg-slate-100 text-slate-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400">
                  Primary corporate email is managed by your workspace administrator.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isUpdatingProfile} className="flex items-center gap-2">
                  <Save size={16} /> {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </div>

          {/* Quick ID Card Preview */}
          <div className="lg:col-span-1 bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <UserCheck size={16} className="text-primary" /> Corporate Identification
            </h3>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {userInitial}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">
                    {editFullName || session?.user?.name || 'Staff Member'}
                  </h4>
                  <span className="text-[11px] text-slate-500">Employee ID: #{currentUserId.slice(0, 8)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-medium">
                    {employeeProfile?.departments?.[0]?.department?.departmentName || 'Engineering'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Role:</span>
                  <span className="font-medium">{employeeProfile?.role?.rolename || 'Employee'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-emerald-600">Active</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-100 text-xs text-blue-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle size={14} /> Need to update bank details?
              </p>
              <p className="text-[11px] text-blue-700">
                Contact your HR Department to submit updated bank account or statutory tax documents.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Lock className="text-primary" size={20} /> Change Account Password
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Keep your account secure by using a strong, unique password.
            </p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Current Password *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>New Password *</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Confirm New Password *</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isUpdatingPassword} className="flex items-center gap-2">
                <Lock size={16} /> {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: My Attendance Logs */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Personal Attendance Logs</h2>
              <p className="text-xs text-slate-500">Your historical check-ins, check-outs, and daily hours worked.</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {attendanceRecords.length} Sessions Logged
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead>Date</TableHead>
                  <TableHead>Check-In Time</TableHead>
                  <TableHead>Check-Out Time</TableHead>
                  <TableHead>Work Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-28 text-slate-400">
                      No attendance sessions logged yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceRecords.map((rec: any, idx: number) => (
                    <TableRow key={idx} className="hover:bg-slate-50/60">
                      <TableCell className="font-semibold text-xs text-slate-800">
                        {rec.date ? new Date(rec.date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-mono">
                        {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString() : '--'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-mono">
                        {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString() : '--'}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-900">
                        {rec.workHours ? `${rec.workHours} hrs` : '--'}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          {rec.status || 'PRESENT'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Tab 4: My Payroll & Payslips */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">My Salary & Compensation Slips</h2>
              <p className="text-xs text-slate-500">
                Official records of salary payments with access to downloadable payslips.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {payrollRecords.length} Payslips Issued
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead>Payslip ID</TableHead>
                  <TableHead>Disbursed Date</TableHead>
                  <TableHead>Disbursed Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-28 text-slate-400">
                      No payroll records found for your account yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  payrollRecords.map((payroll) => (
                    <TableRow key={payroll.id} className="hover:bg-slate-50/60">
                      <TableCell className="font-mono text-xs font-bold text-slate-700">
                        #PAY-{payroll.id}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {new Date(payroll.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="font-extrabold text-slate-900 text-sm">
                        ₹{Number(payroll.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 size={12} /> Paid
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewPayslip(payroll.id)}
                          className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 ml-auto"
                        >
                          <FileText size={14} /> Download Payslip
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Payslip View Modal */}
      <Dialog open={isPayslipOpen} onOpenChange={setIsPayslipOpen}>
        <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden bg-white">
          {selectedPayslip && (
            <div className="flex flex-col">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span className="text-sm font-bold tracking-tight">Personal Payslip Document</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Printer size={14} /> Print / Save PDF
                </Button>
              </div>

              <div className="p-8 space-y-6 print:p-0">
                <div className="flex items-start justify-between border-b pb-6 border-slate-200">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">HRMS PRO</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Enterprise Workforce & Payroll Services</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Payslip
                    </span>
                    <p className="text-base font-extrabold text-slate-900 font-mono">
                      #PAY-{selectedPayslip.id}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(selectedPayslip.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Employee Name
                    </span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedPayslip.user?.fullName}</p>
                    <p className="text-slate-500 mt-0.5">{selectedPayslip.user?.email}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Disbursement Date
                    </span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                      {new Date(selectedPayslip.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-emerald-600 font-medium mt-0.5">Direct Deposit Verified</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 font-bold text-xs text-slate-700 flex justify-between">
                    <span>Itemized Breakdown</span>
                    <span>Amount (INR)</span>
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span>Basic Salary (50%)</span>
                      <span className="font-medium">
                        ₹{(Number(selectedPayslip.amount) * 0.5).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>House Rent Allowance (HRA) (30%)</span>
                      <span className="font-medium">
                        ₹{(Number(selectedPayslip.amount) * 0.3).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Special Allowance (20%)</span>
                      <span className="font-medium">
                        ₹{(Number(selectedPayslip.amount) * 0.2).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 px-4 py-3 border-t border-emerald-100 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                        Net Take-Home Pay
                      </span>
                      <p className="text-[11px] text-emerald-600">Disbursed successfully</p>
                    </div>
                    <span className="text-xl font-black text-emerald-900">
                      ₹{Number(selectedPayslip.amount).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 text-xs text-slate-400">
                  <p>Computer generated document. Valid without signature.</p>
                  <span className="font-serif italic font-bold text-slate-700">HRMS Authorized</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
