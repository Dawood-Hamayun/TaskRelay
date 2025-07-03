// frontend/src/app/tasks/page.tsx - Enhanced with drag & drop
'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { TaskDetailPanel } from '@/components/TaskDetailPanel';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid,
  List,
  ChevronDown,
  Loader2,
  FolderOpen,
  AlertCircle,
  X,
  MoreHorizontal,
  Clock,
  MessageSquare,
  Paperclip,
  Tag as TagIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  User,
  CheckCircle2,
  Circle,
  Edit,
  Trash2,
  Copy,
  Eye
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useMembers } from '@/hooks/useMembers';
import { useProjectSelection } from '@/hooks/useProjectSelection';
import { Task, TaskStatus, TaskPriority, CreateTaskDto } from '@/types/task';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTaskCard } from '@/components/tasks/SortableTaskCard';
import { DroppableColumn } from '@/components/tasks/DroppableColumn';

const statusColumns = [
  { id: 'TODO', title: 'To Do', accent: 'bg-zinc-100 dark:bg-zinc-800', accentColor: 'bg-zinc-400 dark:bg-zinc-500' },
  { id: 'IN_PROGRESS', title: 'In Progress', accent: 'bg-blue-100 dark:bg-blue-900/20', accentColor: 'bg-blue-500' },
  { id: 'IN_REVIEW', title: 'In Review', accent: 'bg-amber-100 dark:bg-amber-900/20', accentColor: 'bg-amber-500' },
  { id: 'DONE', title: 'Done', accent: 'bg-emerald-100 dark:bg-emerald-900/20', accentColor: 'bg-emerald-500' }
];

const priorityConfig: Record<TaskPriority, { 
  label: string; 
  color: string; 
  icon: React.ComponentType<any>;
}> = {
  LOW: { 
    label: 'Low', 
    color: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    icon: ArrowDown
  },
  MEDIUM: { 
    label: 'Medium', 
    color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    icon: ArrowUpDown
  },
  HIGH: { 
    label: 'High', 
    color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
    icon: ArrowUp
  },
  CRITICAL: { 
    label: 'Critical', 
    color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
    icon: AlertCircle
  }
};

const statusConfig: Record<TaskStatus, { label: string; color: string; }> = {
  TODO: { 
    label: 'To Do', 
    color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  },
  IN_PROGRESS: { 
    label: 'In Progress', 
    color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
  },
  IN_REVIEW: { 
    label: 'In Review', 
    color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
  },
  DONE: { 
    label: 'Done', 
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
  },
  BACKLOG: { 
    label: 'Backlog', 
    color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
  }
};

type SortField = 'title' | 'priority' | 'status' | 'dueDate' | 'assignee' | 'created';
type SortDirection = 'asc' | 'desc';

