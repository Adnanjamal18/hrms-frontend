import { apiClient } from './client';

export interface Job {
  id: number;
  jobTitle: string;
  jobDescription?: string;
  departmentId?: number;
  department?: {
    id: number;
    departmentName: string;
  };
  applications?: JobApplication[];
  _count?: {
    applications: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: number;
  jobId: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  experience?: number;
  skills?: string;
  interviewDate?: string;
  currentCompany?: string;
  noticePeriod?: number;
  ctc?: number;
  expectedCtc?: number;
  resumeLink?: string;
  linkedinUrl?: string;
  status: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';
  createdAt?: string;
}

export const getAllJobs = async (): Promise<Job[]> => {
  const response = await apiClient.get('/recruitment/get-all-jobs');
  return response.data?.data || [];
};

export const createJob = async (data: { title: string; description: string; departmentid: number }): Promise<Job> => {
  const response = await apiClient.post('/recruitment/create-job', data);
  return response.data?.data;
};

export const updateJob = async (id: number, data: { title?: string; description?: string; departmentId?: number }): Promise<Job> => {
  const response = await apiClient.patch(`/recruitment/update-job/${id}`, { id, ...data });
  return response.data?.data;
};

export const deleteJob = async (id: number): Promise<void> => {
  await apiClient.delete(`/recruitment/delete-job/${id}`);
};

export const getCandidatesByJobId = async (jobId: number): Promise<JobApplication[]> => {
  const response = await apiClient.get(`/recruitment/get-all-candidates/${jobId}`);
  return response.data?.data || [];
};

export const createCandidate = async (data: {
  name: string;
  email: string;
  phone: string;
  address?: string;
  experience?: number;
  skills?: string;
  currentCompany?: string;
  noticePeriod?: number;
  ctc?: number;
  expectedCtc?: number;
  resumeLink?: string;
  jobId: number;
}): Promise<JobApplication> => {
  const response = await apiClient.post('/recruitment/create-candidate', data);
  return response.data?.data;
};

export const updateCandidateStatus = async (
  candidateId: number,
  status: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED'
): Promise<JobApplication> => {
  const response = await apiClient.put(`/recruitment/update-candidate-status/${candidateId}`, { status });
  return response.data?.data;
};
