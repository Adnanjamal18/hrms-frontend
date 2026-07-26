import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './features/auth/AuthPage';
import { DashboardLayout } from './layout/DashboardLayout';
import { UsersList } from './features/dashboard/UsersList';
import { LeaveManagement } from './features/dashboard/LeaveManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<UsersList />} />
          <Route path="leave" element={<LeaveManagement />} />
          <Route path="reports" element={<div className="p-8 text-slate-500">Reports Module (Coming Soon)</div>} />
          <Route path="settings" element={<div className="p-8 text-slate-500">Settings Module (Coming Soon)</div>} />
        </Route>
        <Route path="/" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
