// frontend/src/components/TaskDetailPanel.tsx - Enhanced with dynamic members
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  X, Calendar, User, Tag, MessageSquare, Paperclip, Clock, 
  Edit3, Save, AlertCircle, ArrowUp, ArrowDown, Minus, Plus, 
  CheckCircle2, Circle, Send, Trash2, Loader2
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import { useSubtasks } from '@/hooks/useSubtasks';
import { useComments } from '@/hooks/useComments';
import { useTaskTags } from '@/hooks/useTaskTags';
import { useMembers, Member } from '@/hooks/useMembers';
import { TagSelector } from '@/components/TagSelector';
import { useTheme } from 'next-themes';

const PRIORITY_CONFIG: Record<TaskPriority, { icon: React.ComponentType<any>; label: string; color: string; dot: string }> = {
  LOW: { icon: ArrowDown, label: 'Low', color: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400 dark:bg-slate-500' },
  MEDIUM: { icon: Minus, label: 'Medium', color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500 dark:bg-amber-600' },
  HIGH: { icon: ArrowUp, label: 'High', color: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500 dark:bg-orange-600' },
  CRITICAL: { icon: AlertCircle, label: 'Critical', color: 'text-red-600 dark:text-red-400', dot: 'bg-red-500 dark:bg-red-600' }
};

const STATUS_OPTIONS = [
  { value: 'TODO' as TaskStatus, label: 'To Do', color: 'text-slate-600 dark:text-slate-400' },
  { value: 'IN_PROGRESS' as TaskStatus, label: 'In Progress', color: 'text-blue-600 dark:text-blue-400' },
  { value: 'IN_REVIEW' as TaskStatus, label: 'In Review', color: 'text-amber-600 dark:text-amber-400' },
  { value: 'DONE' as TaskStatus, label: 'Done', color: 'text-emerald-600 dark:text-emerald-400' },
  { value: 'BACKLOG' as TaskStatus, label: 'Backlog', color: 'text-gray-600 dark:text-gray-400' }
];

const TAG_COLORS: Record<string, { light: string; dark: string }> = {
  blue: { light: 'bg-blue-600 text-white border-blue-600', dark: 'bg-blue-500 text-white border-blue-500' },
  purple: { light: 'bg-purple-600 text-white border-purple-600', dark: 'bg-purple-500 text-white border-purple-500' },
  emerald: { light: 'bg-emerald-600 text-white border-emerald-600', dark: 'bg-emerald-500 text-white border-emerald-500' },
  red: { light: 'bg-red-600 text-white border-red-600', dark: 'bg-red-500 text-white border-red-500' },
  amber: { light: 'bg-amber-600 text-white border-amber-600', dark: 'bg-amber-500 text-white border-amber-500' },
  orange: { light: 'bg-orange-600 text-white border-orange-600', dark: 'bg-orange-500 text-white border-orange-500' },
};

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name?: string;
    email: string;
  };
}

interface TaskDetailPanelProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

export function TaskDetailPanel({ 
  task, 
  isOpen, 
  onClose, 
  onUpdate
}: TaskDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Task>>({});
  const [newComment, setNewComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [selectedSubtaskAssignee, setSelectedSubtaskAssignee] = useState<string>('unassigned');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const { theme } = useTheme();

  // Get dynamic members for the project
  const { members, isLoading: isLoadingMembers } = useMembers(task?.projectId);

  const { 
    comments, 
    createComment, 
    deleteComment,
    isCreating: isCreatingComment,
    isDeleting: isDeletingComment
  } = useComments(task?.id);

  const { 
    createSubtask,
    updateSubtask,
    deleteSubtask,
    isCreatingSubtask,
    isUpdatingSubtask,
    isDeletingSubtask
  } = useSubtasks(task?.projectId);

  const { updateTaskTags, isUpdating: isUpdatingTags } = useTaskTags();

  useEffect(() => {
    if (task) {
      setEditData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? formatDateForInput(task.dueDate) : '',
        assigneeId: task.assigneeId,
      });
      setSelectedTags(task.tags?.map(t => t.tag.id) || []);
    }
  }, [task]);

  if (!task) return null;

  console.log('🎯 TaskDetailPanel render:', {
    taskId: task.id,
    projectId: task.projectId,
    membersCount: members.length,
    members: members.map(m => ({ id: m.id, name: m.user.name, email: m.user.email })),
    currentAssignee: task.assignee,
    isLoadingMembers
  });

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      await onUpdate(task.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? formatDateForInput(task.dueDate) : '',
      assigneeId: task.assigneeId,
    });
    setSelectedTags(task.tags?.map(t => t.tag.id) || []);
    setIsEditing(false);
    setIsEditingTags(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !task) return;
    
    try {
      await createComment({
        taskId: task.id,
        data: { content: newComment.trim() }
      });
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim() || !task) return;
    
    try {
      await createSubtask({
        taskId: task.id,
        data: {
          title: newSubtaskTitle.trim(),
          assigneeId: selectedSubtaskAssignee !== 'unassigned' ? selectedSubtaskAssignee : undefined,
        }
      });
      setNewSubtaskTitle('');
      setSelectedSubtaskAssignee('unassigned');
    } catch (error) {
      console.error('Failed to create subtask:', error);
    }
  };

  const toggleSubtaskComplete = async (subtaskId: string, currentCompleted: boolean) => {
    try {
      await updateSubtask({
        id: subtaskId,
        data: { completed: !currentCompleted }
      });
    } catch (error) {
      console.error('Failed to update subtask:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await deleteSubtask(subtaskId);
    } catch (error) {
      console.error('Failed to delete subtask:', error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getTagClass = (color: string) => {
    const colorConfig = TAG_COLORS[color];
    if (!colorConfig) return TAG_COLORS.blue.light;
    return theme === 'dark' ? colorConfig.dark : colorConfig.light;
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const priorityInfo = PRIORITY_CONFIG[task.priority];
  const PriorityIcon = priorityInfo.icon;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        className={`fixed right-0 top-0 h-full w-[600px] bg-card shadow-2xl z-50 transform transition-transform duration-300 ease-out border-l border-border ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${priorityInfo.dot}`} />
              <span className="text-sm font-medium text-muted-foreground">
                {task.project.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="h-8"
                >
                  <Edit3 className="h-3 w-3 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCancel}
                    className="h-8"
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    className="h-8 bg-blue-600 hover:bg-blue-700"
                    disabled={isUpdating}
                  >
                    <Save className="h-3 w-3 mr-2" />
                    {isUpdating ? 'Saving...' : 'Save'}
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                {isEditing ? (
                  <Input
                    value={editData.title || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    className="text-xl font-semibold border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-b-2 focus-visible:border-blue-500 focus-visible:rounded-none bg-transparent"
                    placeholder="Task title..."
                  />
                ) : (
                  <h1 className="text-xl font-semibold text-card-foreground leading-tight">
                    {task.title}
                  </h1>
                )}
              </div>

              {/* Status and Priority */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Status:</span>
                  {isEditing ? (
                    <Select
                      value={editData.status || task.status}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, status: value as TaskStatus }))}
                    >
                      <SelectTrigger className="h-8 w-32">
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
                  ) : (
                    <span className={`text-sm font-medium ${STATUS_OPTIONS.find(s => s.value === task.status)?.color}`}>
                      {STATUS_OPTIONS.find(s => s.value === task.status)?.label}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Priority:</span>
                  {isEditing ? (
                    <Select
                      value={editData.priority || task.priority}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, priority: value as TaskPriority }))}
                    >
                      <SelectTrigger className="h-8 w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className={`flex items-center gap-1 ${priorityInfo.color}`}>
                      <PriorityIcon className="h-3 w-3" />
                      <span className="text-sm font-medium">{priorityInfo.label}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-card-foreground">
                  Description
                </label>
                {isEditing ? (
                  <Textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add a description..."
                    rows={4}
                    className="resize-none"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">
                    {task.description || 'No description provided.'}
                  </p>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Assignee - Dynamic */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">
                    Assignee
                  </label>
                  {isEditing ? (
                    <Select
                      value={editData.assigneeId || 'unassigned'}
                      onValueChange={(value) => setEditData(prev => ({ 
                        ...prev, 
                        assigneeId: value === 'unassigned' ? undefined : value 
                      }))}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>Unassigned</span>
                          </div>
                        </SelectItem>
                        {members.map(member => (
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
                  ) : task.assignee ? (
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-zinc-600 flex items-center justify-center text-white text-xs font-semibold">
                        {task.assignee.user.name?.charAt(0) || task.assignee.user.email.charAt(0)}
                      </div>
                      <span className="text-sm text-card-foreground">
                        {task.assignee.user.name || task.assignee.user.email}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground p-2 bg-muted/50 rounded-lg">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Unassigned</span>
                    </div>
                  )}
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">
                    Due Date
                  </label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editData.dueDate || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="h-10"
                    />
                  ) : task.dueDate ? (
                    <div className={`flex items-center gap-2 p-2 bg-muted/50 rounded-lg ${
                      isOverdue ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                    }`}>
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">
                        {formatDate(task.dueDate)}
                        {isOverdue && ' (Overdue)'}
                      </span>
                    </div>
                  ) : (
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">No due date</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-card-foreground">
                    Tags ({task.tags?.length || 0})
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingTags(!isEditingTags)}
                    className="h-6 text-xs"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    {isEditingTags ? 'Cancel' : 'Edit'}
                  </Button>
                </div>

                {isEditingTags ? (
                  <div className="space-y-3">
                    <TagSelector
                      projectId={task.projectId}
                      selectedTags={selectedTags}
                      onTagsChange={setSelectedTags}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          await updateTaskTags(task.id, selectedTags);
                          setIsEditingTags(false);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={isUpdatingTags}
                      >
                        {isUpdatingTags ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Tags'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTags(task.tags?.map(t => t.tag.id) || []);
                          setIsEditingTags(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {task.tags && task.tags.length > 0 ? (
                      task.tags.map(({ tag }) => (
                        <span
                          key={tag.id}
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${getTagClass(tag.color)}`}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No tags assigned</p>
                    )}
                  </div>
                )}
              </div>

              {/* Subtasks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-card-foreground">
                    Subtasks ({task.subtasks?.length || 0})
                  </label>
                </div>
                
                {/* Add New Subtask */}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add subtask..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 h-9"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSubtask();
                      }
                    }}
                  />
                  <Select 
                    value={selectedSubtaskAssignee} 
                    onValueChange={setSelectedSubtaskAssignee}
                  >
                    <SelectTrigger className="w-32 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">None</span>
                        </div>
                      </SelectItem>
                      {members.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-zinc-600 flex items-center justify-center text-white text-xs font-medium">
                              {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                            </div>
                            <span className="text-xs">{member.user.name || member.user.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddSubtask}
                    disabled={!newSubtaskTitle.trim() || isCreatingSubtask}
                    size="sm"
                    className="h-9"
                  >
                    {isCreatingSubtask ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                
                {task.subtasks && task.subtasks.length > 0 ? (
                  <div className="space-y-2">
                    {task.subtasks.map(subtask => (
                      <div key={subtask.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors">
                        <button
                          onClick={() => toggleSubtaskComplete(subtask.id, subtask.completed)}
                          className="shrink-0"
                          disabled={isUpdatingSubtask}
                        >
                          {subtask.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground hover:text-card-foreground" />
                          )}
                        </button>
                        <span className={`flex-1 text-sm ${
                          subtask.completed ? 'line-through text-muted-foreground' : 'text-card-foreground'
                        }`}>
                          {subtask.title}
                        </span>
                        {subtask.assignee && (
                          <div className="w-4 h-4 rounded-full bg-zinc-600 flex items-center justify-center text-white text-xs font-medium">
                            {subtask.assignee.user.name?.charAt(0) || subtask.assignee.user.email.charAt(0)}
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteSubtask(subtask.id)}
                          disabled={isDeletingSubtask}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>
                          {Math.round((task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Circle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No subtasks yet</p>
                    <p className="text-xs">Break this task into smaller pieces</p>
                  </div>
                )}
              </div>

              {/* Activity Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                {comments.length > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{comments.length} comments</span>
                  </div>
                )}
                {task.attachments?.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Paperclip className="h-4 w-4" />
                    <span>{task.attachments.length} attachments</span>
                  </div>
                )}
                {comments.length === 0 && (!task.attachments || task.attachments.length === 0) && (
                  <span>No activity yet</span>
                )}
              </div>

              {/* Comments Section */}
              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="font-medium text-card-foreground">
                  Comments ({comments.length})
                </h3>
                
                <div className="space-y-4">
                  {comments.map((comment: CommentItem) => (
                    <div key={comment.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg group">
                      <div className="w-6 h-6 rounded-full bg-zinc-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {comment.author.name?.charAt(0) || comment.author.email.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-card-foreground">
                            {comment.author.name || comment.author.email}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {comment.content}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={isDeletingComment}
                      >
                        {isDeletingComment ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3 text-red-500" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="resize-none flex-1"
                    />
                    <Button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isCreatingComment}
                      className="bg-blue-600 hover:bg-blue-700 self-end"
                    >
                      {isCreatingComment ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}