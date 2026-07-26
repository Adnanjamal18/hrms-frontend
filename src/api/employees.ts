import { apiClient } from './client';

export interface Employee {
  id: number;
  experience: number;
  resumeLink?: string;
  linkedinUrl?: string;
  address?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  branch?: string;
  leaveCount: number;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmployeeDTO {
  experience: number;
  resumeLink?: string;
  linkedinUrl?: string;
  address?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  branch?: string;
}

export interface UpdateEmployeeDTO {
  experience?: number;
  resumeLink?: string;
  linkedinUrl?: string;
  address?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  branch?: string;
}

export const getEmployees = async (): Promise<Employee[]> => {
  const response = await apiClient.get('/employees/getAllEmployees');
  return response.data;
};

export const getEmployeeById = async (userId: number): Promise<Employee> => {
  const response = await apiClient.get(`/employees/getEmployeeById/${userId}`);
  return response.data;
};

export const createEmployee = async ({ userId, data }: { userId: number; data: CreateEmployeeDTO }): Promise<Employee> => {
  const response = await apiClient.post(`/employees/createEmployee/${userId}`, data);
  return response.data;
};

export const updateEmployee = async ({ userId, data }: { userId: number; data: UpdateEmployeeDTO }): Promise<Employee> => {
  const response = await apiClient.put(`/employees/updateEmployee/${userId}`, data);
  return response.data;
};

export const deleteEmployee = async (userId: number): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/employees/deleteEmployee/${userId}`);
  return response.data;
};

export const assignDepartment = async ({ userId, departmentId }: { userId: number; departmentId: number }): Promise<any> => {
  const response = await apiClient.post(`/employees/assignDepartment/${userId}`, { departmentId });
  return response.data;
};
