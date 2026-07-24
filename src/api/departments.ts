import { apiClient } from './client';

export interface Department {
  id: number;
  departmentName: string;
  departmentCode: number;
  departmentUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDepartmentDTO {
  departmentName: string;
  departmentCode: number;
  departmentUrl?: string;
}

export interface UpdateDepartmentDTO {
  departmentName?: string;
  departmentCode?: number;
  departmentUrl?: string;
}

export const getDepartments = async (): Promise<Department[]> => {
  const response = await apiClient.get('/departments/getAllDepartments');
  return response.data;
};

export const createDepartment = async (data: CreateDepartmentDTO): Promise<Department> => {
  const response = await apiClient.post('/departments/createDepartment', data);
  return response.data;
};

export const updateDepartment = async ({ id, data }: { id: number; data: UpdateDepartmentDTO }): Promise<Department> => {
  const response = await apiClient.put(`/departments/updateDepartment/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id: number): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/departments/deleteDepartment/${id}`);
  return response.data;
};
