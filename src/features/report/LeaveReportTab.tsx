import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { Download } from 'lucide-react';

export const LeaveReportTab: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('ALL');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (status !== 'ALL') params.append('status', status);
      
      const res = await axios.get(`http://localhost:5000/api/reports/leave?${params.toString()}`, { withCredentials: true });
      setRecords(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport();
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium">Leave Report</h3>
          <p className="text-sm text-slate-500">View and filter employee leave requests</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download size={16} /> Export
        </Button>
      </div>

      <form onSubmit={handleFilter} className="flex gap-4 mb-6 items-end">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">Start Date</label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">End Date</label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div className="space-y-1 min-w-[150px]">
          <label className="text-xs font-medium text-slate-500">Status</label>
          <select 
            className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            value={status} 
            onChange={e => setStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <Button type="submit">Filter</Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-slate-500">No records found</TableCell>
              </TableRow>
            ) : (
              records.map(record => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.user?.fullName}</TableCell>
                  <TableCell>{record.leaveType?.type || '-'}</TableCell>
                  <TableCell>{new Date(record.fromDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(record.toDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      record.approveStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      record.approveStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {record.approveStatus}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
