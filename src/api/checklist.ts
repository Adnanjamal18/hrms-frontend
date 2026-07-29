import { apiClient } from './client';

export interface JoiningChecklist {
  id: number;
  userId: string;
  documentsSubmitted: boolean;
  bankDetailsVerified: boolean;
  idCardIssued: boolean;
  assetAssigned: boolean;
  orientationDone: boolean;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const getChecklist = async (userId: string): Promise<JoiningChecklist> => {
  const response = await apiClient.get(`/checklist/${userId}`);
  return response.data;
};

export const updateChecklist = async ({
  userId,
  data,
}: {
  userId: string;
  data: Partial<JoiningChecklist>;
}): Promise<JoiningChecklist> => {
  const response = await apiClient.put(`/checklist/${userId}`, data);
  return response.data;
};

export const getAllChecklists = async (): Promise<JoiningChecklist[]> => {
  const response = await apiClient.get('/checklist/all');
  return response.data;
};
