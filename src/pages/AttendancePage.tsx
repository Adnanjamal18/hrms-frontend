import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAttendanceHistory, getAttendanceReport } from '../api/attendance';
import { AttendanceWidget } from '../components/AttendanceWidget';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  UserCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function AttendancePage() {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Current session / mock user ID for testing daily checkin
  const currentUserId = 'cms28eesj00027cu4m2qnuo3j';

  const { data: report, isLoading: isReportLoading } = useQuery({
    queryKey: ['attendance-report', selectedUserId, startDate, endDate],
    queryFn: () => getAttendanceReport(selectedUserId, startDate, endDate),
  });

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['attendance-history', selectedUserId, startDate, endDate],
    queryFn: () => getAttendanceHistory(selectedUserId, startDate, endDate),
  });

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Clock className="text-primary" size={26} />
          Attendance Management & Time Tracker
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Real-time check-in, work hours tracking, history logs, and attendance analytics
        </p>
      </div>

      {/* Top Grid: Live Check-In Widget & Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Attendance Widget */}
        <div className="lg:col-span-1">
          <AttendanceWidget userId={currentUserId} />
        </div>

        {/* Attendance Summary Analytics */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Days Worked</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar size={18} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-extrabold text-slate-900">{report?.totalDaysWorked || 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Logged workdays</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Hours</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-extrabold text-slate-900">{report?.totalWorkHours || 0} hrs</p>
              <p className="text-xs text-slate-500 mt-0.5">Avg {report?.averageWorkHours || 0} hrs/day</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">On-Time</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-extrabold text-emerald-600">{report?.presentCount || 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">On-time check-ins</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Late Check-Ins</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-extrabold text-amber-600">{report?.lateCount || 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Arrivals after 10:00 AM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-primary" />
            Attendance History & Logs
          </h2>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">From:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">To:</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs h-8 text-slate-500"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Date</TableHead>
                <TableHead className="font-semibold text-slate-700">Employee</TableHead>
                <TableHead className="font-semibold text-slate-700">Check-In</TableHead>
                <TableHead className="font-semibold text-slate-700">Check-Out</TableHead>
                <TableHead className="font-semibold text-slate-700">Work Hours</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isHistoryLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    Loading attendance history...
                  </TableCell>
                </TableRow>
              ) : history && history.length > 0 ? (
                history.map((record) => (
                  <TableRow key={record.id} className="hover:bg-slate-50/80">
                    <TableCell className="font-medium text-slate-900">
                      {new Date(record.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800">
                      {record.user?.fullName || record.userId}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">
                      {new Date(record.checkIn).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '—'}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      {record.workHours ? `${record.workHours} hrs` : 'In Progress'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          record.status === 'PRESENT'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : record.status === 'LATE'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {record.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    No attendance records found for the selected period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
