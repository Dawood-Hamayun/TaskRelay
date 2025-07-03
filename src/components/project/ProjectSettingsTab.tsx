// frontend/src/components/project/ProjectSettingsTab.tsx
'use client';

import React from 'react';
import { 
  Settings,
  Save,
  Trash2,
  Loader2,
  AlertTriangle,
  Users,
  Target,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectSettingsTabProps {
  userRole: string | null;
  formData: {
    name: string;
    description: string;
  };
  hasChanges: boolean;
  errors: Record<string, string>;
  isUpdating: boolean;
  isDeleting: boolean;
  taskStats: {
    total: number;
    completed: number;
  };
  currentProject: {
    name: string;
    description?: string;
    members: { length: number };
  };
  handleInputChange: (field: string, value: string) => void;
  handleSave: () => void;
  setShowDeleteDialog: (show: boolean) => void;
  setFormData: (data: any) => void;
  setErrors: (errors: any) => void;
}

export function ProjectSettingsTab({
  userRole,
  formData,
  hasChanges,
  errors,
  isUpdating,
  isDeleting,
  taskStats,
  currentProject,
  handleInputChange,
  handleSave,
  setShowDeleteDialog,
  setFormData,
  setErrors
}: ProjectSettingsTabProps) {
  const isOwner = userRole === 'OWNER';
  const canEdit = userRole === 'OWNER' || userRole === 'ADMIN';
  const completionRate = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;

  if (!canEdit) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Access Denied</h3>
          <p className="text-muted-foreground">You don't have permission to edit this project's settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Project Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{taskStats.total}</p>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{currentProject.members.length}</p>
              <p className="text-sm text-muted-foreground">Team Members</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* General Settings - Takes up 2/3 width */}
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="project-name" className="text-sm font-medium text-foreground">
                  Project Name *
                </Label>
                <Input
                  id="project-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`h-11 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={isUpdating}
                  placeholder="Enter project name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-description" className="text-sm font-medium text-foreground">
                  Description
                </Label>
                <Textarea
                  id="project-description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="resize-none"
                  disabled={isUpdating}
                  placeholder="Describe your project's goals, objectives, and key details..."
                />
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                  </div>
                </div>
              )}

              {hasChanges && (
                <div className="flex items-center gap-3 pt-6 border-t border-border">
                  <Button 
                    onClick={handleSave} 
                    disabled={isUpdating}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
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
        </div>

        {/* Right Sidebar - Takes up 1/3 width */}
        <div className="space-y-6">
          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm font-medium text-foreground">
                    {taskStats.total === 0 ? 'Not Started' : 
                     completionRate === 100 ? 'Completed' : 
                     'In Progress'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Your Role</span>
                  <span className="text-sm font-medium text-foreground capitalize">
                    {userRole?.toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-border rounded-full h-1.5">
                      <div 
                        className="h-1.5 bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">{completionRate}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {isOwner && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-red-600 dark:text-red-400 mb-1">Delete Project</h3>
                      <p className="text-sm text-red-600/80 dark:text-red-400/80">
                        Permanently delete this project and all its data. This action cannot be undone.
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={isDeleting}
                      className="w-full"
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
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}