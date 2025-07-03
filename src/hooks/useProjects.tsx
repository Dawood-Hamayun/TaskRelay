// frontend/src/hooks/useProjects.ts - Fixed with proper avatar types
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/api';
import { useAuth } from './useAuth';

export interface Project {
  id: string;
  name: string;
  description?: string;
  members: {
    id: string;
    userId: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
    createdAt: string;
    user: {
      id: string;
      name?: string;
      email: string;
      avatar?: string; // Make avatar optional
      color?: string;  // Make color optional
    };
  }[];
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    todo: number;
    inReview?: number;   // <– add this

  };
  meetings: {
    id: string;
    title: string;
    datetime: string;
  }[];
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
  createdAt: string;
  lastActivity: string;
  status: 'active' | 'completed' | 'archived';
  _count?: {
    tasks: number;
    members: number;
  };
}

export const useProjects = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // User-specific query key to prevent cross-user cache pollution
  const queryKey = ['projects', user?.userId];

  const { 
    data: projects = [], 
    isLoading, 
    error,
    refetch
  } = useQuery<Project[]>({
    queryKey,
    queryFn: async () => {
      console.log('🔍 Fetching projects for user:', user?.email, user?.userId);
      try {
        const res = await API.get('/projects');
        console.log('✅ Projects response:', {
          count: res.data?.length || 0,
          isArray: Array.isArray(res.data),
          userEmail: user?.email,
          userId: user?.userId,
          firstProject: res.data?.[0] ? {
            id: res.data[0].id,
            name: res.data[0].name,
            membersCount: res.data[0].members?.length || 0,
            firstMember: res.data[0].members?.[0] ? {
              id: res.data[0].members[0].user.id,
              email: res.data[0].members[0].user.email,
              hasAvatar: !!res.data[0].members[0].user.avatar,
              avatarValue: res.data[0].members[0].user.avatar
            } : null
          } : null
        });
        
        // Ensure we always return an array
        if (!Array.isArray(res.data)) {
          console.warn('⚠️ Projects response is not an array, returning empty array');
          return [];
        }
        
        return res.data;
      } catch (error) {
        console.error('❌ Error fetching projects:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && !!user?.userId,
    staleTime: 30000,
    gcTime: 300000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      console.log('🔨 Creating project:', data, 'for user:', user?.email);
      const res = await API.post('/projects', data);
      console.log('✅ Project created:', res.data);
      return res.data;
    },
    onSuccess: (newProject) => {
      console.log('✅ Project creation successful, updating cache for user:', user?.email);
      queryClient.setQueryData<Project[]>(queryKey, (old) => {
        const currentProjects = Array.isArray(old) ? old : [];
        return [newProject, ...currentProjects];
      });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error('❌ Failed to create project:', error);
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: { name?: string; description?: string } }) => {
      console.log('📝 Updating project:', projectId, 'with data:', data);
      
      // Validate input exists
      if (!data) {
        throw new Error('Update data is required');
      }
      
      // Validate at least one field is provided
      if (!data.name && data.description === undefined) {
        throw new Error('At least one field must be provided for update');
      }
      
      // Validate name is not empty if provided
      if (data.name !== undefined && !data.name.trim()) {
        throw new Error('Project name cannot be empty');
      }

      const res = await API.put(`/projects/${projectId}`, data);
      console.log('✅ Project updated:', res.data);
      return res.data;
    },
    onSuccess: (updatedProject) => {
      console.log('✅ Project update successful, updating cache');
      // Update the specific project in cache
      queryClient.setQueryData<Project[]>(queryKey, (old) => {
        const currentProjects = Array.isArray(old) ? old : [];
        return currentProjects.map(project => 
          project.id === updatedProject.id ? updatedProject : project
        );
      });
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error('❌ Failed to update project:', error);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      console.log('🗑️ Deleting project:', projectId);
      const res = await API.delete(`/projects/${projectId}`);
      console.log('✅ Delete response:', res.data);
      return { projectId, ...res.data };
    },
    onSuccess: (result) => {
      console.log('✅ Project deletion successful, updating cache');
      // Remove project from cache
      queryClient.setQueryData<Project[]>(queryKey, (old) => {
        const currentProjects = Array.isArray(old) ? old : [];
        return currentProjects.filter(p => p.id !== result.projectId);
      });
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error('❌ Failed to delete project:', error);
    },
  });

  // Helper function to get user's role in a project
  const getUserRole = (project: Project, userId: string): string | null => {
    if (!project?.members || !Array.isArray(project.members)) {
      return null;
    }
    const membership = project.members.find(member => member.user.id === userId);
    return membership?.role || null;
  };

  // Helper function to check if user is owner/admin
  const canManageProject = (project: Project, userId: string): boolean => {
    const role = getUserRole(project, userId);
    return role === 'OWNER' || role === 'ADMIN';
  };

  // Helper function to get project progress percentage
  const getProjectProgress = (project: Project): number => {
    if (!project?.tasks || project.tasks.total === 0) return 0;
    return Math.round((project.tasks.completed / project.tasks.total) * 100);
  };

  // Helper function to get project by ID
  const getProjectById = (projectId: string): Project | undefined => {
    if (!Array.isArray(projects)) return undefined;
    return projects.find(project => project.id === projectId);
  };

  // Ensure projects is always an array
  const safeProjects = Array.isArray(projects) ? projects : [];

  return {
    projects: safeProjects,
    isLoading,
    error,
    refetch,
    createProject: createProjectMutation.mutateAsync,
    isCreating: createProjectMutation.isPending,
    updateProject: updateProjectMutation.mutateAsync,
    isUpdating: updateProjectMutation.isPending,
    deleteProject: deleteProjectMutation.mutateAsync,
    isDeleting: deleteProjectMutation.isPending,
    
    // Helper functions
    getUserRole,
    canManageProject,
    getProjectProgress,
    getProjectById,
  };
};