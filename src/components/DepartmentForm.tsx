import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDepartment, updateDepartment, type Department } from '../api/departments';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Building } from 'lucide-react';

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      departmentName: departmentToEdit?.departmentName || '',
      departmentCode: departmentToEdit?.departmentCode || 0,
      departmentUrl: departmentToEdit?.departmentUrl || '',
    },
  });

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) =>
      updateDepartment({ id: departmentToEdit!.id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      onClose();
    },
  });

  const onSubmit = (data: FormData) => {
    if (departmentToEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <Building className="h-5 w-5 text-primary" />
            {departmentToEdit ? 'Edit Department' : 'New Department'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <label htmlFor="departmentName" className="text-sm font-semibold text-slate-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Department Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="departmentName"
              {...register('departmentName')}
              placeholder="e.g. Engineering"
              className={errors.departmentName ? "border-destructive focus-visible:ring-destructive/50" : ""}
            />
            {errors.departmentName && (
              <p className="text-[13px] text-destructive font-medium">{errors.departmentName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="departmentCode" className="text-sm font-semibold text-slate-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Department Code <span className="text-destructive">*</span>
            </label>
            <Input
              id="departmentCode"
              type="number"
              {...register('departmentCode', { valueAsNumber: true })}
              placeholder="e.g. 101"
              className={errors.departmentCode ? "border-destructive focus-visible:ring-destructive/50" : ""}
            />
            {errors.departmentCode && (
              <p className="text-[13px] text-destructive font-medium">{errors.departmentCode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="departmentUrl" className="text-sm font-semibold text-slate-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Department URL
            </label>
            <Input
              id="departmentUrl"
              {...register('departmentUrl')}
              placeholder="e.g. engineering-hq (optional)"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-slate-200 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            >
              {isSubmitting || createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : 'Save Department'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
