// frontend/src/lib/api.ts - Updated axios client with PUT and DELETE methods
import axios, { AxiosResponse } from 'axios';
import { getSocket } from './socket';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

// Request interceptor to add auth token and socket ID
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const socket = getSocket();
  if (socket && socket.id) {
    config.headers['x-socket-id'] = socket.id;
  }

  return config;
});

// Response interceptor for consistent error handling
API.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Log the error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Re-throw the error so it can be handled by the calling code
    throw error;
  }
);

export default API;