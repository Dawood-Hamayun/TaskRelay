// frontend/src/components/CreateTaskModal.tsx - Complete working version
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  X, Plus, Calendar as CalendarIcon, User, FolderOpen, 
  ChevronDown, ChevronRight, Loader2, CheckSquare, Square,
  GripVertical, Trash2
} from 'lucide-react';
import { CreateTaskDto, TaskPriority, TaskStatus } from '@/types/task';
import { TagSelector } from './TagSelector';
import { useProjects } from '@/hooks/useProjects';
import { format } from 'date-fns';

const PRIORITY_OPTIONS = [
  { value: 'LOW' as TaskPriority, label: 'Low', icon: '🟢', color: 'text-green-600' },
  { value: 'MEDIUM' as TaskPriority, label: 'Medium', icon: '🟡', color: 'text-yellow-600' },
  { value: 'HIGH' as TaskPriority, label: 'High', icon: '🟠', color: 'text-orange-600' },
  { value: 'CRITICAL' as TaskPriority, label: 'Critical', icon: '🔴', color: 'text-red-600' }
];

const STATUS_OPTIONS = [
  { value: 'TODO' as TaskStatus, label: 'To Do' },
  { value: 'IN_PROGRESS' as TaskStatus, label: 'In Progress' },
  { value: 'IN_REVIEW' as TaskStatus, label: 'In Review' },
  { value: 'DONE' as TaskStatus, label: 'Done' },
  { value: 'BACKLOG' as TaskStatus, label: 'Backlog' }
];

