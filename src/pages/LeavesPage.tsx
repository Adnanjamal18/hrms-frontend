import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Check, X } from "lucide-react";
import { authClient } from '@/app/better-auth';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const LeavesPage: React.FC = () => {
  const { data: session } = authClient.useSession();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [open, setOpen] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      fetchLeaveHistory();
      fetchPendingLeaves();
      fetchDepartments();
      fetchLeaveTypes();
    }
  }, [session]);

  const fetchLeaveHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/leaves/history', { withCredentials: true });
      setLeaves(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingLeaves = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/leaves/pending', { withCredentials: true });
      setPendingLeaves(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/departments/getAllDepartments', { withCredentials: true });
      setDepartments(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/leave-types', { withCredentials: true });
      setLeaveTypes(res.data);
    } catch (e) { console.error(e); }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/leaves/apply', {
        departmentId: parseInt(departmentId, 10),
        leaveTypeId,
        fromDate: new Date(fromDate).toISOString(),
        toDate: new Date(toDate).toISOString(),
        purpose
      }, { withCredentials: true });
      
      toast.success("Leave applied successfully");
      setOpen(false);
      // Reset form
      setDepartmentId("");
      setLeaveTypeId("");
      setFromDate("");
      setToDate("");
      setPurpose("");
      fetchLeaveHistory();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to apply for leave");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await axios.patch(`http://localhost:5000/api/leaves/${id}/approve`, {}, { withCredentials: true });
      toast.success("Leave approved");
      fetchPendingLeaves();
      fetchLeaveHistory();
    } catch (e) { console.error(e); }
  };

  const handleReject = async (id: number) => {
    try {
      await axios.patch(`http://localhost:5000/api/leaves/${id}/reject`, {}, { withCredentials: true });
      toast.success("Leave rejected");
      fetchPendingLeaves();
      fetchLeaveHistory();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Leave Management</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="flex items-center gap-2" />}>
            <Plus size={16} /> Apply for Leave
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleApplyLeave}>
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <select 
                    className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={departmentId} 
                    onChange={e => setDepartmentId(e.target.value)} 
                    required
                  >
                    <option value="" disabled>Select Department</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Leave Type</label>
                  <select 
                    className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={leaveTypeId} 
                    onChange={e => setLeaveTypeId(e.target.value)} 
                    required
                  >
                    <option value="" disabled>Select Leave Type</option>
                    {leaveTypes.map((lt: any) => (
                      <option key={lt.id} value={lt.id}>{lt.type}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">From Date</label>
                    <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">To Date</label>
                    <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Purpose</label>
                  <Input value={purpose} onChange={e => setPurpose(e.target.value)} required placeholder="Reason for leave..." />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Applying..." : "Submit"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Annual Allowance</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">20</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Leaves Taken</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">5</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Remaining Balance</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">15</p>
        </div>
      </div>

      {(session?.user as any)?.roleId === 1 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-amber-600">Pending Approvals (Admin)</h3>
            <p className="text-sm text-slate-500">Leaves awaiting manager approval</p>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLeaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">No pending approvals.</TableCell>
                  </TableRow>
                ) : (
                  pendingLeaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell className="font-medium">{leave.user?.fullName || "Employee"}</TableCell>
                      <TableCell>{leave.leaveType?.type || "Standard"}</TableCell>
                      <TableCell>{new Date(leave.fromDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(leave.toDate).toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={leave.purpose}>{leave.purpose}</TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApprove(leave.id)}>
                          <Check size={16} className="mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleReject(leave.id)}>
                          <X size={16} className="mr-1" /> Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Leave History</h3>
          <p className="text-sm text-slate-500">Your past and upcoming leave requests</p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
                </TableRow>
              ) : leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">No leave history found.</TableCell>
                </TableRow>
              ) : (
                leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">{leave.leaveType?.type || "Standard"}</TableCell>
                    <TableCell>{new Date(leave.fromDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(leave.toDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        leave.approveStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        leave.approveStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {leave.approveStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {leave.requestStatus === "OPEN" && (
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
