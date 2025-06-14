// frontend/src/lib/socket.ts
import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';

let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
    auth: {
      token,
    },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('🔌 Socket connection error:', error);
  });

  return socket;
};

export const getSocket = () => socket;

export const useSocket = () => {
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  useEffect(() => {
    setSocketInstance(getSocket());
  }, []);

  return socketInstance;
};