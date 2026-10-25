import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://hrms-backend-latest-chv2.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});
