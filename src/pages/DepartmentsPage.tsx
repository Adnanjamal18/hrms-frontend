import { useState } from 'react';
import { DepartmentList } from '../components/DepartmentList';
import { DepartmentForm } from '../components/DepartmentForm';
import type { Department } from '../api/departments';
import { Plus } from 'lucide-react';

export function DepartmentsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(null);

  const handleOpenNew = () => {
    setDepartmentToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setDepartmentToEdit(dept);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setDepartmentToEdit(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Departments</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage your organization's departments and structure.</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-primary-600/20 transition-all hover:shadow-primary-600/30 focus:ring-2 focus:ring-primary-500/30"
        >
          <Plus size={18} />
          New Department
        </button>
      </div>

      <DepartmentList onEdit={handleEdit} />

      {isFormOpen && (
        <DepartmentForm
          onClose={handleClose}
          departmentToEdit={departmentToEdit}
        />
      )}
    </div>
  );
}