export default function TasksPage() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { theme } = useTheme();

  // Get projects and handle selection persistence
  const { projects, isLoading: projectsLoading } = useProjects();
  const { selectedProjectId, currentProject, handleProjectChange } = useProjectSelection(projects);
  
  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Use dynamic data
  const { 
    tasks, 
    isLoading, 
    error, 
    createTask,
    updateTask,
    deleteTask,
    isCreating,
    isDeleting
  } = useTasks(selectedProjectId);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTask = selectedTaskId ? tasks.find(task => task.id === selectedTaskId) || null : null;
  const hasActiveFilters = searchQuery || filterStatus !== 'all' || filterPriority !== 'all';

  // Filter and sort tasks for list view
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort tasks for list view
    if (viewMode === 'list') {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'priority':
            const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
            aValue = priorityOrder[a.priority];
            bValue = priorityOrder[b.priority];
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'dueDate':
            aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            break;
          case 'assignee':
            aValue = a.assignee?.user.name || a.assignee?.user.email || '';
            bValue = b.assignee?.user.name || b.assignee?.user.email || '';
            break;
          default: // created
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [tasks, searchQuery, filterStatus, filterPriority, sortField, sortDirection, viewMode]);

  // Handle drag end event
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id as string;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Check if dropping on a different column
    const newStatus = over.id as TaskStatus;
    if (task.status !== newStatus && Object.keys(statusConfig).includes(newStatus)) {
      try {
        await updateTask({
          id: taskId,
          data: { status: newStatus }
        });
        
        // Send webhook notification
        try {
          await fetch('/api/webhooks/task-moved', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              taskId,
              taskTitle: task.title,
              fromStatus: task.status,
              toStatus: newStatus,
              projectId: selectedProjectId,
              timestamp: new Date().toISOString()
            })
          });
        } catch (webhookError) {
          console.warn('Webhook notification failed:', webhookError);
        }
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }
  };

  if (!mounted) {
    return null;
  }

  if (projectsLoading || isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Projects Found</h2>
            <p className="text-muted-foreground">Create a project to start managing tasks</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-red-600">Failed to load tasks</p>
            <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  const tasksByStatus = statusColumns.reduce((acc, column) => {
    acc[column.id] = filteredAndSortedTasks.filter(task => task.status === column.id as TaskStatus);
    return acc;
  }, {} as Record<string, Task[]>);

  const handleCreateTask = async (taskData: CreateTaskDto & { projectId: string }) => {
    try {
      await createTask({
        projectId: taskData.projectId,
        data: {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          status: taskData.status,
          dueDate: taskData.dueDate,
          assigneeId: taskData.assigneeId,
        }
      });
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask({
        id: taskId,
        data: {
          title: updates.title,
          description: updates.description,
          priority: updates.priority,
          status: updates.status,
          dueDate: updates.dueDate,
          assigneeId: updates.assigneeId,
        }
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        await deleteTask(task.id);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleDuplicateTask = async (task: Task) => {
    try {
      await createTask({
        projectId: task.projectId,
        data: {
          title: `${task.title} (Copy)`,
          description: task.description,
          priority: task.priority,
          status: 'TODO',
          dueDate: task.dueDate,
          assigneeId: task.assigneeId,
        }
      });
    } catch (error) {
      console.error('Failed to duplicate task:', error);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterPriority('all');
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  const handleProjectChangeWithFilters = (projectId: string) => {
    handleProjectChange(projectId);
    // Clear any active filters when switching projects
    setSearchQuery('');
    setFilterStatus('all');
    setFilterPriority('all');
    setSelectedTasks(new Set());
  };

  const handleCloseTaskDetail = () => {
    setSelectedTaskId(null);
  };

  // List view helper functions
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(new Set(filteredAndSortedTasks.map(task => task.id)));
    } else {
      setSelectedTasks(new Set());
    }
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (checked) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays <= 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-medium text-xs hover:bg-transparent"
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ArrowUp className="h-3 w-3" /> : 
            <ArrowDown className="h-3 w-3" />
        )}
      </div>
    </Button>
  );

  const TaskActions = ({ task }: { task: Task }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => handleTaskClick(task)}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSelectedTaskId(task.id)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Task
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDuplicateTask(task)}>
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => handleDeleteTask(task)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const allSelected = selectedTasks.size === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0;
  const someSelected = selectedTasks.size > 0 && selectedTasks.size < filteredAndSortedTasks.length;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header>
          <div className="flex items-center gap-3">
            {/* Project Filter */}
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectChangeWithFilters(e.target.value)}
                className="h-9 px-3 pr-8 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring appearance-none min-w-[160px]"
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-64"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
                className="h-9 px-3 pr-8 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring appearance-none"
              >
                <option value="all">All Status</option>
                {statusColumns.map(status => (
                  <option key={status.id} value={status.id}>{status.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
                className="h-9 px-3 pr-8 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring appearance-none"
              >
                <option value="all">All Priority</option>
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
            
            <Button 
              className="gap-2 h-9 bg-primary hover:bg-primary/90 text-primary-foreground" 
              onClick={() => setIsCreateModalOpen(true)}
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              New Task
            </Button>
          </div>
        </Header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Page Header */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {currentProject?.name || 'Tasks'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredAndSortedTasks.length} tasks {hasActiveFilters && `(filtered from ${tasks.length})`}
                </p>
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                  className={`h-8 text-xs px-3 ${viewMode === 'kanban' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                >
                  <LayoutGrid className="h-3 w-3 mr-2" />
                  Board
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`h-8 text-xs px-3 ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                >
                  <List className="h-3 w-3 mr-2" />
                  List
                </Button>
              </div>
            </div>
          </div>

          {viewMode === 'kanban' ? (
            /* Kanban Board View with Drag & Drop */
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCenter} 
              onDragEnd={handleDragEnd}
            >
              <div className="p-6 bg-background min-h-full overflow-x-auto">
                <div className="flex gap-6 min-w-max pb-6">
                  {statusColumns.map((column, index) => {
                    const columnTasks = tasksByStatus[column.id] || [];
                    
                    return (
                      <DroppableColumn 
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        accent={column.accent}
                        accentColor={column.accentColor}
                        taskCount={columnTasks.length}
                        className={`flex-shrink-0 w-80 ${index === statusColumns.length - 1 ? 'mr-6' : ''}`}
                      >
                        <SortableContext items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                          <div className="space-y-3">
                            {columnTasks.map(task => (
                              <SortableTaskCard 
                                key={task.id} 
                                task={task} 
                                onClick={handleTaskClick}
                                onEdit={() => setSelectedTaskId(task.id)}
                                onDelete={handleDeleteTask}
                                onDuplicate={handleDuplicateTask}
                              />
                            ))}
                            
                            {/* Add Task Button */}
                            <Button
                              variant="ghost"
                              className="w-full h-12 border-2 border-dashed border-muted text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200 group"
                              onClick={() => setIsCreateModalOpen(true)}
                              disabled={isCreating}
                            >
                              {isCreating ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                              )}
                              <span className="text-sm">Add task</span>
                            </Button>
                          </div>
                        </SortableContext>
                      </DroppableColumn>
                    );
                  })}
                </div>
              </div>
            </DndContext>
          ) : (
            /* Enhanced List View */
            <div className="p-6 space-y-4">
              {/* Bulk Actions */}
              {selectedTasks.size > 0 && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
                  </span>
                  <Button variant="outline" size="sm">
                    Bulk Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    Delete Selected
                  </Button>
                </div>
              )}

              {/* Task Table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            allSelected
                              ? true                // every row selected
                              : someSelected
                              ? "indeterminate"     // some rows selected
                              : false               // none selected
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="w-[300px]">
                        <SortableHeader field="title">Task</SortableHeader>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <SortableHeader field="status">Status</SortableHeader>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <SortableHeader field="priority">Priority</SortableHeader>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <SortableHeader field="assignee">Assignee</SortableHeader>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <SortableHeader field="dueDate">Due Date</SortableHeader>
                      </TableHead>
                      <TableHead className="w-[100px]">Progress</TableHead>
                      <TableHead className="w-[80px]">Activity</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedTasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <Search className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              {hasActiveFilters ? 'No tasks match your filters' : 'No tasks found'}
                            </p>
                            {!hasActiveFilters && (
                              <Button onClick={() => setIsCreateModalOpen(true)} variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Create your first task
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedTasks.map((task) => {
                        const PriorityIcon = priorityConfig[task.priority].icon;
                        const hasSubtasks = task.subtasks && task.subtasks.length > 0;
                        const completedSubtasks = hasSubtasks ? task.subtasks.filter(st => st.completed).length : 0;
                        const totalSubtasks = hasSubtasks ? task.subtasks.length : 0;
                        const progressPercentage = hasSubtasks ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
                        const overdue = isOverdue(task.dueDate ?? null);

                        return (
                          <TableRow 
                            key={task.id} 
                            className="hover:bg-muted/50 cursor-pointer group"
                            onClick={() => handleTaskClick(task)}
                          >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedTasks.has(task.id)}
                                onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                              />
                            </TableCell>
                            
                            <TableCell>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  {task.status === 'DONE' ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className={`font-medium ${task.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.title}
                                  </span>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1 ml-6">
                                    {task.description}
                                  </p>
                                )}
                                {task.tags && task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 ml-6">
                                    {task.tags.slice(0, 2).map(({ tag }) => (
                                      <Badge key={tag.id} variant="secondary" className="text-xs">
                                        <TagIcon className="h-2.5 w-2.5 mr-1" />
                                        {tag.name}
                                      </Badge>
                                    ))}
                                    {task.tags.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{task.tags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <Badge variant="secondary" className={statusConfig[task.status].color}>
                                {statusConfig[task.status].label}
                              </Badge>
                            </TableCell>
                            
                            <TableCell>
                              <Badge variant="secondary" className={priorityConfig[task.priority].color}>
                                <PriorityIcon className="h-3 w-3 mr-1" />
                                {priorityConfig[task.priority].label}
                              </Badge>
                            </TableCell>
                            
                            <TableCell>
                              {task.assignee ? (
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-medium">
                                    {task.assignee.user.name?.charAt(0) || task.assignee.user.email.charAt(0)}
                                  </div>
                                  <span className="text-sm truncate">
                                    {task.assignee.user.name || task.assignee.user.email}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <User className="h-4 w-4" />
                                  <span className="text-sm">Unassigned</span>
                                </div>
                              )}
                            </TableCell>
                            
                            <TableCell>
                              {task.dueDate ? (
                                <div className={`flex items-center gap-1 ${overdue ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                                  <Clock className="h-3 w-3" />
                                  <span className="text-sm">{formatDate(task.dueDate)}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            
                            <TableCell>
                              {hasSubtasks ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{completedSubtasks}/{totalSubtasks}</span>
                                    <span>{progressPercentage}%</span>
                                  </div>
                                  <Progress value={progressPercentage} className="h-1" />
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {task.comments && task.comments.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    <span>{task.comments.length}</span>
                                  </div>
                                )}
                                {task.attachments && task.attachments.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Paperclip className="h-3 w-3" />
                                    <span>{task.attachments.length}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <TaskActions task={task} />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
              {filteredAndSortedTasks.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                  <span>
                    Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
                    {hasActiveFilters && ' (filtered)'}
                  </span>
                  <div className="flex items-center gap-4">
                    <span>{selectedTasks.size} selected</span>
                    <span>
                      {tasks.filter(t => t.status === 'DONE').length} completed
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Modals */}
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTask}
          projectId={selectedProjectId}
          projects={projects}
        />

        <TaskDetailPanel
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={handleCloseTaskDetail}
          onUpdate={handleUpdateTask}
        />
      </div>
    </div>
  );
}