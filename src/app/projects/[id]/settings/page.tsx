// frontend/src/app/projects/[id]/settings/page.tsx - Project Settings Page
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Settings,
  Save,
  Trash2,
  AlertTriangle,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const { user } = useAuth();
  const { projects, isLoading: projectsLoading, getUserRole, updateProject, deleteProject, isUpdating, isDeleting } = useProjects();
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  // Find current project
  const currentProject = projects.find(p => p.id === projectId);
  const userRole = currentProject ? getUserRole(currentProject, user?.userId || '') : null;
  const isOwner = userRole === 'OWNER';
  const canEdit = userRole === 'OWNER' || userRole === 'ADMIN';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (currentProject) {
      setFormData({
        name: currentProject.name,
        description: currentProject.description || ''
      });
    }
  }, [currentProject]);

  useEffect(() => {
    if (currentProject) {
      const hasFormChanges = 
        formData.name !== currentProject.name ||
        formData.description !== (currentProject.description || '');
      setHasChanges(hasFormChanges);
    }
  }, [formData, currentProject]);

  if (!mounted) {
    return null;
  }

  if (projectsLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">Project not found</h2>
            <p className="text-muted-foreground">The project you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => router.push('/projects')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to edit this project's settings.</p>
            <Button onClick={() => router.push(`/projects/${projectId}`)} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Project
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        await updateProject({
          projectId,
          data: {
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
          },
        });
        setHasChanges(false);
      } catch (error) {
        console.error('Failed to update project:', error);
        setErrors({ submit: 'Failed to update project. Please try again.' });
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(projectId);
      router.push('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
      setShowDeleteDialog(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push(`/projects/${projectId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Project
            </Button>
            
            {hasChanges && (
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            )}
          </div>
        </Header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Project Settings</h1>
                <p className="text-muted-foreground">{currentProject.name}</p>
              </div>
            </div>

            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name *</Label>
                  <Input
                    id="project-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-destructive' : ''}
                    disabled={isUpdating}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="resize-none"
                    disabled={isUpdating}
                    placeholder="Describe your project's goals and objectives..."
                  />
                </div>

                {errors.submit && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{errors.submit}</p>
                  </div>
                )}

                {hasChanges && (
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button onClick={handleSave} disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFormData({
                          name: currentProject.name,
                          description: currentProject.description || ''
                        });
                        setErrors({});
                      }}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Project Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{currentProject.tasks.total}</div>
                    <div className="text-sm text-muted-foreground">Total Tasks</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{currentProject.members.length}</div>
                    <div className="text-sm text-muted-foreground">Team Members</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            {isOwner && (
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-destructive mb-1">Delete Project</h3>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete this project and all its data. This action cannot be undone.
                        </p>
                      </div>
                      <Button 
                        variant="destructive" 
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Delete Project
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{currentProject.name}</strong>? 
                This action cannot be undone and will permanently delete:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>All tasks and subtasks</li>
                  <li>All meetings and calendar events</li>
                  <li>All project data and files</li>
                  <li>All team member access</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Project
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}