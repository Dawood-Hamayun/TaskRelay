// app/tasks/page.tsx
'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { TaskDetailPanel } from '@/components/TaskDetailPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Calendar,
  User,
  Clock,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  LayoutGrid,
  List,
  ChevronDown,
  Paperclip,
  MessageSquare,
  Circle,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useTasks } from '@/hooks/useTasks';
import { Task, TaskPriority, TaskStatus, CreateTaskDto } from '@/types/task';

import { useProjects } from '@/hooks/useProjects';

const statusColumns = [
  { id: 'TODO', title: 'To Do', color: 'status-todo', accent: 'bg-zinc-100 dark:bg-zinc-800', accentColor: 'bg-zinc-400 dark:bg-zinc-500' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'status-progress', accent: 'bg-blue-100 dark:bg-blue-900/20', accentColor: 'bg-blue-500' },
  { id: 'IN_REVIEW', title: 'In Review', color: 'status-review', accent: 'bg-amber-100 dark:bg-amber-900/20', accentColor: 'bg-amber-500' },
  { id: 'DONE', title: 'Done', color: 'status-done', accent: 'bg-emerald-100 dark:bg-emerald-900/20', accentColor: 'bg-emerald-500' }
];

const priorityConfig = {
  LOW: { color: 'text-zinc-600 dark:text-zinc-400', dot: 'bg-zinc-400 dark:priority-low' },
  MEDIUM: { color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500 dark:priority-medium' },
  HIGH: { color: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500 dark:priority-high' },
  CRITICAL: { color: 'text-red-600 dark:text-red-400', dot: 'bg-red-500 dark:priority-critical' }
};

const getTagClasses = (color: string, isDark: boolean) => {
  if (isDark) {
    const darkClasses = {
      blue: 'tag-blue',
      purple: 'tag-purple', 
      emerald: 'tag-emerald',
      red: 'tag-red',
      amber: 'tag-amber',
      orange: 'tag-orange'
    };
    return darkClasses[color as keyof typeof darkClasses] || 'bg-zinc-800 text-zinc-300 border-zinc-700';
  }
  
  const lightClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200'
  };
  return lightClasses[color as keyof typeof lightClasses] || 'bg-gray-50 text-gray-700 border-gray-200';
};

export default function TasksPage() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTaskForSubtask, setSelectedTaskForSubtask] = useState<Task | null>(null);
  const { theme } = useTheme();

  // Get projects
  const { projects, isLoading: projectsLoading } = useProjects();
  
  // Set default project when projects load
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Use dynamic data
  const { 
    tasks, 
    isLoading, 
    error, 
    createTask,
    updateTask,
    deleteTask,
    createSubtasks,
    isCreating,
    isUpdating 
  } = useTasks(selectedProjectId);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const isDark = theme === 'dark';
  
  // Get current project
  const currentProject = projects.find(p => p.id === selectedProjectId);
  
  // Filter tasks - all tasks (no more filtering for subtasks since they're not separate cards)
  const filteredTasks = tasks;

  // Derive selectedTask from tasks array
  const selectedTask = selectedTaskId ? tasks.find(task => task.id === selectedTaskId) || null : null;

  const tasksByStatus = statusColumns.reduce((acc, column) => {
    acc[column.id] = filteredTasks.filter(task => task.status === column.id as TaskStatus);
    return acc;
  }, {} as Record<string, Task[]>);

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
    if (diffDays <= 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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

  const handleCreateSubtask = (parentTask: Task) => {
    setSelectedTaskForSubtask(parentTask);
    setIsCreateModalOpen(true);
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

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  const handleCloseTaskDetail = () => {
    setSelectedTaskId(null);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setSelectedTaskForSubtask(null);
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const priorityInfo = priorityConfig[task.priority];
    const overdue = isOverdue(task.dueDate);
    
    return (
      <Card 
        className={`group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border shadow-sm ${isDark ? 'glass-card' : 'bg-white border-border'}`}
        onClick={() => handleTaskClick(task)}
      >
        <CardContent className="p-4">
          {/* Header with Priority Indicator */}
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-1.5 h-1.5 rounded-full mt-2 ${priorityInfo.dot} shrink-0`} />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-card-foreground text-sm leading-5 mb-1">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-4">
                  {task.description}
                </p>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {task.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTagClasses(tag.color, isDark)}`}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {/* Subtask Progress */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
                </div>
              )}

              {/* Due Date */}
              {task.dueDate && (
                <div className={`flex items-center gap-1 ${overdue ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                  <Clock className="h-3 w-3" />
                  <span className={overdue ? 'font-medium' : ''}>{formatDueDate(task.dueDate)}</span>
                </div>
              )}

              {/* Activity indicators */}
              {task.comments.length > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{task.comments.length}</span>
                </div>
              )}
              {task.attachments.length > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  <span>{task.attachments.length}</span>
                </div>
              )}
            </div>

            {/* Assignee */}
            {task.assignee ? (
              <div className="w-6 h-6 rounded-full bg-zinc-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                {task.assignee.user.name?.charAt(0) || task.assignee.user.email.charAt(0)}
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-dashed border-muted flex items-center justify-center">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

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
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="h-9 px-3 pr-8 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring appearance-none min-w-[160px]"
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Filter className="h-4 w-4" />
            </Button>
            
            <Button 
              className="gap-2 h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" 
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
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {currentProject?.name || 'Tasks'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredTasks.length} tasks in this project
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
            /* Kanban View */
            <div className="p-6 bg-background min-h-full overflow-x-auto">
              <div className="flex gap-6 min-w-max pb-6">
                {statusColumns.map((column, index) => {
                  const columnTasks = tasksByStatus[column.id] || [];
                  
                  return (
                    <div 
                      key={column.id} 
                      className={`flex-shrink-0 w-80 ${index === statusColumns.length - 1 ? 'mr-6' : ''}`}
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between mb-4 pb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${column.accentColor}`} />
                          <h3 className={`font-semibold text-sm ${column.color}`}>
                            {column.title}
                          </h3>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${column.accent} ${column.color}`}>
                          {columnTasks.length}
                        </span>
                      </div>
                      
                      {/* Tasks */}
                      <div className="space-y-3">
                        {columnTasks.map(task => (
                          <TaskCard key={task.id} task={task} />
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
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* List View */
            <div className="bg-background min-h-full">
              <div className="p-6 space-y-8">
                {statusColumns.map(column => {
                  const tasks = tasksByStatus[column.id];
                  if (!tasks || tasks.length === 0) return null;
                  
                  return (
                    <div key={column.id} className="space-y-3">
                      {/* Section Header */}
                      <div className="flex items-center gap-3 pb-3 border-b border-border">
                        <div className={`w-2 h-2 rounded-full ${column.accentColor}`} />
                        <h3 className={`font-semibold text-sm ${column.color}`}>
                          {column.title}
                        </h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${column.accent} ${column.color}`}>
                          {tasks.length}
                        </span>
                      </div>
                      
                      {/* Tasks List */}
                      <div className="space-y-2">
                        {tasks.map(task => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* Modals */}
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
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