import axios from 'axios';
import { getSocket } from './socket';  // your socket manager

const API = axios.create({
  baseURL: 'http://localhost:3000',
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const socket = getSocket();
  if (socket && socket.id) {
    config.headers['x-socket-id'] = socket.id;  // 👈 ADD SOCKET ID HEADER
  }

  return config;
});

export default API;