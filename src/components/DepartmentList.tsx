import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDepartments, deleteDepartment, type Department } from '../api/departments';
import {
  Pencil,
  Trash2,
  Building2,
  ArrowUpDown,
  Search,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { AssignManagerModal } from './AssignManagerModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { toast } from 'sonner';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  onEdit: (department: Department) => void;
}

export function DepartmentList({ onEdit }: Props) {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState<string>('all');
  const [assignManagerDept, setAssignManagerDept] = useState<Department | null>(null);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);

  const { data: rawDepartments, isLoading, isError } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success("Department deleted successfully!");
      setDeptToDelete(null);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || error.message || "Failed to delete department.";
      toast.error(msg);
    },
  });

  // Apply custom filtering for manager assignment status
  const departments = rawDepartments?.filter((dept) => {
    if (managerFilter === 'assigned') return !!dept.managerId;
    if (managerFilter === 'unassigned') return !dept.managerId;
    return true;
  });

  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: "departmentName",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 hover:bg-slate-100 text-slate-700 font-semibold"
          >
            Department Name
            {isSorted === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4 text-primary" />
            ) : isSorted === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4 text-primary" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4 text-slate-400" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const name = row.getValue("departmentName") as string;
        return (
          <div className="flex items-center gap-3 font-semibold text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {name.charAt(0)}
            </div>
            {name}
          </div>
        );
      },
    },
    {
      accessorKey: "departmentCode",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 hover:bg-slate-100 text-slate-700 font-semibold"
          >
            Department Code
            {isSorted === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4 text-primary" />
            ) : isSorted === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4 text-primary" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4 text-slate-400" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-semibold">
          #{row.getValue("departmentCode")}
        </span>
      ),
    },
    {
      accessorKey: "managerId",
      header: "Reporting Manager",
      cell: ({ row }) => {
        const managerId = row.original.managerId;
        return managerId ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium text-xs border border-emerald-200">
            <UserCheck size={12} /> User #{managerId}
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-400 font-normal text-xs italic border border-slate-200">
            Not Assigned
          </span>
        );
      },
    },
    {
      accessorKey: "departmentUrl",
      header: "URL Slug",
      cell: ({ row }) => {
        const url = row.getValue("departmentUrl") as string;
        return (
          <span className="text-slate-500 font-mono text-xs">
            {url ? `/${url}` : <span className="text-slate-300 italic font-sans">None</span>}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const dept = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAssignManagerDept(dept)}
              className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Assign Manager"
            >
              <UserCheck className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(dept)}
              className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
              title="Edit Department"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeptToDelete(dept)}
              className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Department"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const table = useReactTable({
    data: departments || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-slate-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center justify-center border border-red-100">
        <p>Failed to load departments. Please make sure the backend server is active.</p>
      </div>
    );
  }

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalFilteredRows = table.getFilteredRowModel().rows.length;
  const startRow = totalFilteredRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalFilteredRows);

  return (
    <div className="space-y-4">
      
      {/* Search, Filter & Pagination Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        
        {/* Left: Search Box & Manager Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Global Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search department name or code..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-9 focus-visible:ring-primary h-9 text-sm"
            />
          </div>

          {/* Manager Filter Select */}
          <div className="w-full sm:w-48">
            <Select
              value={managerFilter}
              onValueChange={(val) => setManagerFilter(val || "all")}
            >
              <SelectTrigger className="h-9 focus:ring-primary text-sm">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-slate-400" />
                  <SelectValue placeholder="Filter Manager" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="assigned">With Manager</SelectItem>
                <SelectItem value="unassigned">Unassigned Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right: Page Size Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">Rows per page:</span>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px] text-xs focus:ring-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-100">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-slate-600 font-semibold h-12 px-6">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-slate-50 border-slate-100 transition-colors duration-150"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3.5 px-6 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center py-6">
                    <Building2 className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">No departments match your filter.</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing your search query or manager filter.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-sm">
        
        {/* Info */}
        <div className="text-slate-500 text-xs font-medium">
          Showing <span className="font-semibold text-slate-900">{startRow}</span> to{" "}
          <span className="font-semibold text-slate-900">{endRow}</span> of{" "}
          <span className="font-semibold text-slate-900">{totalFilteredRows}</span> departments
        </div>

        {/* Page Nav Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium mr-2">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 rounded-lg hover:bg-slate-100 disabled:opacity-40"
            title="First Page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 rounded-lg hover:bg-slate-100 disabled:opacity-40"
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 rounded-lg hover:bg-slate-100 disabled:opacity-40"
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 rounded-lg hover:bg-slate-100 disabled:opacity-40"
            title="Last Page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

      </div>

      {/* Modals */}
      {assignManagerDept && (
        <AssignManagerModal
          department={assignManagerDept}
          onClose={() => setAssignManagerDept(null)}
        />
      )}

      {deptToDelete && (
        <DeleteConfirmModal
          isOpen={true}
          title="Delete Department"
          description={`Are you sure you want to delete "${deptToDelete.departmentName}" (#${deptToDelete.departmentCode})? This action cannot be undone.`}
          isPending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deptToDelete.id)}
          onClose={() => setDeptToDelete(null)}
        />
      )}
    </div>
  );
}
