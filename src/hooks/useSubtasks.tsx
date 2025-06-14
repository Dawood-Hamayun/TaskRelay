// hooks/useSubtasks.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/api';
import { CreateSubtaskDto, UpdateSubtaskDto } from '@/types/task';

export const useSubtasks = (projectId?: string) => {
  const queryClient = useQueryClient();

  const createSubtaskMutation = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: CreateSubtaskDto }) => {
      const res = await API.post(`/subtasks/task/${taskId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
    onError: (error) => {
      console.error('Failed to create subtask:', error);
    },
  });

  const createMultipleSubtasksMutation = useMutation({
    mutationFn: async ({ taskId, subtasks }: { taskId: string; subtasks: CreateSubtaskDto[] }) => {
      const res = await API.post(`/subtasks/task/${taskId}/multiple`, { subtasks });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
    onError: (error) => {
      console.error('Failed to create subtasks:', error);
    },
  });

  const updateSubtaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSubtaskDto }) => {
      const res = await API.patch(`/subtasks/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
    onError: (error) => {
      console.error('Failed to update subtask:', error);
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await API.delete(`/subtasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
    onError: (error) => {
      console.error('Failed to delete subtask:', error);
    },
  });

  return {
    // Mutations
    createSubtask: createSubtaskMutation.mutateAsync,
    createMultipleSubtasks: createMultipleSubtasksMutation.mutateAsync,
    updateSubtask: updateSubtaskMutation.mutateAsync,
    deleteSubtask: deleteSubtaskMutation.mutateAsync,
    
    // Loading states
    isCreatingSubtask: createSubtaskMutation.isPending,
    isCreatingMultipleSubtasks: createMultipleSubtasksMutation.isPending,
    isUpdatingSubtask: updateSubtaskMutation.isPending,
    isDeletingSubtask: deleteSubtaskMutation.isPending,
  };
};