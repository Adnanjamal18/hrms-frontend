import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { assignDepartmentManager, type Department } from '../api/departments';
import { getEmployees } from '../api/employees';
import { toast } from "sonner";
import { UserCheck, ShieldAlert } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  department: Department | null;
  onClose: () => void;
}

export function AssignManagerModal({ department, onClose }: Props) {
  const queryClient = useQueryClient();
  const [managerId, setManagerId] = useState<string>(
    department?.managerId ? String(department.managerId) : ''
  );

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
  });

  const assignMutation = useMutation({
    mutationFn: assignDepartmentManager,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success(`Manager assigned to ${department?.departmentName} successfully!`);
      onClose();
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.error ||
        error.message ||
        "Failed to assign manager.";
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!department) return;
    const mId = Number(managerId);
    if (!mId || isNaN(mId)) {
      toast.error("Please select or enter a valid Manager User ID");
      return;
    }
    assignMutation.mutate({ departmentId: department.id, managerId: mId });
  };

  if (!department) return null;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <UserCheck className="h-5 w-5 text-primary" />
            Assign Department Manager
          </DialogTitle>
          <DialogDescription>
            Select or set the manager for <span className="font-semibold text-slate-800">{department.departmentName}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {employees && employees.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="managerSelect">Select Manager (User ID)</Label>
              <Select
                value={managerId}
                onValueChange={(val) => setManagerId(val ?? '')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an employee as manager">
                    {(() => {
                      const matched = employees.find((emp) => String(emp.userId) === managerId);
                      return matched
                        ? `User #${matched.userId} ${matched.bankName ? `(${matched.bankName})` : ''} — ${matched.experience} Yrs Exp`
                        : "Select an employee as manager";
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.userId)}>
                      User #{emp.userId} {emp.bankName ? `(${emp.bankName})` : ''} — {emp.experience} Yrs Exp
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="managerIdInput">Manager User ID <span className="text-destructive">*</span></Label>
              <Input
                id="managerIdInput"
                type="number"
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                placeholder="e.g. 1"
                required
              />
            </div>
          )}

          {/* Direct User ID Manual Override */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <Label htmlFor="manualId" className="text-xs text-slate-500">
              Or Enter Manager User ID Manually
            </Label>
            <Input
              id="manualId"
              type="number"
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              placeholder="e.g. 101"
              className="h-8 text-sm"
            />
          </div>

          {department.managerId && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Current Manager ID: <strong className="font-mono text-slate-900">#{department.managerId}</strong></span>
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={assignMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={assignMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-white shadow-sm"
            >
              {assignMutation.isPending ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
