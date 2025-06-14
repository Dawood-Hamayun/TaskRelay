// frontend/src/hooks/useTags.tsx (Hardcoded for now)
'use client';

import { useState, useEffect } from 'react';
import { Tag } from '@/types/task';

// Mock data for development
const MOCK_TAGS: Record<string, Tag[]> = {
  'project-1': [
    {
      id: 'tag-1',
      name: 'Frontend',
      color: 'blue',
    },
    {
      id: 'tag-2',
      name: 'Backend',
      color: 'emerald',
    },
    {
      id: 'tag-3',
      name: 'Bug',
      color: 'red',
    },
    {
      id: 'tag-4',
      name: 'Feature',
      color: 'purple',
    },
    {
      id: 'tag-5',
      name: 'Design',
      color: 'amber',
    },
    {
      id: 'tag-6',
      name: 'Urgent',
      color: 'orange',
    },
  ],
  'project-2': [
    {
      id: 'tag-7',
      name: 'API',
      color: 'blue',
    },
    {
      id: 'tag-8',
      name: 'Database',
      color: 'emerald',
    },
    {
      id: 'tag-9',
      name: 'Testing',
      color: 'purple',
    },
  ],
};

export function useTags(projectId?: string) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTags = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const projectTags = projectId ? MOCK_TAGS[projectId] || [] : [];
      setTags(projectTags);
      setIsLoading(false);
    };

    if (projectId) {
      loadTags();
    } else {
      setTags([]);
      setIsLoading(false);
    }
  }, [projectId]);

  const createTag = async (data: { name: string; color: string }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: data.name,
      color: data.color,
    };

    setTags(prev => [...prev, newTag]);
    return newTag;
  };

  return {
    tags,
    createTag,
    isLoading,
    error: null,
  };
}