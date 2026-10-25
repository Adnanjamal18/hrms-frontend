import { apiClient } from './client';

export interface Salary {
  id: number;
  userId: string;
  amount: number;
  createdAt: string;
}

export interface PayrollRecord {
  id: number;
  userId: string;
  amount: number;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    mobile?: string;
  };
}

export interface PayslipData {
  id: number;
  userId: string;
  amount: number;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
    mobile?: string;
    salaries?: Salary[];
  };
}

export const createSalary = async (userId: string, amount: number): Promise<Salary> => {
  const response = await apiClient.post(`/payroll/create-salary/${userId}`, { amount });
  return response.data?.data;
};

export const getSalaryByUserId = async (userId: string): Promise<Salary | null> => {
  try {
    const response = await apiClient.get(`/payroll/get-salary/${userId}`);
    return response.data?.data || null;
  } catch (error) {
    return null;
  }
};

export const createPayroll = async (userId: string, amount: number): Promise<PayrollRecord> => {
  const response = await apiClient.post(`/payroll/create-payroll/${userId}`, { amount });
  return response.data?.data;
};

export const getPayrollsByUserId = async (userId: string): Promise<PayrollRecord[]> => {
  const response = await apiClient.get(`/payroll/get-payrolls/${userId}`);
  return response.data?.data || [];
};

export const getPayslip = async (payrollId: number): Promise<PayslipData> => {
  const response = await apiClient.get(`/payroll/payslip/${payrollId}`);
  return response.data?.data;
};

export const getCompanyPayrollReport = async (startDate?: string, endDate?: string): Promise<PayrollRecord[]> => {
  const params: any = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await apiClient.get('/api/reports/payroll', { params, withCredentials: true });
  return response.data || [];
};
