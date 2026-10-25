import { apiClient } from './client';

export interface UpdateProfileDTO {
  fullName?: string;
  email?: string;
  mobile?: string;
  image?: string;
}

export const updateSelfProfile = async (userId: string, data: UpdateProfileDTO): Promise<any> => {
  const response = await apiClient.patch(`/selfservice/update-profile/${userId}`, data);
  return response.data;
};

export const updateSelfPassword = async (
  userId: string,
  currentpassword: string,
  newpassword: string
): Promise<any> => {
  const response = await apiClient.patch(`/selfservice/update-password/${userId}`, {
    currentpassword,
    newpassword,
  });
  return response.data;
};
