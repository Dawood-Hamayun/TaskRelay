// components/CreateTaskModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  X, Plus, Calendar, User, Flag, FolderOpen, 
  ChevronDown, ChevronRight, Loader2
} from 'lucide-react';
import { CreateTaskDto, TaskPriority, TaskStatus } from '@/types/task';

const PRIORITY_OPTIONS = [
  { value: 'LOW' as TaskPriority, label: 'Low', icon: '🟢' },
  { value: 'MEDIUM' as TaskPriority, label: 'Medium', icon: '🟡' },
  { value: 'HIGH' as TaskPriority, label: 'High', icon: '🟠' },
  { value: 'CRITICAL' as TaskPriority, label: 'Critical', icon: '🔴' }
];

const STATUS_OPTIONS = [
  { value: 'TODO' as TaskStatus, label: 'To Do' },
  { value: 'IN_PROGRESS' as TaskStatus, label: 'In Progress' },
  { value: 'IN_REVIEW' as TaskStatus, label: 'In Review' },
  { value: 'DONE' as TaskStatus, label: 'Done' },
  { value: 'BACKLOG' as TaskStatus, label: 'Backlog' }
];

// Hardcoded members for now - you can make this dynamic later
const HARDCODED_MEMBERS = [
  { id: 'member-1', user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' } },
  { id: 'member-2', user: { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' } },
  { id: 'member-3', user: { id: 'user-3', name: 'Mike Wilson', email: 'mike@example.com' } },
  { id: 'member-4', user: { id: 'user-4', name: 'Sarah Davis', email: 'sarah@example.com' } },
];

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: CreateTaskDto & { projectId: string }) => Promise<void>;
  projectId: string;
  projects: Array<{ id: string; name: string }>; // Add projects prop
}

export function CreateTaskModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  projectId,
  projects
}: CreateTaskModalProps) {
  const [formData, setFormData] = useState<CreateTaskDto & { projectId: string }>({
    projectId,
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    assigneeId: undefined,
    dueDate: undefined,
    parentTaskId: undefined,
    tags: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        projectId: projectId,
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'TODO',
        assigneeId: undefined,
        dueDate: undefined,
        parentTaskId: undefined,
        tags: [],
      });
      setErrors({});
      setShowAdvanced(false);
    }
  }, [isOpen, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 CreateTaskModal - Form submitted with data:', {
      formData,
      projectId,
      parentTask: parentTask?.title
    });
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.projectId) newErrors.project = 'Project is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        setIsSubmitting(true);
        
        const taskData = {
          projectId: formData.projectId,
          title: formData.title.trim(),
          description: formData.description?.trim() || '',
          priority: formData.priority,
          status: formData.status,
          assigneeId: formData.assigneeId === 'unassigned' ? undefined : formData.assigneeId,
          dueDate: formData.dueDate || undefined,
          parentTaskId: formData.parentTaskId,
          tags: formData.tags || [],
        };

        console.log('📤 Sending task data:', taskData);
        await onSubmit(taskData);
        handleClose();
      } catch (error) {
        console.error('❌ Error creating task:', error);
        setErrors({ submit: 'Failed to create task. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        projectId,
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'TODO',
        assigneeId: undefined,
        dueDate: undefined,
        parentTaskId: undefined,
        tags: [],
      });
      setErrors({});
      setShowAdvanced(false);
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 bg-card border-border">
        <DialogHeader className="px-8 py-6 border-b border-border bg-card">
          <DialogTitle className="text-2xl font-semibold flex items-center gap-3 text-card-foreground">
            <Plus className="w-6 h-6" />
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-100px)]">
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="space-y-8">
              {/* Title */}
              <div className="space-y-3">
                <Input
                  placeholder="What needs to be done?"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`text-lg h-14 text-card-foreground placeholder:text-muted-foreground ${
                    errors.title ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-ring'
                  }`}
                  onKeyPress={handleKeyPress}
                  autoFocus
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-600 rounded-full" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Essential Details */}
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Details
                </h3>
                
                {/* Project Selection */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                    <FolderOpen className="w-4 h-4" />
                    Project
                  </label>
                  <Select 
                    value={formData.projectId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.project && (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <span className="w-1 h-1 bg-red-600 rounded-full" />
                      {errors.project}
                    </p>
                  )}
                </div>
                
                {/* Priority & Status Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                      <Flag className="w-4 h-4" />
                      Priority
                    </label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as TaskPriority }))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map(priority => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center gap-2">
                              <span>{priority.icon}</span>
                              {priority.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                    Status
                  </label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as TaskStatus }))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                </div>

                {/* Assignee & Due Date Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                      <User className="w-4 h-4" />
                      Assignee
                    </label>
                    <Select 
                      value={formData.assigneeId || 'unassigned'} 
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        assigneeId: value === 'unassigned' ? undefined : value 
                      }))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Assign to someone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full border-2 border-dashed border-muted flex items-center justify-center">
                              <User className="w-3 h-3 text-muted-foreground" />
                            </div>
                            Unassigned
                          </div>
                        </SelectItem>
                        {HARDCODED_MEMBERS.map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-zinc-600 flex items-center justify-center text-white text-xs font-medium">
                                {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                              </div>
                              {member.user.name || member.user.email}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </label>
                    <Input
                      type="date"
                      value={formData.dueDate || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value || undefined }))}
                      className="h-11"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div className="border-t border-border pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 h-10 px-0 text-sm text-muted-foreground hover:text-card-foreground"
                  disabled={isSubmitting}
                >
                  {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  {showAdvanced ? 'Hide' : 'Show'} advanced options
                </Button>
              </div>

              {/* Advanced Options */}
              {showAdvanced && (
                <div className="space-y-6 pb-4">
                  {/* Description */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-card-foreground">
                      Description
                    </label>
                    <Textarea
                      placeholder="Add more details about this task..."
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="resize-none"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-600 rounded-full" />
                    {errors.submit}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-8 py-6 border-t border-border bg-muted/50">
            <div className="text-sm text-muted-foreground">
              Press <kbd className="px-2 py-1 bg-muted rounded text-xs font-medium">⌘ + Enter</kbd> to create
            </div>
            <div className="flex items-center gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose} 
                size="lg"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!formData.title.trim() || isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}