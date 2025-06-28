// frontend/src/hooks/useTasks.ts - Updated with better tag support
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
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
    onSuccess: (updatedTask) => {
      // Update the specific task in cache
      queryClient.setQueryData(['tasks', projectId], (oldTasks: Task[] = []) => {
        return oldTasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        );
      });
      
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
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

// frontend/src/lib/api.ts - Updated API client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class APIClient {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GET ${endpoint} failed:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      data: await response.json(),
      status: response.status,
    };
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`POST ${endpoint} failed:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      data: await response.json(),
      status: response.status,
    };
  }

  async patch(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`PATCH ${endpoint} failed:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      data: await response.json(),
      status: response.status,
    };
  }

  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DELETE ${endpoint} failed:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      data: response.status === 204 ? null : await response.json(),
      status: response.status,
    };
  }
}

const API = new APIClient();
export default API;