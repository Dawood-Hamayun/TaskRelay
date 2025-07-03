// frontend/src/components/project/ProjectOverviewTab.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2,
  Clock,
  Users,
  AlertTriangle,
  Activity,
  ArrowRight,
  Circle,
  Plus,
  Mail,
  Crown,
  TrendingUp,
  Target,
  Calendar,
  Zap,
  Eye,
  PlayCircle,
  PauseCircle,
  Timer
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BACKLOG';
  updatedAt: string;
  assignee?: {
    user: {
      name?: string;
      email: string;
      avatar: string;
      color: string;
    };
  };
}

interface ProjectMember {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  user: {
    id: string;
    name?: string;
    email: string;
    avatar: string;
    color: string;
  };
}

interface ProjectOverviewTabProps {
  projectId: string;
  currentProject: {
    members: ProjectMember[];
  };
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    inReview: number;
    overdue: number;
    todo: number;
  };
  recentTasks: Task[];
  canManage: boolean;
  setActiveTab: (tab: string) => void;
  setIsInviteModalOpen: (open: boolean) => void;
}

export function ProjectOverviewTab({
  projectId,
  currentProject,
  taskStats,
  recentTasks,
  canManage,
  setActiveTab,
  setIsInviteModalOpen
}: ProjectOverviewTabProps) {
  const router = useRouter();

  const completionRate = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;
  const tasksPerMember = taskStats.total > 0 && currentProject.members.length > 0 ? Math.round((taskStats.total / currentProject.members.length) * 10) / 10 : 0;
  const workloadDistribution = taskStats.total > 0 ? Math.round(((taskStats.inProgress + taskStats.inReview) / taskStats.total) * 100) : 0;
  
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Task distribution for the chart
  const taskDistribution = [
    { 
      name: 'Completed', 
      value: taskStats.completed, 
      color: '#10b981', 
      bgColor: 'bg-emerald-500',
      lightBg: 'bg-emerald-50 dark:bg-emerald-950/20'
    },
    { 
      name: 'In Progress', 
      value: taskStats.inProgress, 
      color: '#3b82f6', 
      bgColor: 'bg-blue-500',
      lightBg: 'bg-blue-50 dark:bg-blue-950/20'
    },
    { 
      name: 'In Review', 
      value: taskStats.inReview, 
      color: '#8b5cf6', 
      bgColor: 'bg-purple-500',
      lightBg: 'bg-purple-50 dark:bg-purple-950/20'
    },
    { 
      name: 'To Do', 
      value: taskStats.todo, 
      color: '#6b7280', 
      bgColor: 'bg-gray-500',
      lightBg: 'bg-muted/50'
    }
  ].filter(item => item.value > 0);

  // Modern donut chart showing task distribution
  const DonutChart = () => {
    if (taskStats.total === 0) return null;

    const radius = 60;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;
    
    let accumulatedPercentage = 0;
    
    return (
      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 140 140">
          {/* Background circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-border"
          />
          
          {/* Progress segments */}
          {taskDistribution.map((segment, index) => {
            const percentage = segment.value / taskStats.total;
            const strokeDasharray = `${percentage * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercentage * circumference;
            
            accumulatedPercentage += percentage;
            
            return (
              <circle
                key={segment.name}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{
                  animationDelay: `${index * 0.15}s`
                }}
              />
            );
          })}
        </svg>
        
        {/* Center content - show completion percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{completionRate}%</span>
          <span className="text-xs text-muted-foreground font-medium">Complete</span>
        </div>
      </div>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />;
      case 'IN_PROGRESS':
        return <PlayCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />;
      case 'IN_REVIEW':
        return <Eye className="w-3 h-3 text-purple-600 dark:text-purple-400" />;
      default:
        return <Circle className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'bg-emerald-50 dark:bg-emerald-950/20';
      case 'IN_PROGRESS':
        return 'bg-blue-50 dark:bg-blue-950/20';
      case 'IN_REVIEW':
        return 'bg-purple-50 dark:bg-purple-950/20';
      default:
        return 'bg-muted/50';
    }
  };

  // Get the primary focus area based on current task state
  const getPrimaryFocus = () => {
    if (taskStats.overdue > 0) {
      return {
        title: 'Overdue Tasks',
        value: taskStats.overdue,
        description: 'Need immediate attention',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        icon: AlertTriangle
      };
    } else if (taskStats.inReview > 0) {
      return {
        title: 'Awaiting Review',
        value: taskStats.inReview,
        description: 'Ready for feedback',
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-950/20',
        icon: Eye
      };
    } else if (taskStats.inProgress > 0) {
      return {
        title: 'In Progress',
        value: taskStats.inProgress,
        description: 'Currently being worked on',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950/20',
        icon: PlayCircle
      };
    } else if (taskStats.todo > 0) {
      return {
        title: 'Ready to Start',
        value: taskStats.todo,
        description: 'Awaiting assignment',
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/50',
        icon: Circle
      };
    } else {
      return {
        title: 'All Done',
        value: '✓',
        description: 'No pending tasks',
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
        icon: CheckCircle2
      };
    }
  };

  const primaryFocus = getPrimaryFocus();
  const PrimaryIcon = primaryFocus.icon;

  return (
    <div className="space-y-8">
      {/* Key Metrics - Simplified and more meaningful */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Tasks */}
        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{taskStats.total}</p>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
            </div>
          </div>
          <div className="mt-5">
            <p className="text-xs text-muted-foreground">
              {currentProject.members.length} team member{currentProject.members.length !== 1 ? 's' : ''} working
            </p>
          </div>
        </div>

        {/* Last Activity */}
        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {recentTasks.length > 0 ? getTimeAgo(recentTasks[0].updatedAt) : '-'}
              </p>
              <p className="text-sm text-muted-foreground">Last Activity</p>
            </div>
          </div>
          <div className="mt-5">
            {recentTasks.length > 0 ? (
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${getStatusBg(recentTasks[0].status)}`}>
                  {getStatusIcon(recentTasks[0].status)}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {recentTasks[0].title}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No recent activity
              </p>
            )}
          </div>
        </div>

        {/* Primary Focus - Dynamic based on current state */}
        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${primaryFocus.bgColor}`}>
              <PrimaryIcon className={`w-6 h-6 ${primaryFocus.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{primaryFocus.value}</p>
              <p className="text-sm text-muted-foreground">{primaryFocus.title}</p>
            </div>
          </div>
          <div className="mt-5">
            <p className={`text-xs font-medium ${primaryFocus.color}`}>
              {primaryFocus.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Task Distribution Chart */}
        <div className="xl:col-span-2 bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Task Distribution</h3>
          
          {taskStats.total > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Donut Chart - now shows completion in center */}
              <div className="flex flex-col items-center">
                <DonutChart />
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Overall project progress
                </p>
              </div>

              {/* Status Breakdown with actionable insights */}
              <div className="space-y-5">
                {taskDistribution.map((item) => (
                  <div key={item.name} className="group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.bgColor}`} />
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">{item.value}</span>
                        <span className="text-xs text-muted-foreground font-medium min-w-[35px] text-right">
                          {Math.round((item.value / taskStats.total) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div 
                        className={`h-2 ${item.bgColor} rounded-full transition-all duration-700 group-hover:opacity-80`}
                        style={{ width: `${(item.value / taskStats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}

                {/* Task state insights */}
                <div className="pt-4 space-y-2 border-t border-border">
                  {taskStats.inReview > 0 && (
                    <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                      <Eye className="w-3 h-3" />
                      <span>{taskStats.inReview} task{taskStats.inReview !== 1 ? 's' : ''} awaiting review</span>
                    </div>
                  )}
                  {taskStats.inProgress > 0 && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                      <PlayCircle className="w-3 h-3" />
                      <span>{taskStats.inProgress} task{taskStats.inProgress !== 1 ? 's' : ''} in progress</span>
                    </div>
                  )}
                  {taskStats.todo > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Circle className="w-3 h-3" />
                      <span>{taskStats.todo} task{taskStats.todo !== 1 ? 's' : ''} ready to start</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Circle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="text-lg font-medium text-foreground mb-2">No tasks yet</h4>
              <p className="text-muted-foreground mb-4">Get started by creating your first task</p>
              <button 
                onClick={() => router.push(`/tasks?project=${projectId}`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Task
              </button>
            </div>
          )}

          {/* Recent Activity */}
          {taskStats.total > 0 && (
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-foreground">Recent Activity</h4>
                <button 
                  onClick={() => router.push(`/tasks?project=${projectId}`)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  View all →
                </button>
              </div>
              
              {recentTasks.length > 0 ? (
                <div className="space-y-2">
                  {recentTasks.slice(0, 4).map((task) => (
                    <div 
                      key={task.id} 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent cursor-pointer group transition-colors"
                      onClick={() => router.push(`/tasks?project=${projectId}&task=${task.id}`)}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusBg(task.status)}`}>
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getTimeAgo(task.updatedAt)}
                        </p>
                      </div>
                      {task.assignee && (
                        <div className={`w-7 h-7 rounded-full ${task.assignee.user.color} flex items-center justify-center text-white text-xs font-medium`}>
                          {task.assignee.user.avatar}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push(`/tasks?project=${projectId}`)}
                className="w-full flex items-center gap-3 p-3 text-left rounded-xl border border-border hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/10 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-950/30 transition-colors">
                  <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">New Task</p>
                  <p className="text-xs text-muted-foreground">Create and assign tasks</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('team')}
                className="w-full flex items-center gap-3 p-3 text-left rounded-xl border border-border hover:border-border hover:bg-accent transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Team</p>
                  <p className="text-xs text-muted-foreground">{currentProject.members.length} members</p>
                </div>
              </button>

              {canManage && (
                <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="w-full flex items-center gap-3 p-3 text-left rounded-xl border border-border hover:border-border hover:bg-accent transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Invite</p>
                    <p className="text-xs text-muted-foreground">Add team members</p>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Team Preview */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Team</h3>
              <button 
                onClick={() => setActiveTab('team')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                View all →
              </button>
            </div>
            <div className="space-y-3">
              {currentProject.members.slice(0, 4).map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                  <div className={`w-9 h-9 rounded-full ${member.user.color} flex items-center justify-center text-white text-sm font-medium relative`}>
                    {member.user.avatar}
                    {member.role === 'OWNER' && (
                      <Crown className="absolute -top-1 -right-1 w-3 h-3 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {member.user.name || member.user.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{member.role.toLowerCase()}</p>
                  </div>
                </div>
              ))}
              {currentProject.members.length > 4 && (
                <div className="text-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    +{currentProject.members.length - 4} more members
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}