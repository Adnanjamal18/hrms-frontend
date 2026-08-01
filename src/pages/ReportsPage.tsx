import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceReportTab } from '../features/report/AttendanceReportTab';
import { LeaveReportTab } from '../features/report/LeaveReportTab';

export const ReportsPage: React.FC = () => {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      </div>
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Attendance Report</TabsTrigger>
          <TabsTrigger value="leave">Leave Report</TabsTrigger>
        </TabsList>
        <TabsContent value="attendance" className="space-y-4">
          <AttendanceReportTab />
        </TabsContent>
        <TabsContent value="leave" className="space-y-4">
          <LeaveReportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
