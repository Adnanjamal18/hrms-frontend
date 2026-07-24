import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { Toaster } from "@/components/ui/sonner";
import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeDetailsPage } from './pages/EmployeeDetailsPage';

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/:userId" element={<EmployeeDetailsPage />} />
          {/* Add more routes as needed */}
        </Routes>
      </DashboardLayout>
      <Toaster position="top-right" richColors />
    </Router>
  );
}

export default App;
