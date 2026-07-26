import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  createDepartment,
  updateDepartment,
  assignDepartmentManager,
  type Department,
} from '../api/departments';
import { getEmployees } from '../api/employees';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Hash, Globe, X, Save, UserCheck, ShieldCheck } from 'lucide-react';

const schema = z.object({
  departmentName: z.string().min(1, 'Department Name is required'),
  departmentCode: z.number().min(1, 'Department Code must be greater than 0'),
  departmentUrl: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  departmentToEdit?: Department | null;
}

export function DepartmentForm({ onClose, departmentToEdit }: Props) {
  const queryClient = useQueryClient();
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      departmentName: departmentToEdit?.departmentName || '',
      departmentCode: departmentToEdit?.departmentCode || 101,
      departmentUrl: departmentToEdit?.departmentUrl || '',
    },
  });

  useEffect(() => {
    if (departmentToEdit) {
      reset({
        departmentName: departmentToEdit.departmentName,
        departmentCode: departmentToEdit.departmentCode,
        departmentUrl: departmentToEdit.departmentUrl || '',
      });
      setSelectedManagerId(departmentToEdit.managerId?.toString() || '');
    } else {
      reset({
        departmentName: '',
        departmentCode: 101,
        departmentUrl: '',
      });
      setSelectedManagerId('');
    }
  }, [departmentToEdit, reset]);

  const assignManagerMutation = useMutation({
    mutationFn: assignDepartmentManager,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: (createdDept) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      if (selectedManagerId && createdDept?.id) {
        assignManagerMutation.mutate({
          departmentId: createdDept.id,
          managerId: Number(selectedManagerId),
        });
      }
      toast.success("Department created successfully!");
      onClose();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || error.message || "Failed to create department";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) =>
      updateDepartment({ id: departmentToEdit!.id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      if (selectedManagerId && departmentToEdit?.id) {
        assignManagerMutation.mutate({
          departmentId: departmentToEdit.id,
          managerId: Number(selectedManagerId),
        });
      }
      toast.success("Department updated successfully!");
      onClose();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || error.message || "Failed to update department";
      toast.error(msg);
    },
  });

  const onSubmit = (data: FormData) => {
    const payload = {
      departmentName: data.departmentName,
      departmentCode: Number(data.departmentCode),
      departmentUrl: data.departmentUrl || undefined,
    };

    if (departmentToEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending =
    isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending ||
    assignManagerMutation.isPending;

  const selectedManager = employees?.find(
    (emp) => emp.id.toString() === selectedManagerId
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end transition-all">
      <div className="w-full max-w-lg h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {departmentToEdit ? `Edit Department (#${departmentToEdit.departmentCode})` : 'New Department'}
              </h2>
              <p className="text-xs text-slate-500">
                {departmentToEdit
                  ? 'Update department details and reporting manager.'
                  : 'Add a new department to your organizational hierarchy.'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-full"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Scrollable Form Body */}
        <ScrollArea className="flex-1 min-h-0 p-6">
          <form id="department-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-6">
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 border-b pb-2">
                <Building2 size={14} className="text-primary" />
                Department Information
              </h3>

              {/* Department Name */}
              <div className="space-y-2">
                <Label htmlFor="departmentName" className="text-sm font-semibold text-slate-700">
                  Department Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="departmentName"
                    {...register('departmentName')}
                    placeholder="e.g. Engineering & Product"
                    className={`pl-9 focus-visible:ring-primary ${
                      errors.departmentName ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  />
                </div>
                {errors.departmentName && (
                  <p className="text-xs text-red-500 font-medium">{errors.departmentName.message}</p>
                )}
              </div>

              {/* Department Code */}
              <div className="space-y-2">
                <Label htmlFor="departmentCode" className="text-sm font-semibold text-slate-700">
                  Department Code <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="departmentCode"
                    type="number"
                    {...register('departmentCode', { valueAsNumber: true })}
                    placeholder="e.g. 101"
                    className={`pl-9 focus-visible:ring-primary ${
                      errors.departmentCode ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  />
                </div>
                {errors.departmentCode && (
                  <p className="text-xs text-red-500 font-medium">{errors.departmentCode.message}</p>
                )}
              </div>

              {/* Department URL Slug */}
              <div className="space-y-2">
                <Label htmlFor="departmentUrl" className="text-sm font-semibold text-slate-700">
                  Department URL Slug
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="departmentUrl"
                    {...register('departmentUrl')}
                    placeholder="e.g. engineering-hq"
                    className="pl-9 focus-visible:ring-primary"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Optional custom web link or identifier for this department.</p>
              </div>
            </div>

            {/* Department Manager Assignment */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 border-b pb-2">
                <ShieldCheck size={14} className="text-primary" />
                Reporting Manager Assignment
              </h3>

              <div className="space-y-2">
                <Label htmlFor="managerSelect" className="text-sm font-semibold text-slate-700">
                  Assign Department Manager
                </Label>
                <Select
                  value={selectedManagerId}
                  onValueChange={(val) => setSelectedManagerId(!val || val === "none" ? "" : val)}
                >
                  <SelectTrigger id="managerSelect" className="w-full focus:ring-primary">
                    <SelectValue placeholder="Select a manager (optional)">
                      {selectedManagerId === ""
                        ? "Not Assigned"
                        : selectedManager
                        ? `${selectedManager.fullName || `User #${selectedManager.id}`} (${selectedManager.experience || 0} Yrs Exp)`
                        : `User #${selectedManagerId}`}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-slate-400 italic">Not Assigned</span>
                    </SelectItem>
                    {employees?.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        <div className="flex items-center gap-2">
                          <UserCheck size={14} className="text-emerald-600" />
                          <span>
                            {emp.fullName || `User #${emp.id}`} ({emp.experience || 0} Yrs Exp)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-slate-400">Select an employee to lead and manage this department.</p>
              </div>
            </div>

          </form>
        </ScrollArea>

        {/* Footer Action Buttons */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="department-form"
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-white shadow-sm flex items-center gap-2"
          >
            {isPending ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Department
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
