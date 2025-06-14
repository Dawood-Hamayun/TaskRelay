// hooks/useTasks.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/api';
import { Task, CreateTaskDto, UpdateTaskDto } from '@/types/task';

export const useTasks = (projectId?: string) => {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery<Task[]>({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await API.get(`/tasks/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
  });

  const createTaskMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: CreateTaskDto }) => {
      const res = await API.post(`/tasks/${projectId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
    onError: (error) => {
      console.error('Failed to create task:', error);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskDto }) => {
      const res = await API.patch(`/tasks/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
    onError: (error) => {
      console.error('Failed to update task:', error);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await API.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
    onError: (error) => {
      console.error('Failed to delete task:', error);
    },
  });

  // Get a single task by ID
  const getTask = (taskId: string) => {
    return tasks.find(task => task.id === taskId) || null;
  };

  // Get tasks by status
  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  return {
    // Data
    tasks,
    isLoading,
    error,
    
    // Mutations
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    
    // Loading states
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    
    // Helper functions
    getTask,
    getTasksByStatus,
  };
};