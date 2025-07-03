// frontend/src/components/ProjectGuardWrapper.tsx
'use client';

import { useEffect, useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { CreateProjectModal } from '@/components/project/CreateProjectModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderPlus, Loader2, AlertCircle, Plus } from 'lucide-react';

interface ProjectGuardWrapperProps {
  children: React.ReactNode;
  requireProject?: boolean;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export function ProjectGuardWrapper({ 
  children, 
  requireProject = true,
  fallbackTitle = "Create Your First Project",
  fallbackDescription = "You need to create at least one project before you can access this feature."
}: ProjectGuardWrapperProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { projects, isLoading, error } = useProjects();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <div>
            <h2 className="text-xl font-semibold mb-2">Failed to Load Projects</h2>
            <p className="text-muted-foreground mb-4">
              There was an error loading your projects.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show create project prompt if no projects exist and requirement is enabled
  if (requireProject && projects.length === 0) {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderPlus className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{fallbackTitle}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                {fallbackDescription}
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full"
                  size="lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
                <p className="text-xs text-muted-foreground">
                  Projects help you organize tasks, manage deadlines, and collaborate with your team.
                </p>
              </div>
            </CardContent>
          </Card>

          <CreateProjectModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => {
              // The projects will automatically refresh via the hook
              setIsCreateModalOpen(false);
            }}
          />
        </div>
      </div>
    );
  }

  // Render children if projects exist or requirement is disabled
  return <>{children}</>;
}