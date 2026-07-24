import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDepartments, deleteDepartment, type Department } from '../api/departments';
import { Pencil, Trash2, Building2, ArrowUpDown, Search } from 'lucide-react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table"
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Props {
  onEdit: (department: Department) => void;
}

export function DepartmentList({ onEdit }: Props) {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const { data: departments, isLoading, isError } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: "departmentName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 hover:bg-slate-100"
          >
            Department Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const name = row.getValue("departmentName") as string;
        return (
          <div className="flex items-center gap-3 font-medium text-slate-900">
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">
              {name.charAt(0)}
            </div>
            {name}
          </div>
        )
      }
    },
    {
      accessorKey: "departmentCode",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 hover:bg-slate-100"
          >
            Code
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-xs">
          #{row.getValue("departmentCode")}
        </span>
      ),
    },
    {
      accessorKey: "departmentUrl",
      header: "URL Slug",
      cell: ({ row }) => {
        const url = row.getValue("departmentUrl") as string;
        return <span className="text-slate-500">{url || <span className="text-slate-300 italic">None</span>}</span>
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const dept = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(dept)}
              className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-slate-50"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this department?')) {
                  deleteMutation.mutate(dept.id);
                }
              }}
              disabled={deleteMutation.isPending}
              className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: departments || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center justify-center border border-red-100">
        <p>Failed to load departments. Please make sure the backend is running.</p>
      </div>
    );
  }

  if (!departments?.length) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
        <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
          <Building2 className="text-slate-400" size={24} />
        </div>
        <h3 className="text-slate-800 font-medium mb-1">No departments found</h3>
        <p className="text-slate-500 text-sm">Get started by creating a new department.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm max-w-sm w-full">
        <Search className="h-4 w-4 text-slate-400 ml-2" />
        <Input
          placeholder="Search departments..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="max-w-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none h-8"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-100">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-slate-600 font-semibold h-14 px-6">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-slate-50 border-slate-100 transition-colors duration-200"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 px-6">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
