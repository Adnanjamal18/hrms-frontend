import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  createEmployee,
  updateEmployee,
  assignDepartment,
  type Employee,
  type CreateEmployeeDTO,
  type UpdateEmployeeDTO,
} from '../api/employees';
import { getDepartments } from '../api/departments';
import { toast } from "sonner";
import { X, Save, Briefcase, Link as LinkIcon, Building, MapPin, User, Mail, Lock, Phone } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  onClose: () => void;
  employeeToEdit: Employee | null;
}

export function EmployeeForm({ onClose, employeeToEdit }: Props) {
  const queryClient = useQueryClient();

  // Helper to extract assigned department ID
  const getInitialDeptId = (emp: Employee | null) => {
    if (!emp?.departments?.length) return '';
    const deptObj = emp.departments[0];
    return (deptObj.departmentId || deptObj.department?.id || '').toString();
  };

  // User Credentials
  const [fullName, setFullName] = useState(employeeToEdit?.fullName || '');
  const [username, setUsername] = useState(employeeToEdit?.username || '');
  const [email, setEmail] = useState(employeeToEdit?.email || '');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState(employeeToEdit?.mobile || '');
  const [roleId, setRoleId] = useState(employeeToEdit?.roleId?.toString() || '2'); // Default roleId: 2 (Employee)

  // Employee Details
  const [experience, setExperience] = useState(employeeToEdit?.experience?.toString() || '0');
  const [resumeLink, setResumeLink] = useState(employeeToEdit?.resumeLink || '');
  const [linkedinUrl, setLinkedinUrl] = useState(employeeToEdit?.linkedinUrl || '');
  const [address, setAddress] = useState(employeeToEdit?.address || '');

  // Bank Details
  const [accountNumber, setAccountNumber] = useState(employeeToEdit?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(employeeToEdit?.ifscCode || '');
  const [bankName, setBankName] = useState(employeeToEdit?.bankName || '');
  const [branch, setBranch] = useState(employeeToEdit?.branch || '');

  // Department Assignment
  const [departmentId, setDepartmentId] = useState<string>(getInitialDeptId(employeeToEdit));

  useEffect(() => {
    if (employeeToEdit) {
      setFullName(employeeToEdit.fullName || '');
      setUsername(employeeToEdit.username || '');
      setEmail(employeeToEdit.email || '');
      setPassword('');
      setMobile(employeeToEdit.mobile || '');
      setRoleId(employeeToEdit.roleId?.toString() || '2');
      setExperience(employeeToEdit.experience?.toString() || '0');
      setResumeLink(employeeToEdit.resumeLink || '');
      setLinkedinUrl(employeeToEdit.linkedinUrl || '');
      setAddress(employeeToEdit.address || '');
      setAccountNumber(employeeToEdit.accountNumber || '');
      setIfscCode(employeeToEdit.ifscCode || '');
      setBankName(employeeToEdit.bankName || '');
      setBranch(employeeToEdit.branch || '');
      setDepartmentId(getInitialDeptId(employeeToEdit));
    }
  }, [employeeToEdit]);

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: (res) => {
      console.log("createEmployee response:", res);
      const createdUserId = res?.employee?.id || res?.user?.id || res?.id;
      console.log("Extracted createdUserId:", createdUserId, "departmentId:", departmentId);
      if (departmentId && createdUserId) {
        assignMutation.mutate({ userId: createdUserId, departmentId: Number(departmentId) });
      } else {
        finishSuccess();
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || "Failed to create employee profile.";
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateEmployee,
    onSuccess: (res) => {
      const targetUserId = employeeToEdit?.id || res?.id;
      if (departmentId && targetUserId) {
        assignMutation.mutate({ userId: targetUserId, departmentId: Number(departmentId) });
      } else {
        finishSuccess();
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || "Failed to update employee profile.";
      toast.error(message);
    },
  });

  const assignMutation = useMutation({
    mutationFn: assignDepartment,
    onSuccess: () => {
      finishSuccess();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message;
      toast.error(`Employee saved, but failed to assign department: ${message}`);
      finishSuccess();
    },
  });

  const finishSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    toast.success("Employee saved successfully!");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeToEdit) {
      if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim() || !mobile.trim()) {
        return toast.error('Please fill in all required user account fields (Name, Username, Email, Password, Mobile)');
      }

      const createData: CreateEmployeeDTO = {
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
        mobile: mobile.trim(),
        roleId: Number(roleId) || 1,
        experience: Number(experience) || 0,
        resumeLink: resumeLink || undefined,
        linkedinUrl: linkedinUrl || undefined,
        address: address || undefined,
        accountNumber: accountNumber || undefined,
        ifscCode: ifscCode || undefined,
        bankName: bankName || undefined,
        branch: branch || undefined,
      };

      createMutation.mutate(createData);
    } else {
      const updateData: UpdateEmployeeDTO = {
        fullName: fullName.trim() || undefined,
        username: username.trim() || undefined,
        email: email.trim() || undefined,
        password: password.trim() || undefined,
        mobile: mobile.trim() || undefined,
        roleId: Number(roleId) || undefined,
        experience: Number(experience) || 0,
        resumeLink: resumeLink || undefined,
        linkedinUrl: linkedinUrl || undefined,
        address: address || undefined,
        accountNumber: accountNumber || undefined,
        ifscCode: ifscCode || undefined,
        bankName: bankName || undefined,
        branch: branch || undefined,
      };

      updateMutation.mutate({
        userId: employeeToEdit.id,
        data: updateData,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || assignMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end transition-all">
      <div className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {employeeToEdit ? `Edit Employee (User #${employeeToEdit.id})` : 'New Employee Profile'}
            </h2>
            <p className="text-sm text-slate-500">
              {employeeToEdit
                ? 'Update work details, links, and banking info.'
                : 'Fill in user credentials and HR details to create a new employee.'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-200"
          >
            <X size={18} />
          </Button>
        </div>

        <ScrollArea className="flex-1 min-h-0 p-6">
          <form id="employee-form" onSubmit={handleSubmit} className="space-y-8 pb-6">
            
            {/* User Account Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2 border-b pb-2">
                <User size={16} className="text-primary" />
                User Account Credentials
              </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="e.g. Abdullah Khan"
                      className="focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="e.g. abdullah"
                      className="focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="abdullah@company.com"
                        className="pl-9 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  {!employeeToEdit && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="pl-9 focus-visible:ring-primary"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="mobile"
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                        placeholder="+1 555-0199"
                        className="pl-9 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roleId">Role</Label>
                    <Select value={roleId} onValueChange={(val) => setRoleId(val ?? '1')}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Role">
                          {roleId === '1' ? 'HR Admin' : roleId === '2' ? 'Employee' : roleId === '3' ? 'Manager' : 'Employee'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">Employee</SelectItem>
                        <SelectItem value="3">Manager</SelectItem>
                        <SelectItem value="1">HR Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

            {/* Experience & Job Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2 border-b pb-2">
                <Briefcase size={16} className="text-primary" />
                Work & Experience
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (Years) <span className="text-red-500">*</span></Label>
                  <Input
                    id="experience"
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                    min="0"
                    placeholder="0"
                    className="focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Assign Department</Label>
                  <Select key={`dept-select-${departments ? 'loaded' : 'loading'}-${departmentId}`} value={departmentId} onValueChange={(val) => setDepartmentId(val ?? '')}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a department">
                        {departments?.find((dept) => dept.id.toString() === departmentId)?.departmentName || "Select a department"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.departmentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Links & Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2 border-b pb-2">
                <LinkIcon size={16} className="text-primary" />
                Links & Address
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resumeLink">Resume Link</Label>
                  <Input
                    id="resumeLink"
                    type="url"
                    value={resumeLink}
                    onChange={(e) => setResumeLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="focus-visible:ring-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full residential address"
                    className="pl-9 focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2 border-b pb-2">
                <Building size={16} className="text-primary" />
                Bank Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Chase, HDFC"
                    className="focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="Branch name"
                    className="focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Account number"
                    className="focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">Routing / IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="Bank routing code"
                    className="focus-visible:ring-primary uppercase"
                  />
                </div>
              </div>
            </div>

          </form>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 mt-auto shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="hover:bg-slate-100 text-slate-700"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="employee-form"
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-white min-w-[120px] shadow-sm shadow-primary/20"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save size={16} />
                Save Employee
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
