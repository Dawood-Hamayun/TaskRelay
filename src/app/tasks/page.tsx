// app/tasks/page.tsx
'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { TaskDetailPanel } from '@/components/TaskDetailPanel';
import { TaskCard } from '@/components/tasks/TaskCard'; // Fixed import path
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid,
  List,
  ChevronDown,
  Loader2,
  FolderOpen,
  AlertCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { Task, TaskStatus, CreateTaskDto } from '@/types/task';

const statusColumns = [
  { id: 'TODO', title: 'To Do', accent: 'bg-zinc-100 dark:bg-zinc-800', accentColor: 'bg-zinc-400 dark:bg-zinc-500' },
  { id: 'IN_PROGRESS', title: 'In Progress', accent: 'bg-blue-100 dark:bg-blue-900/20', accentColor: 'bg-blue-500' },
  { id: 'IN_REVIEW', title: 'In Review', accent: 'bg-amber-100 dark:bg-amber-900/20', accentColor: 'bg-amber-500' },
  { id: 'DONE', title: 'Done', accent: 'bg-emerald-100 dark:bg-emerald-900/20', accentColor: 'bg-emerald-500' }
];

export default function TasksPage() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
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
    isCreating,
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

  const currentProject = projects.find(p => p.id === selectedProjectId);
  const filteredTasks = tasks;
  const selectedTask = selectedTaskId ? tasks.find(task => task.id === selectedTaskId) || null : null;

  const tasksByStatus = statusColumns.reduce((acc, column) => {
    acc[column.id] = filteredTasks.filter(task => task.status === column.id as TaskStatus);
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

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  const handleCloseTaskDetail = () => {
    setSelectedTaskId(null);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
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
                          <h3 className="font-semibold text-sm text-foreground">
                            {column.title}
                          </h3>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${column.accent} text-muted-foreground`}>
                          {columnTasks.length}
                        </span>
                      </div>
                      
                      {/* Tasks */}
                      <div className="space-y-3">
                        {columnTasks.map(task => (
                          <TaskCard 
                            key={task.id} 
                            task={task} 
                            onClick={handleTaskClick}
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
                        <h3 className="font-semibold text-sm text-foreground">
                          {column.title}
                        </h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${column.accent} text-muted-foreground`}>
                          {tasks.length}
                        </span>
                      </div>
                      
                      {/* Tasks List */}
                      <div className="space-y-2">
                        {tasks.map(task => (
                          <TaskCard 
                            key={task.id} 
                            task={task} 
                            onClick={handleTaskClick}
                          />
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