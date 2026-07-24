import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus, Download, Users, Briefcase, Building2, TrendingUp } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const employees = [
  { id: "EMP-001", name: "Alice Johnson", email: "alice@hrms.com", department: "Engineering", status: "Active", role: "Senior Developer" },
  { id: "EMP-002", name: "Bob Smith", email: "bob@hrms.com", department: "Design", status: "Active", role: "UI/UX Designer" },
  { id: "EMP-003", name: "Charlie Brown", email: "charlie@hrms.com", department: "Marketing", status: "On Leave", role: "Marketing Manager" },
  { id: "EMP-004", name: "Diana Prince", email: "diana@hrms.com", department: "HR", status: "Active", role: "HR Specialist" },
  { id: "EMP-005", name: "Evan Wright", email: "evan@hrms.com", department: "Engineering", status: "Active", role: "Frontend Developer" },
]

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-lg">Welcome back! Here's an overview of your organization.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Employees</CardTitle>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">1,248</div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" /> +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Departments</CardTitle>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Building2 className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">12</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Across 3 office locations
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Projects</CardTitle>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Briefcase className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">43</div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" /> +4 new this week
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-white border-b px-6 py-5">
          <div>
            <CardTitle className="text-xl text-slate-900">Recent Employees</CardTitle>
            <CardDescription className="mt-1">Latest team members added to the platform.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex border-slate-200">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button size="sm" className="bg-primary-600 hover:bg-primary-700 shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[100px] font-semibold text-slate-600">Emp ID</TableHead>
                <TableHead className="font-semibold text-slate-600">Name</TableHead>
                <TableHead className="font-semibold text-slate-600">Role</TableHead>
                <TableHead className="font-semibold text-slate-600">Department</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} className="group hover:bg-slate-50/50 border-slate-100 transition-colors">
                  <TableCell className="font-medium text-slate-500">{employee.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{employee.name}</span>
                      <span className="text-xs text-slate-500">{employee.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{employee.role}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                      {employee.department}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={employee.status === "Active" ? "default" : "secondary"} 
                           className={employee.status === "Active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shadow-none border-none" : "bg-amber-100 text-amber-700 hover:bg-amber-100 shadow-none border-none"}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Employee</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600">Deactivate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
