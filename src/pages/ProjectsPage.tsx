import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { authClient } from '../app/better-auth';
import axios from 'axios';
import { Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const ProjectsPage: React.FC = () => {
  const { data: session } = authClient.useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const user = session?.user as any;
  const isAdmin = user?.roleId === 1 || user?.roleId === 2;

  // Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');
  const [teamLeadId, setTeamLeadId] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  // Assign Team State
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignProjectId, setAssignProjectId] = useState<number | null>(null);
  const [assignEmployeeId, setAssignEmployeeId] = useState('');

  useEffect(() => {
    fetchProjects();
    if (isAdmin) {
      fetchDepartments();
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/departments/getAllDepartments', { withCredentials: true });
      setDepartments(res.data.departments || res.data); // It returns an array directly based on repo
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/user', { withCredentials: true });
      setUsers(res.data?.data?.users || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? 'http://localhost:5000/api/projects' : 'http://localhost:5000/api/projects/my-projects';
      const res = await axios.get(endpoint, { withCredentials: true });
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/projects', {
        name,
        description,
        managerId,
        teamLeadId,
        departmentId: parseInt(departmentId)
      }, { withCredentials: true });
      setIsCreateOpen(false);
      setName('');
      setDescription('');
      setManagerId('');
      setTeamLeadId('');
      setDepartmentId('');
      fetchProjects();
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  const handleAssignEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignProjectId || !assignEmployeeId) return;
    try {
      await axios.post('http://localhost:5000/api/projects/assign-employee', {
        projectId: assignProjectId,
        employeeUserId: assignEmployeeId
      }, { withCredentials: true });
      setIsAssignOpen(false);
      setAssignEmployeeId('');
      alert("Employee assigned successfully!");
    } catch (error: any) {
      console.error("Failed to assign employee", error);
      alert(error.response?.data?.error || "Failed to assign employee");
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
        {isAdmin && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            {/* @ts-ignore */}
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} /> Create Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    value={departmentId} 
                    onChange={e => {
                      const newDeptId = e.target.value;
                      setDepartmentId(newDeptId);
                      const dept = departments.find(d => d.id === parseInt(newDeptId));
                      if (dept && dept.managerId) {
                        setManagerId(dept.managerId);
                      } else {
                        setManagerId('');
                      }
                    }} 
                    required
                  >
                    <option value="" disabled>Select Department</option>
                    {Array.isArray(departments) && departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Manager</Label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    value={managerId} 
                    onChange={e => setManagerId(e.target.value)} 
                    required
                  >
                    <option value="" disabled>Select Manager</option>
                    {Array.isArray(users) && users
                      .filter(u => {
                        if (departmentId) {
                          const dept = departments.find(d => d.id === parseInt(departmentId));
                          return dept ? u.id === dept.managerId : false;
                        }
                        return u.roleId === 3 || u.roleId === 1 || u.roleId === 2;
                      })
                      .map(user => (
                        <option key={user.id} value={user.id}>{user.fullName} ({user.email})</option>
                      ))
                    }
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Team Lead</Label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    value={teamLeadId} 
                    onChange={e => setTeamLeadId(e.target.value)} 
                    required
                  >
                    <option value="" disabled>Select Team Lead</option>
                    {Array.isArray(users) && users
                      .filter(u => {
                        if (!departmentId) return true;
                        // Filter users who belong to the selected department
                        return u.departments?.some((d: any) => d.departmentId === parseInt(departmentId));
                      })
                      .map(user => (
                        <option key={user.id} value={user.id}>{user.fullName} ({user.email})</option>
                      ))
                    }
                  </select>
                </div>
                <Button type="submit" className="w-full">Create Project</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Employee to Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAssignEmployee} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <select 
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                  value={assignEmployeeId} 
                  onChange={e => setAssignEmployeeId(e.target.value)} 
                  required
                >
                  <option value="" disabled>Select Employee</option>
                  {Array.isArray(users) && users.map(user => (
                    <option key={user.id} value={user.id}>{user.fullName} ({user.email})</option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full">Assign Employee</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Description</TableHead>
              {isAdmin && <TableHead>Department</TableHead>}
              {isAdmin && <TableHead>Manager</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 3} className="text-center h-24">Loading...</TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 3} className="text-center h-24 text-slate-500">
                  No projects found.
                </TableCell>
              </TableRow>
            ) : (
              projects.map(project => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <Link to={`/projects/${project.id}`} className="text-blue-600 hover:underline">
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-500">{project.description || '-'}</TableCell>
                  {isAdmin && <TableCell>{project.department?.departmentName || project.departmentId}</TableCell>}
                  {isAdmin && <TableCell>{project.manager?.fullName || project.managerId}</TableCell>}
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {project.status || 'Active'}
                    </span>
                  </TableCell>
                  {(isAdmin || project.managerId === session?.user?.id) && (
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2 ml-auto"
                        onClick={() => {
                          setAssignProjectId(project.id);
                          setIsAssignOpen(true);
                        }}
                      >
                        <Users size={14} /> Assign Team
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
