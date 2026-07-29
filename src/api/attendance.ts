import { apiClient } from './client';

export interface AttendanceRecord {
  id: number;
  userId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT';
  workHours?: number;
  notes?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface TodayStatusResponse {
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  record?: AttendanceRecord;
}

export interface AttendanceReportResponse {
  totalDaysWorked: number;
  totalWorkHours: number;
  averageWorkHours: number;
  presentCount: number;
  lateCount: number;
  records: AttendanceRecord[];
}

export const checkIn = async ({ userId, notes }: { userId: string; notes?: string }): Promise<{ message: string; data: AttendanceRecord }> => {
  const response = await apiClient.post('/attendance/check-in', { userId, notes });
  return response.data;
};

export const checkOut = async ({ userId }: { userId: string }): Promise<{ message: string; data: AttendanceRecord }> => {
  const response = await apiClient.post('/attendance/check-out', { userId });
  return response.data;
};

export const getTodayStatus = async (userId: string): Promise<TodayStatusResponse> => {
  const response = await apiClient.get(`/attendance/today/${userId}`);
  return response.data;
};

export const getAttendanceHistory = async (userId?: string, startDate?: string, endDate?: string): Promise<AttendanceRecord[]> => {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await apiClient.get(`/attendance/history?${params.toString()}`);
  return response.data;
};

export const getAttendanceReport = async (userId?: string, startDate?: string, endDate?: string): Promise<AttendanceReportResponse> => {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await apiClient.get(`/attendance/report?${params.toString()}`);
  return response.data;
};