interface SubtaskInput {
  id: string;
  title: string;
  assigneeId?: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: CreateTaskDto & { 
    projectId: string; 
    subtasks?: Array<{ title: string; assigneeId?: string }>; 
    tags?: string[];
  }) => Promise<void>;
  projectId: string;
  projects: Array<{ 
    id: string; 
    name: string; 
    members?: Array<{ 
      id: string; 
      user: { 
        id: string; 
        name?: string; 
        email: string; 
        avatar?: string; 
        color?: string 
      } 
    }> 
  }>;
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
    tags: [],
  });

  const [subtasks, setSubtasks] = useState<SubtaskInput[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState<Date | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get project members dynamically
  const { projects: allProjects } = useProjects();
  const currentProject = allProjects.find(p => p.id === formData.projectId) || projects.find(p => p.id === formData.projectId);
  const projectMembers = currentProject?.members || [];

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
        tags: [],
      });
      setSubtasks([]);
      setNewSubtask('');
      setErrors({});
      setShowAdvanced(false);
      setSelectedDueDate(undefined);
      setDueDateOpen(false);
      setSelectedTags([]);
    }
  }, [isOpen, projectId]);

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks(prev => [...prev, {
        id: Date.now().toString(),
        title: newSubtask.trim(),
        assigneeId: undefined
      }]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== id));
  };

  const updateSubtaskAssignee = (id: string, assigneeId: string | undefined) => {
    setSubtasks(prev => prev.map(st => 
      st.id === id ? { ...st, assigneeId: assigneeId === 'unassigned' ? undefined : assigneeId } : st
    ));
  };

  const handleTagsChange = (tagIds: string[]) => {
    console.log('Tags changed in modal:', tagIds);
    setSelectedTags(tagIds);
    setFormData(prev => ({ ...prev, tags: tagIds }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
          dueDate: selectedDueDate ? format(selectedDueDate, 'yyyy-MM-dd') : undefined,
          tags: selectedTags,
          subtasks: subtasks.map(st => ({
            title: st.title,
            assigneeId: st.assigneeId
          }))
        };

        console.log('Submitting task data:', taskData);
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
        tags: [],
      });
      setSubtasks([]);
      setNewSubtask('');
      setErrors({});
      setShowAdvanced(false);
      setSelectedDueDate(undefined);
      setDueDateOpen(false);
      setSelectedTags([]);
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleSubtaskKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubtask();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 bg-card border-border">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-xl font-semibold flex items-center gap-3 text-card-foreground">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col max-h-[calc(90vh-100px)]">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Input
                  placeholder="What needs to be done?"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`text-lg h-12 font-medium ${
                    errors.title ? 'border-destructive' : ''
                  }`}
                  onKeyDown={handleKeyPress}
                  autoFocus
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              {/* Project & Priority */}
              <div className="grid grid-cols-2 gap-4">
                {/* Project Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">
                    Project
                  </label>
                  <Select 
                    value={formData.projectId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value, assigneeId: undefined }))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
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
                    <p className="text-sm text-destructive">{errors.project}</p>
                  )}
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">
                    Priority
                  </label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as TaskPriority }))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <span className={priority.color}>{priority.icon}</span>
                            {priority.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Assignee & Due Date */}
              <div className="grid grid-cols-2 gap-4">
                {/* Assignee */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">
                    Assign to
                  </label>
                  <Select 
                    value={formData.assigneeId || 'unassigned'} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      assigneeId: value === 'unassigned' ? undefined : value 
                    }))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center">
                            <User className="w-3 h-3 text-muted-foreground" />
                          </div>
                          Unassigned
                        </div>
                      </SelectItem>
                      {projectMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full ${member.user.color || 'bg-zinc-600'} flex items-center justify-center text-white text-xs font-medium`}>
                              {member.user.avatar || member.user.name?.charAt(0) || member.user.email.charAt(0)}
                            </div>
                            {member.user.name || member.user.email}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-card-foreground">
                    Due Date
                  </Label>
                  <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between font-normal h-10"
                        disabled={isSubmitting}
                      >
                        <span className={selectedDueDate ? 'text-foreground' : 'text-muted-foreground'}>
                          {selectedDueDate ? format(selectedDueDate, 'MMM dd, yyyy') : "Select date"}
                        </span>
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDueDate}
                        onSelect={(date) => {
                          setSelectedDueDate(date);
                          setDueDateOpen(false);
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Subtasks Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-card-foreground">
                    Subtasks ({subtasks.length})
                  </label>
                  {subtasks.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Break this task into smaller pieces
                    </span>
                  )}
                </div>
                
                {/* Add Subtask Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a subtask..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={handleSubtaskKeyPress}
                    className="flex-1 h-9"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    onClick={addSubtask}
                    disabled={!newSubtask.trim() || isSubmitting}
                    size="sm"
                    className="h-9 px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Subtasks List */}
                {subtasks.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {subtasks.map((subtask, index) => (
                      <div key={subtask.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Square className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 text-sm">{subtask.title}</span>
                        
                        {/* Subtask Assignee */}
                        <Select
                          value={subtask.assigneeId || 'unassigned'}
                          onValueChange={(value) => updateSubtaskAssignee(subtask.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">None</span>
                              </div>
                            </SelectItem>
                            {projectMembers.map(member => (
                              <SelectItem key={member.id} value={member.id}>
                                <div className="flex items-center gap-1">
                                  <div className={`w-4 h-4 rounded-full ${member.user.color || 'bg-zinc-600'} flex items-center justify-center text-white text-xs`}>
                                    {member.user.avatar || member.user.name?.charAt(0) || member.user.email.charAt(0)}
                                  </div>
                                  <span className="text-xs truncate max-w-20">{member.user.name || member.user.email}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSubtask(subtask.id)}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Advanced Options Toggle */}
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

              {/* Advanced Options */}
              {showAdvanced && (
                <div className="space-y-4 border-t border-border pt-4">
                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground">
                      Status
                    </label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as TaskStatus }))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
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

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground">
                      Description
                    </label>
                    <Textarea
                      placeholder="Add more details about this task..."
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="resize-none"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground">
                      Tags
                    </label>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border">
                      <TagSelector
                        projectId={formData.projectId}
                        selectedTags={selectedTags}
                        onTagsChange={handleTagsChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{errors.submit}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              Press 
              <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">⌘</kbd> 
              + 
              <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Enter</kbd> 
              to create
            </div>
            <div className="flex items-center gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose} 
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!formData.title.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Task
                    {subtasks.length > 0 && (
                      <span className="ml-1 text-xs opacity-75">
                        +{subtasks.length} subtask{subtasks.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}