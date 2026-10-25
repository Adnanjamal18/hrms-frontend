import { useState, useEffect } from 'react';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Users,
  Plus,
  FileText,
  Printer,
  Calendar,
  Building,
  Mail,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  createSalary,
  getSalaryByUserId,
  createPayroll,
  getPayrollsByUserId,
  getPayslip,
  getCompanyPayrollReport,
  type PayrollRecord,
  type PayslipData,
  type Salary,
} from '../api/payroll';
import { getEmployees, type Employee } from '../api/employees';

export function PayrollPage() {
  const [activeTab, setActiveTab] = useState<'process' | 'company' | 'salaries'>('process');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedEmployeeSalary, setSelectedEmployeeSalary] = useState<Salary | null>(null);
  const [employeePayrolls, setEmployeePayrolls] = useState<PayrollRecord[]>([]);
  const [companyPayrolls, setCompanyPayrolls] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter for company payrolls
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipData | null>(null);

  // Form states
  const [salaryAmount, setSalaryAmount] = useState<string>('');
  const [payrollAmount, setPayrollAmount] = useState<string>('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      loadEmployeePayrollDetails(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [empRes, compPayrolls] = await Promise.all([
        getEmployees().catch(() => []),
        getCompanyPayrollReport().catch(() => []),
      ]);
      const empList = Array.isArray(empRes) ? empRes : [];
      setEmployees(empList);
      setCompanyPayrolls(compPayrolls);
      if (empList.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(empList[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeePayrollDetails = async (userId: string) => {
    try {
      const [salary, payrolls] = await Promise.all([
        getSalaryByUserId(userId),
        getPayrollsByUserId(userId),
      ]);
      setSelectedEmployeeSalary(salary);
      setEmployeePayrolls(payrolls);
      if (salary) {
        setPayrollAmount(salary.amount.toString());
      } else {
        setPayrollAmount('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !salaryAmount) {
      toast.error('Please specify an amount');
      return;
    }

    try {
      await createSalary(selectedEmployeeId, parseFloat(salaryAmount));
      toast.success('Base salary saved successfully!');
      setIsSalaryModalOpen(false);
      setSalaryAmount('');
      loadEmployeePayrollDetails(selectedEmployeeId);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to assign salary');
    }
  };

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !payrollAmount) {
      toast.error('Please specify a payout amount');
      return;
    }

    try {
      await createPayroll(selectedEmployeeId, parseFloat(payrollAmount));
      toast.success('Payroll generated and recorded!');
      setIsPayrollModalOpen(false);
      loadEmployeePayrollDetails(selectedEmployeeId);
      // Refresh company records
      const updatedCompany = await getCompanyPayrollReport(startDate, endDate);
      setCompanyPayrolls(updatedCompany);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to generate payroll');
    }
  };

  const handleViewPayslip = async (payrollId: number) => {
    try {
      const data = await getPayslip(payrollId);
      setSelectedPayslip(data);
      setIsPayslipModalOpen(true);
    } catch (err) {
      toast.error('Failed to load payslip document');
    }
  };

  const handleFilterCompanyPayrolls = async () => {
    try {
      const records = await getCompanyPayrollReport(startDate, endDate);
      setCompanyPayrolls(records);
      toast.success('Filtered payroll records');
    } catch (err) {
      toast.error('Failed to filter records');
    }
  };

  const selectedEmployee = employees.find(
    (e) => e.id === selectedEmployeeId
  );

  const totalDisbursed = companyPayrolls.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <DollarSign className="text-primary" size={30} />
            Payroll & Compensation Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Automate monthly salary disbursements, manage salary structures, and issue official payslips.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (selectedEmployeeSalary) {
                setSalaryAmount(selectedEmployeeSalary.amount.toString());
              }
              setIsSalaryModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <CreditCard size={16} /> Base Salary Structure
          </Button>
          <Button onClick={() => setIsPayrollModalOpen(true)} className="flex items-center gap-2">
            <Plus size={16} /> Generate Monthly Payroll
          </Button>
        </div>
      </div>

      {/* Analytics Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Disbursed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-3">
            ₹{totalDisbursed.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Payroll Logs</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{companyPayrolls.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Staff On Payroll</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{employees.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Monthly Payout</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">
            ₹
            {companyPayrolls.length > 0
              ? Math.round(totalDisbursed / companyPayrolls.length).toLocaleString()
              : 0}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('process')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors relative ${
            activeTab === 'process'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Employee Payroll & History
        </button>
        <button
          onClick={() => setActiveTab('company')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors relative ${
            activeTab === 'company'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Company-Wide Payout Logs ({companyPayrolls.length})
        </button>
        <button
          onClick={() => setActiveTab('salaries')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors relative ${
            activeTab === 'salaries'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Salary Roster ({employees.length})
        </button>
      </div>

      {/* Tab 1: Employee Payroll Process */}
      {activeTab === 'process' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee Selector & Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Select Employee
                </Label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-primary"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              {selectedEmployee && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {selectedEmployee.fullName?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 leading-snug">
                        {selectedEmployee.fullName}
                      </h3>
                      <p className="text-xs text-slate-500">{selectedEmployee.role?.rolename || 'Staff Member'}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-400" />
                      <span>{selectedEmployee.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building size={13} className="text-slate-400" />
                      <span>{selectedEmployee.departments?.[0]?.department?.departmentName || 'General Dept'}</span>
                    </div>
                  </div>

                  {/* Salary Status */}
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                        Current Base Salary
                      </span>
                      <p className="text-xl font-extrabold text-emerald-900 mt-0.5">
                        {selectedEmployeeSalary
                          ? `₹${selectedEmployeeSalary.amount.toLocaleString()}`
                          : 'Not Configured'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (selectedEmployeeSalary) {
                          setSalaryAmount(selectedEmployeeSalary.amount.toString());
                        }
                        setIsSalaryModalOpen(true);
                      }}
                      className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-100 bg-white"
                    >
                      {selectedEmployeeSalary ? 'Edit' : 'Set Salary'}
                    </Button>
                  </div>

                  <Button
                    onClick={() => setIsPayrollModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 mt-2"
                  >
                    <Plus size={16} /> Disburse Monthly Payroll
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Employee's Payment History */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Payment History</h3>
                  <p className="text-xs text-slate-500">
                    Past payroll records and generated payslips for this employee
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {employeePayrolls.length} Records
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80">
                      <TableHead>Payroll ID</TableHead>
                      <TableHead>Disbursed Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Payslip</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-slate-400">
                          Loading payroll history...
                        </TableCell>
                      </TableRow>
                    ) : employeePayrolls.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-28 text-slate-400">
                          No payroll payouts recorded for this employee yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      employeePayrolls.map((payroll) => (
                        <TableRow key={payroll.id} className="hover:bg-slate-50/60">
                          <TableCell className="font-mono text-xs font-bold text-slate-700">
                            #PAY-{payroll.id}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {new Date(payroll.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="font-bold text-slate-900 text-sm">
                            ₹{payroll.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              <CheckCircle2 size={12} /> Disbursed
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewPayslip(payroll.id)}
                              className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 ml-auto"
                            >
                              <FileText size={14} /> View Payslip
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Company-Wide Payout Logs */}
      {activeTab === 'company' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">From:</span>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 text-xs w-36"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">To:</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 text-xs w-36"
                />
              </div>
              <Button size="sm" onClick={handleFilterCompanyPayrolls}>
                Filter Logs
              </Button>
              {(startDate || endDate) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    getCompanyPayrollReport().then(setCompanyPayrolls);
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead>ID</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Disbursed Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyPayrolls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32 text-slate-400">
                      No payroll disbursements recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  companyPayrolls.map((p) => (
                    <TableRow key={p.id} className="hover:bg-slate-50/60">
                      <TableCell className="font-mono text-xs font-bold text-slate-700">
                        #PAY-{p.id}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 text-sm">
                        {p.user?.fullName || 'Employee'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">{p.user?.email || '-'}</TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {new Date(p.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="font-extrabold text-slate-900 text-sm">
                        ₹{Number(p.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewPayslip(p.id)}
                          className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 ml-auto"
                        >
                          <FileText size={14} /> Payslip
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

      {/* Tab 3: Salary Roster */}
      {activeTab === 'salaries' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-28 text-slate-400">
                    No employees found in directory.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => {
                  return (
                    <TableRow key={emp.id} className="hover:bg-slate-50/60">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">{emp.fullName}</span>
                          <span className="text-xs text-slate-400">{emp.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {emp.departments?.[0]?.department?.departmentName || '-'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {emp.role?.rolename || 'Staff Member'}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md text-xs">
                          {selectedEmployeeId === emp.id && selectedEmployeeSalary
                            ? `₹${selectedEmployeeSalary.amount.toLocaleString()}`
                            : 'Configured on select'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEmployeeId(emp.id);
                            setIsSalaryModalOpen(true);
                          }}
                          className="text-xs font-semibold"
                        >
                          Set / Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Set Salary Dialog */}
      <Dialog open={isSalaryModalOpen} onOpenChange={setIsSalaryModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard size={20} className="text-primary" /> Assign Base Salary
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAssignSalary} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Input
                disabled
                value={selectedEmployee ? `${selectedEmployee.fullName} (${selectedEmployee.email})` : ''}
                className="bg-slate-100 text-slate-600"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Monthly Base Salary Amount (INR) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <Input
                  type="number"
                  required
                  min="0"
                  step="100"
                  placeholder="e.g. 75000"
                  value={salaryAmount}
                  onChange={(e) => setSalaryAmount(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsSalaryModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Salary</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Generate Monthly Payroll Dialog */}
      <Dialog open={isPayrollModalOpen} onOpenChange={setIsPayrollModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign size={20} className="text-primary" /> Disburse Monthly Payroll
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleGeneratePayroll} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Input
                disabled
                value={selectedEmployee ? `${selectedEmployee.fullName} (${selectedEmployee.email})` : ''}
                className="bg-slate-100 text-slate-600"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Payout Amount (INR) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <Input
                  type="number"
                  required
                  min="0"
                  step="100"
                  placeholder="e.g. 75000"
                  value={payrollAmount}
                  onChange={(e) => setPayrollAmount(e.target.value)}
                  className="pl-8"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Pre-filled from employee base salary. Adjust for bonuses or deductions if applicable.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsPayrollModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Confirm & Disburse</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Official Printable Payslip Dialog */}
      <Dialog open={isPayslipModalOpen} onOpenChange={setIsPayslipModalOpen}>
        <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden bg-white">
          {selectedPayslip && (
            <div className="flex flex-col">
              {/* Action Bar */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <span className="text-sm font-bold tracking-tight">Official Payslip Document</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Printer size={14} /> Print / Save PDF
                </Button>
              </div>

              {/* Printable Body */}
              <div className="p-8 space-y-6 print:p-0">
                {/* Header */}
                <div className="flex items-start justify-between border-b pb-6 border-slate-200">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">HRMS PRO</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Enterprise Workforce & Payroll Services</p>
                    <p className="text-xs text-slate-400 mt-1">Confidential Employee Compensation Statement</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Payslip
                    </span>
                    <p className="text-base font-extrabold text-slate-900 font-mono">
                      #PAY-{selectedPayslip.id}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 justify-end">
                      <Calendar size={12} />
                      <span>
                        {new Date(selectedPayslip.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Employee Meta Details */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      Employee Name
                    </span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                      {selectedPayslip.user?.fullName}
                    </p>
                    <p className="text-slate-500 mt-0.5">{selectedPayslip.user?.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      Payment Mode & Date
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">Direct Bank Deposit</p>
                    <p className="text-slate-500 mt-0.5">
                      {new Date(selectedPayslip.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Earnings Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 font-bold text-xs text-slate-700 flex justify-between">
                    <span>Earnings Component</span>
                    <span>Amount (INR)</span>
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span>Basic Salary</span>
                      <span className="font-medium">
                        ₹{(Number(selectedPayslip.amount) * 0.5).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>House Rent Allowance (HRA)</span>
                      <span className="font-medium">
                        ₹{(Number(selectedPayslip.amount) * 0.3).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Special & Performance Allowance</span>
                      <span className="font-medium">
                        ₹{(Number(selectedPayslip.amount) * 0.2).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Net Pay Total */}
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

                {/* Sign-off */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 text-xs text-slate-400">
                  <p>This is a computer-generated payslip. No signature required.</p>
                  <div className="text-right">
                    <span className="font-serif italic font-bold text-slate-700 text-sm">HRMS Authorized</span>
                    <p className="text-[10px]">Verified Payroll Record</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
