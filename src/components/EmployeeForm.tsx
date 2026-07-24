import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createEmployee, updateEmployee, assignDepartment, type Employee, type CreateEmployeeDTO, type UpdateEmployeeDTO } from '../api/employees';
import { getDepartments } from '../api/departments';
import { toast } from "sonner";
import { X, Save, Briefcase, Link as LinkIcon, Building, MapPin, User } from 'lucide-react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Props {
  onClose: () => void;
  employeeToEdit: Employee | null;
}

export function EmployeeForm({ onClose, employeeToEdit }: Props) {
  const queryClient = useQueryClient();
  
  // Basic Fields
  const [userId, setUserId] = useState(employeeToEdit?.userId?.toString() || '');
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
  const [departmentId, setDepartmentId] = useState<string>('');

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: (data) => {
      if (departmentId) {
        assignMutation.mutate({ userId: data.userId, departmentId: Number(departmentId) });
      } else {
        finishSuccess();
      }
    },
    onError: (error: any) => {
      let message = error.response?.data?.error || error.message || "Failed to create employee.";
      if (message.includes("Foreign key constraint violated") || message.includes("employee_user_id_fkey")) {
        message = "The User ID you entered does not exist in the system.";
      }
      toast.error(message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateEmployee,
    onSuccess: (data) => {
      if (departmentId) {
        assignMutation.mutate({ userId: data.userId, departmentId: Number(departmentId) });
      } else {
        finishSuccess();
      }
    },
    onError: (error: any) => {
      let message = error.response?.data?.error || error.message || "Failed to update employee.";
      if (message.includes("Foreign key constraint violated") || message.includes("employee_user_id_fkey")) {
        message = "The User ID you entered does not exist in the system.";
      }
      toast.error(message);
    }
  });

  const assignMutation = useMutation({
    mutationFn: assignDepartment,
    onSuccess: () => {
      finishSuccess();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message;
      toast.error(`Employee saved, but failed to assign department: ${message}`);
      finishSuccess(); // Still close the form since employee was saved
    }
  });

  const finishSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    toast.success("Employee saved successfully!");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const uId = Number(userId);
    if (!uId) return toast.error('User ID is required');

    const baseData = {
      experience: Number(experience) || 0,
      resumeLink: resumeLink || undefined,
      linkedinUrl: linkedinUrl || undefined,
      address: address || undefined,
      accountNumber: accountNumber || undefined,
      ifscCode: ifscCode || undefined,
      bankName: bankName || undefined,
      branch: branch || undefined,
    };

    if (employeeToEdit) {
      updateMutation.mutate({
        userId: employeeToEdit.userId,
        data: baseData as UpdateEmployeeDTO,
      });
    } else {
      createMutation.mutate({
        userId: uId,
        data: baseData as CreateEmployeeDTO,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || assignMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end transition-all">
      <div className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {employeeToEdit ? 'Edit Employee' : 'New Employee'}
            </h2>
            <p className="text-sm text-slate-500">
              {employeeToEdit ? 'Update employee details and assignments.' : 'Fill in the details to create a new employee profile.'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-200">
            <X size={18} />
          </Button>
        </div>

        <ScrollArea className="flex-1 min-h-0 p-6">
          <form id="employee-form" onSubmit={handleSubmit} className="space-y-8 pb-6">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2 border-b pb-2">
                <User size={16} className="text-primary" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID <span className="text-red-500">*</span></Label>
                  <Input
                    id="userId"
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    disabled={!!employeeToEdit}
                    placeholder="e.g. 101"
                    className="focus-visible:ring-primary"
                  />
                  {!employeeToEdit && <p className="text-[11px] text-slate-500">Link to an existing user account ID.</p>}
                </div>
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
              </div>
            </div>

            {/* Department Assignment */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2 border-b pb-2">
                <Briefcase size={16} className="text-primary" />
                Job & Assignment
              </h3>
              
              <div className="space-y-2">
                <Label>Assign Department</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map(dept => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.departmentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-slate-500">Optional: Select a department to assign this employee to immediately.</p>
              </div>
            </div>

            {/* Links & Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2 border-b pb-2">
                <LinkIcon size={16} className="text-primary" />
                Links & Contact
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
