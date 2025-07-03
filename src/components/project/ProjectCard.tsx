// frontend/src/components/projects/ProjectCard.tsx - Fixed avatar handling
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MoreHorizontal,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
  Archive,
  Users,
  Activity,
  Edit3,
  Trash2,
  ExternalLink,
  Settings,
  UserPlus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProjects, Project } from '@/hooks/useProjects';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface ProjectCardProps {
  project: Project;
}

// Helper function to generate avatar initials
const getAvatarInitials = (name?: string, email?: string): string => {
  if (name && name.trim()) {
    return name
      .trim()
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  
  if (email && email.trim()) {
    return email.charAt(0).toUpperCase();
  }
  
  return 'U';
};

// Helper function to generate consistent avatar colors
const getAvatarColor = (userId: string): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-gray-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-lime-500',
  ];
  
  // Generate a consistent hash from the userId
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use absolute value to ensure positive index
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { getUserRole, canManageProject, getProjectProgress, deleteProject } = useProjects();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const progress = getProjectProgress(project);
  const userRole = getUserRole(project, user?.userId || '');
  const isOwner = userRole === 'OWNER';
  const canManage = canManageProject(project, user?.userId || '');

  const handleProjectClick = () => {
    router.push(`/projects/${project.id}`);
  };

  const handleTasksClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/tasks?project=${project.id}`);
  };

  const handleMembersClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/projects/${project.id}/members`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/projects/${project.id}/settings`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteProject(project.id);
      setShowDeleteDialog(false);
      // The projects list will automatically update via the hook
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-amber-500';
    return 'bg-zinc-400 dark:bg-zinc-600';
  };

  const getStatusBadge = () => {
    switch (project.status) {
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
            <Archive className="w-3 h-3 mr-1" />
            Archived
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
            <Activity className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
    }
  };

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-200 cursor-pointer border shadow-sm bg-card hover:bg-accent/5"
      onClick={handleProjectClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
                {project.name}
              </h3>
              {isOwner && <Star className="w-4 h-4 text-amber-500 shrink-0" />}
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              {getStatusBadge()}
              {project.tasks.overdue > 0 && (
                <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {project.tasks.overdue} overdue
                </Badge>
              )}
            </div>

            {project.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-5">
                {project.description}
              </p>
            )}
          </div>
          
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleTasksClick}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  View Tasks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMembersClick}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Manage Members
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEditClick}>
                  <Settings className="h-4 w-4 mr-2" />
                  Project Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isOwner ? (
                  <DropdownMenuItem 
                    onClick={handleDeleteClick}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem 
                    onClick={handleDeleteClick}
                    className="text-red-600 focus:text-red-600"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Leave Project
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Progress</span>
            <span className="font-semibold text-card-foreground">{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-card-foreground">{project.tasks.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{project.tasks.completed}</div>
            <div className="text-xs text-muted-foreground">Done</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{project.tasks.inProgress}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          {/* Team Members */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {project.members.slice(0, 3).map((member, index) => {
                const memberName = member.user.name || member.user.email;
                const avatarInitials = getAvatarInitials(member.user.name, member.user.email);
                const avatarColor = getAvatarColor(member.user.id);
                
                console.log('🎭 ProjectCard member avatar:', {
                  memberId: member.user.id,
                  email: member.user.email,
                  hasAvatar: !!member.user.avatar,
                  avatarValue: member.user.avatar,
                  avatarType: typeof member.user.avatar,
                  avatarLength: member.user.avatar?.length || 0
                });
                
                return (
                  <div
                    key={member.id}
                    className="relative border-2 border-background shadow-sm rounded-full"
                    title={`${memberName} (${member.role})`}
                    style={{ zIndex: 10 - index }}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage 
                        src={member.user.avatar} 
                        alt={memberName}
                        onError={() => console.log('❌ Avatar failed to load for:', member.user.email)}
                        onLoad={() => console.log('✅ Avatar loaded for:', member.user.email)}
                      />
                      <AvatarFallback className={`text-xs font-semibold text-white ${avatarColor}`}>
                        {avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    {member.role === 'OWNER' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center">
                        <Star className="w-2 h-2 text-white" fill="currentColor" />
                      </div>
                    )}
                  </div>
                );
              })}
              {project.members.length > 3 && (
                <div 
                  className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-semibold border-2 border-background shadow-sm"
                  style={{ zIndex: 6 }}
                >
                  +{project.members.length - 3}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
              <Users className="w-3 h-3" />
              <span>{project.members.length}</span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {project.meetings && project.meetings.length > 0 && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{project.meetings.length}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(project.lastActivity)}</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {isOwner ? 'Delete Project' : 'Leave Project'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isOwner ? (
                <>
                  Are you sure you want to delete <strong>{project.name}</strong>? 
                  This action cannot be undone and will permanently delete all tasks, 
                  meetings, and project data.
                </>
              ) : (
                <>
                  Are you sure you want to leave <strong>{project.name}</strong>? 
                  You will lose access to all project data and tasks.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  {isOwner ? 'Deleting...' : 'Leaving...'}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isOwner ? 'Delete Project' : 'Leave Project'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}