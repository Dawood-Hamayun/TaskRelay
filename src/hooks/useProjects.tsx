// hooks/useProjects.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import API from '@/lib/api';

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  members?: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      name?: string;
      email: string;
    };
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  }>;
}

export const useProjects = () => {
  const { data: projects = [], isLoading, error } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await API.get('/projects');
      return res.data;
    },
  });

  return {
    projects,
    isLoading,
    error,
  };
};