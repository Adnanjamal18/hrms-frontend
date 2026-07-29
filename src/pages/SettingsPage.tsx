import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DesignationsTab } from '../features/settings/DesignationsTab';
import { EmploymentTypesTab } from '../features/settings/EmploymentTypesTab';
import { LeaveTypesTab } from '../features/settings/LeaveTypesTab';
import { RolesTab } from '../features/settings/RolesTab';

export const SettingsPage: React.FC = () => {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      <Tabs defaultValue="designations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="designations">Designations</TabsTrigger>
          <TabsTrigger value="employment">Employment Types</TabsTrigger>
          <TabsTrigger value="leavetypes">Leave Types</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>
        <TabsContent value="designations" className="space-y-4">
          <DesignationsTab />
        </TabsContent>
        <TabsContent value="employment" className="space-y-4">
          <EmploymentTypesTab />
        </TabsContent>
        <TabsContent value="leavetypes" className="space-y-4">
          <LeaveTypesTab />
        </TabsContent>
        <TabsContent value="roles" className="space-y-4">
          <RolesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
