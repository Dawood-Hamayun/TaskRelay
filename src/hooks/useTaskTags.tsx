// 3. frontend/src/hooks/useTaskTags.tsx
'use client';

import { useTasks } from './useTasks';

export function useTaskTags() {
  const { updateTask, isUpdating } = useTasks();

  const updateTaskTags = async (taskId: string, tagIds: string[]) => {
    return updateTask({
      id: taskId,
      data: { tags: tagIds }
    });
  };

  return {
    updateTaskTags,
    isUpdating,
  };
}