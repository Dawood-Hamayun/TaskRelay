// frontend/src/hooks/useProjectSelection.tsx
'use client';

import { useState, useEffect } from 'react';
import { Project } from './useProjects';

const PROJECT_SELECTION_KEY = 'selectedProjectId';

export function useProjectSelection(projects: Project[]) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Initialize selected project from localStorage or default
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      // Try to get the last selected project from localStorage
      const savedProjectId = localStorage.getItem(PROJECT_SELECTION_KEY);
      
      // Check if saved project still exists in current projects
      const projectExists = savedProjectId && projects.some(p => p.id === savedProjectId);
      
      if (projectExists) {
        console.log('🔄 Restoring saved project selection:', savedProjectId);
        setSelectedProjectId(savedProjectId);
      } else {
        console.log('🆕 Setting default project (first available):', projects[0].id);
        const defaultProjectId = projects[0].id;
        setSelectedProjectId(defaultProjectId);
        localStorage.setItem(PROJECT_SELECTION_KEY, defaultProjectId);
      }
    }
  }, [projects, selectedProjectId]);

  // Save selected project to localStorage whenever it changes
  const handleProjectChange = (projectId: string) => {
    console.log('🔄 Project changed to:', projectId);
    setSelectedProjectId(projectId);
    localStorage.setItem(PROJECT_SELECTION_KEY, projectId);
  };

  // Get current project object
  const currentProject = projects.find(p => p.id === selectedProjectId) || null;

  // Clear selection (useful for logout or project deletion)
  const clearSelection = () => {
    setSelectedProjectId('');
    localStorage.removeItem(PROJECT_SELECTION_KEY);
  };

  return {
    selectedProjectId,
    currentProject,
    handleProjectChange,
    clearSelection,
  };
}