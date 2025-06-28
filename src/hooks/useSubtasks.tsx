// frontend/src/hooks/useSubtasks.tsx
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateSubtaskDto, UpdateSubtaskDto } from '@/types/task';

interface CreateSubtaskParams {
  taskId: string;
  data: CreateSubtaskDto;
}

interface UpdateSubtaskParams {
  id: string;
  data: UpdateSubtaskDto;
}

export function useSubtasks(projectId?: string) {
  const queryClient = useQueryClient();

  const createSubtaskMutation = useMutation({
    mutationFn: async ({ taskId, data }: CreateSubtaskParams) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subtasks/${taskId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Subtask creation error:', errorData);
        throw new Error(`Failed to create subtask: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate both tasks and specific project tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      }
    },
    onError: (error) => {
      console.error('Create subtask mutation error:', error);
    },
  });

  const updateSubtaskMutation = useMutation({
    mutationFn: async ({ id, data }: UpdateSubtaskParams) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subtasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Subtask update error:', errorData);
        throw new Error(`Failed to update subtask: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      }
    },
    onError: (error) => {
      console.error('Update subtask mutation error:', error);
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: async (subtaskId: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subtasks/${subtaskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Subtask deletion error:', errorData);
        throw new Error(`Failed to delete subtask: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      }
    },
    onError: (error) => {
      console.error('Delete subtask mutation error:', error);
    },
  });

  return {
    createSubtask: createSubtaskMutation.mutateAsync,
    updateSubtask: updateSubtaskMutation.mutateAsync,
    deleteSubtask: deleteSubtaskMutation.mutateAsync,
    isCreatingSubtask: createSubtaskMutation.isPending,
    isUpdatingSubtask: updateSubtaskMutation.isPending,
    isDeletingSubtask: deleteSubtaskMutation.isPending,
  };
}
