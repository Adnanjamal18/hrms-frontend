import { apiClient } from './client';

export interface Employee {
  id: string;
  username: string;
  fullName: string;
  email: string;
  mobile: string;
  roleId: number;
  experience?: number;
  resumeLink?: string;
  linkedinUrl?: string;
  address?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  branch?: string;
  leaveCount?: number;
  role?: { id?: number; rolename: string; rolecode?: number };
  departments?: Array<{
    id: number;
    departmentId: number;
    department?: { id: number; departmentName: string; departmentCode: number };
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmployeeDTO {
  username: string;
  fullName: string;
  email: string;
  password: string;
  mobile: string;
  roleId: number;
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
  username?: string;
  fullName?: string;
  email?: string;
  password?: string;
  mobile?: string;
  roleId?: number;
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

export const getEmployeeById = async (userId: string): Promise<Employee> => {
  const response = await apiClient.get(`/employees/getEmployeeById/${userId}`);
  return response.data;
};

export const createEmployee = async (data: CreateEmployeeDTO): Promise<any> => {
  const response = await apiClient.post('/employees/createEmployee', data);
  return response.data;
};

export const updateEmployee = async ({ userId, data }: { userId: string; data: UpdateEmployeeDTO }): Promise<Employee> => {
  const response = await apiClient.put(`/employees/updateEmployee/${userId}`, data);
  return response.data;
};

export const deleteEmployee = async (userId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/employees/deleteEmployee/${userId}`);
  return response.data;
};

export const assignDepartment = async ({ userId, departmentId }: { userId: string; departmentId: number }): Promise<any> => {
  const response = await apiClient.post(`/employees/assignDepartment/${userId}`, { departmentId });
  return response.data;
};

export const getDocumentUrl = async (userId: string): Promise<{ downloadUrl: string }> => {
  const response = await apiClient.get(`/employees/getDocumentUrl/${userId}`);
  return response.data;
};

export const deleteDocument = async (userId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/employees/deleteDocument/${userId}`);
  return response.data;
};

export const generateSignedUploadUrl = async (fileName: string, contentType: string): Promise<{ uploadUrl: string; key: string }> => {
  const response = await apiClient.post('/employees/resume/upload-url', { fileName, contentType });
  return response.data;
};

export const uploadFileToS3 = async (uploadUrl: string, file: File): Promise<void> => {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/pdf',
    },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Failed to upload file to storage: ${res.statusText}`);
  }
};

export const sendInvite = async (userId: string): Promise<{ message: string; email?: string }> => {
  const response = await apiClient.post(`/employees/sendInvite/${userId}`);
  return response.data;
};

export const activateAccount = async (token: string): Promise<{ message: string; user?: any }> => {
  const response = await apiClient.post('/employees/activate', { token });
  return response.data;
};
