import { useState } from 'react';
import { EmployeeList } from '../components/EmployeeList';
import { EmployeeForm } from '../components/EmployeeForm';
import type { Employee } from '../api/employees';
import { Plus } from 'lucide-react';

export function EmployeesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const handleOpenNew = () => {
    setEmployeeToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEmployeeToEdit(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Employees</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage your organization's employees and their details.</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-primary-600/20 transition-all hover:shadow-primary-600/30 focus:ring-2 focus:ring-primary-500/30"
        >
          <Plus size={18} />
          New Employee
        </button>
      </div>

      <EmployeeList onEdit={handleEdit} />

      {isFormOpen && (
        <EmployeeForm
          onClose={handleClose}
          employeeToEdit={employeeToEdit}
        />
      )}
    </div>
  );
}
