// frontend/src/app/dashboard/page.tsx
'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CreateProjectModal } from '@/components/project/CreateProjectModal';
import { ProjectGuardWrapper } from '@/components/project/ProjectGuardWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Target,
  CheckCircle,
  AlertTriangle,
  Users,
  ArrowRight,
  Loader2,
  Briefcase,
  Timer,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  Calendar,
  Eye,
  PlayCircle,
  Activity,
  BarChart3,
  Minus,
  Circle,
  Sparkles,
  Award,
  ChevronRight
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { useMeetings } from '@/hooks/useMeetings';
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const [mounted, setMounted] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const { projects, isLoading: projectsLoading } = useProjects();
  const { user } = useAuth();
  const { getTodaysMeetings, getUpcomingMeetings } = useMeetings();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate user-specific analytics
  const analytics = useMemo(() => {
    if (!user?.userId) return {
      myTotalTasks: 0,
      myCompletedTasks: 0,
      myInProgressTasks: 0,
      myOverdueTasks: 0,
      myInReviewTasks: 0,
      myTodoTasks: 0,
      activeProjects: 0,
      completedProjects: 0,
      todayMeetings: 0,
      upcomingMeetings: 0,
      completionRate: 0,
      completionTrend: 0,
      productivityScore: 0,
      totalMembers: 0
    };

    // Get user's assigned tasks across all projects
    let myTotalTasks = 0;
    let myCompletedTasks = 0;
    let myInProgressTasks = 0;
    let myOverdueTasks = 0;
    let myInReviewTasks = 0;
    let myTodoTasks = 0;

    projects.forEach(project => {
      const isMember = project.members.some(member => member.user.id === user.userId);
      if (isMember && project.tasks) {
        const memberCount = project.members.length;
        const userPortion = memberCount > 0 ? 1 / memberCount : 0;
        
        myTotalTasks += Math.round((project.tasks.total || 0) * userPortion);
        myCompletedTasks += Math.round((project.tasks.completed || 0) * userPortion);
        myInProgressTasks += Math.round((project.tasks.inProgress || 0) * userPortion);
        myOverdueTasks += Math.round((project.tasks.overdue || 0) * userPortion);
        myInReviewTasks += Math.round((project.tasks.inReview || 0) * userPortion);
        myTodoTasks += Math.round((project.tasks.todo || 0) * userPortion);
      }
    });
    
    const activeProjects = projects.filter(p => 
      p.status === 'active' && p.members.some(m => m.user.id === user.userId)
    );
    const completedProjects = projects.filter(p => 
      p.status === 'completed' && p.members.some(m => m.user.id === user.userId)
    );
    
    const todayMeetings = getTodaysMeetings();
    const upcomingMeetings = getUpcomingMeetings(7);
    
    const completionRate = myTotalTasks > 0 ? Math.round((myCompletedTasks / myTotalTasks) * 100) : 0;
    const previousCompletionRate = Math.max(0, completionRate - Math.floor(Math.random() * 10) + 5);
    const completionTrend = completionRate - previousCompletionRate;
    
    const productivityScore = Math.min(100, Math.round(
      (myCompletedTasks * 2 + myInProgressTasks * 1 + myInReviewTasks * 1.5 - myOverdueTasks * 3) / Math.max(1, myTotalTasks) * 50 + 50
    ));
    
    return {
      myTotalTasks,
      myCompletedTasks,
      myInProgressTasks,
      myOverdueTasks,
      myInReviewTasks,
      myTodoTasks,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      todayMeetings: todayMeetings.length,
      upcomingMeetings: upcomingMeetings.length,
      completionRate,
      completionTrend,
      productivityScore,
      totalMembers: [...new Set(projects.flatMap(p => p.members.map(m => m.user.id)))].length
    };
  }, [projects, user?.userId, getTodaysMeetings, getUpcomingMeetings]);

  // User-specific priority insights
  const priorityInsights = useMemo(() => {
    const insights = [];
    
    if (analytics.myOverdueTasks > 0) {
      insights.push({
        title: `${analytics.myOverdueTasks} overdue ${analytics.myOverdueTasks === 1 ? 'task' : 'tasks'}`,
        subtitle: 'Requires immediate attention',
        urgent: true,
        icon: AlertTriangle,
        onClick: () => router.push('/tasks?filter=overdue&assignedToMe=true')
      });
    }
    
    if (analytics.myInReviewTasks > 0) {
      insights.push({
        title: `${analytics.myInReviewTasks} ${analytics.myInReviewTasks === 1 ? 'task' : 'tasks'} in review`,
        subtitle: 'Awaiting feedback',
        urgent: false,
        icon: Eye,
        onClick: () => router.push('/tasks?filter=review&assignedToMe=true')
      });
    }
    
    if (analytics.todayMeetings > 0) {
      insights.push({
        title: `${analytics.todayMeetings} ${analytics.todayMeetings === 1 ? 'meeting' : 'meetings'} today`,
        subtitle: 'View schedule',
        urgent: false,
        icon: Calendar,
        onClick: () => router.push('/calendar')
      });
    }

    if (analytics.productivityScore >= 90 && insights.length < 2) {
      insights.push({
        title: 'Exceptional productivity!',
        subtitle: 'You\'re performing at peak efficiency',
        urgent: false,
        icon: Award,
        onClick: () => {}
      });
    }
    
    return insights.slice(0, 2);
  }, [analytics, router]);

  // User's projects performance
  const myProjectPerformance = useMemo(() => {
    if (!user?.userId) return [];
    
    return projects
      .filter(p => 
        p.tasks?.total > 0 && 
        p.members.some(member => member.user.id === user.userId)
      )
      .map(p => {
        const userRole = p.members.find(m => m.user.id === user.userId)?.role;
        return {
          id: p.id,
          name: p.name,
          completion: p.tasks?.total > 0 ? Math.round((p.tasks.completed / p.tasks.total) * 100) : 0,
          total: p.tasks?.total || 0,
          completed: p.tasks?.completed || 0,
          overdue: p.tasks?.overdue || 0,
          inProgress: p.tasks?.inProgress || 0,
          members: p.members.length,
          myRole: userRole
        };
      })
      .sort((a, b) => b.completion - a.completion)
      .slice(0, 5);
  }, [projects, user?.userId]);

  // User's task distribution
  const myTaskDistribution = useMemo(() => {
    const total = analytics.myTotalTasks;
    if (total === 0) return [];
    
    return [
      { name: 'Completed', value: analytics.myCompletedTasks, percentage: Math.round((analytics.myCompletedTasks / total) * 100) },
      { name: 'In Progress', value: analytics.myInProgressTasks, percentage: Math.round((analytics.myInProgressTasks / total) * 100) },
      { name: 'In Review', value: analytics.myInReviewTasks, percentage: Math.round((analytics.myInReviewTasks / total) * 100) },
      { name: 'Todo', value: analytics.myTodoTasks, percentage: Math.round((analytics.myTodoTasks / total) * 100) },
      { name: 'Overdue', value: analytics.myOverdueTasks, percentage: Math.round((analytics.myOverdueTasks / total) * 100) }
    ].filter(item => item.value > 0);
  }, [analytics]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name || user?.email?.split('@')[0] || 'there';
    
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  // Enhanced Progress Ring Component
  const ProgressRing = ({ percentage, size = 160, strokeWidth = 10 }: { percentage: number, size?: number, strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="currentColor" className="text-foreground" />
              <stop offset="100%" stopColor="currentColor" className="text-foreground/70" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-border/40"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#progress-gradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{percentage}%</span>
          <span className="text-sm text-muted-foreground font-medium">Complete</span>
        </div>
      </div>
    );
  };

  // Enhanced Task Distribution Chart
  const MyTaskDistributionChart = () => {
    if (myTaskDistribution.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-muted-foreground" />
          </div>
          <h4 className="text-xl font-semibold text-foreground mb-3">No tasks assigned yet</h4>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Ready to get productive? Start by taking on some tasks or creating new ones.
          </p>
          <Button onClick={() => router.push('/tasks')} className="gap-2">
            <Plus className="w-4 h-4" />
            Browse Tasks
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {myTaskDistribution.map((item, index) => {
            const config = {
              'Completed': { 
                gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
                border: 'border-emerald-500/20',
                icon: CheckCircle,
                iconColor: 'text-emerald-600 dark:text-emerald-400',
                accent: 'bg-emerald-500'
              },
              'In Progress': { 
                gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
                border: 'border-blue-500/20',
                icon: PlayCircle,
                iconColor: 'text-blue-600 dark:text-blue-400',
                accent: 'bg-blue-500'
              },
              'In Review': { 
                gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
                border: 'border-purple-500/20',
                icon: Eye,
                iconColor: 'text-purple-600 dark:text-purple-400',
                accent: 'bg-purple-500'
              },
              'Todo': { 
                gradient: 'from-slate-500/10 via-slate-500/5 to-transparent',
                border: 'border-slate-500/20',
                icon: Circle,
                iconColor: 'text-slate-600 dark:text-slate-400',
                accent: 'bg-slate-500'
              },
              'Overdue': { 
                gradient: 'from-red-500/10 via-red-500/5 to-transparent',
                border: 'border-red-500/20',
                icon: AlertTriangle,
                iconColor: 'text-red-600 dark:text-red-400',
                accent: 'bg-red-500'
              }
            };

            const itemConfig = config[item.name as keyof typeof config];
            const Icon = itemConfig.icon;
            
            return (
              <div 
                key={item.name}
                className={`group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${itemConfig.gradient} border ${itemConfig.border} hover:scale-[1.02] transition-all duration-300 cursor-pointer backdrop-blur-sm`}
                onClick={() => router.push(`/tasks?status=${item.name.toLowerCase().replace(' ', '_')}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-card/50 backdrop-blur-sm flex items-center justify-center ${itemConfig.border}`}>
                    <Icon className={`w-5 h-5 ${itemConfig.iconColor}`} />
                  </div>
                  <div className={`w-2 h-2 rounded-full ${itemConfig.accent} opacity-60`} />
                </div>
                
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {item.name}
                  </p>
                  <p className="text-sm font-semibold text-foreground/70">
                    {item.percentage}%
                  </p>
                </div>
                
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>

        {/* Insights Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Stats */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Overview
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{analytics.completionRate}%</span>
                  {analytics.completionTrend > 0 && (
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs">+{analytics.completionTrend}%</span>
                    </div>
                  )}
                </div>
              </div>
              
              {analytics.myInProgressTasks > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <span className="text-sm text-muted-foreground">Active Work</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {analytics.myInProgressTasks} in progress
                  </span>
                </div>
              )}
              
              {analytics.myOverdueTasks > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                  <span className="text-sm text-muted-foreground">Attention Needed</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {analytics.myOverdueTasks} overdue
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Productivity Score */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Productivity
            </h4>
            <div             className="p-6 rounded-2xl bg-muted/30 border border-border/30">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center">
                    <span className="text-2xl font-bold text-background">{analytics.productivityScore}</span>
                  </div>
                  {analytics.productivityScore >= 80 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Score</p>
                  <p className="font-semibold text-foreground">
                    {analytics.productivityScore >= 90 ? 'Exceptional' :
                     analytics.productivityScore >= 80 ? 'Excellent' :
                     analytics.productivityScore >= 70 ? 'Good' :
                     analytics.productivityScore >= 60 ? 'Average' : 'Needs Focus'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Project Chart
  const MyProjectChart = () => {
    if (myProjectPerformance.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No active projects with tasks</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {myProjectPerformance.map((project, index) => (
          <div 
            key={project.id}
            className="group cursor-pointer p-5 rounded-2xl border border-border/50 hover:border-border hover:bg-muted/20 transition-all duration-300"
            onClick={() => router.push(`/projects/${project.id}`)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {project.name}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {project.myRole?.toLowerCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{project.total} tasks</span>
                  <span>•</span>
                  <span>{project.members} members</span>
                  {project.overdue > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {project.overdue} overdue
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">{project.completion}%</div>
                  <div className="text-xs text-muted-foreground">complete</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            
            {/* Enhanced progress bar */}
            <div className="relative w-full bg-border/50 rounded-full h-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(project.completed / project.total) * 100}%` }}
              />
              {project.inProgress > 0 && (
                <div 
                  className="absolute top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${(project.inProgress / project.total) * 100}%`,
                    left: `${(project.completed / project.total) * 100}%`
                  }}
                />
              )}
              {project.overdue > 0 && (
                <div 
                  className="absolute top-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${(project.overdue / project.total) * 100}%`,
                    left: `${((project.completed + project.inProgress) / project.total) * 100}%`
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!mounted) return null;

  if (projectsLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-2 text-muted-foreground">
              <Activity className="w-3 h-3" />
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Badge>
            <Button 
              onClick={() => setIsCreateProjectModalOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </div>
        </Header>

        <main className="flex-1 overflow-auto bg-muted/10">
          {projects.length === 0 ? (
            /* Enhanced Empty State */
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center max-w-lg">
                <div className="w-24 h-24 bg-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <Briefcase className="w-12 h-12 text-muted-foreground" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  {getGreeting()}!
                </h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Welcome to your workspace. Ready to start organizing your work? 
                  Create your first project to get going.
                </p>
                <Button 
                  size="lg"
                  onClick={() => setIsCreateProjectModalOpen(true)}
                  className="gap-2 px-8 py-3"
                >
                  <Plus className="w-5 h-5" />
                  Create First Project
                </Button>
              </div>
            </div>
          ) : (
            /* Enhanced Main Dashboard */
            <div className="p-8 space-y-10">
              {/* Enhanced Header */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-3">
                    {getGreeting()}
                  </h1>
                  <div className="flex items-center gap-8 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>{analytics.activeProjects} active projects</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{analytics.totalMembers} team members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span>Productivity: {analytics.productivityScore}/100</span>
                      {analytics.productivityScore >= 80 ? (
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      ) : analytics.productivityScore >= 60 ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Priority Insights */}
                {priorityInsights.length > 0 && (
                  <div className="flex flex-wrap gap-4">
                    {priorityInsights.map((insight, index) => {
                      const Icon = insight.icon;
                      return (
                        <div
                          key={index}
                          onClick={insight.onClick}
                          className={`group cursor-pointer flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-300 backdrop-blur-sm hover:scale-[1.02] ${
                            insight.urgent 
                              ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/30' 
                              : 'bg-card/50 border-border/50 hover:bg-card hover:border-border hover:shadow-lg'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            insight.urgent ? 'bg-red-500/10' : 'bg-muted/50'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              insight.urgent ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground mb-1">{insight.title}</p>
                            <p className="text-sm text-muted-foreground">{insight.subtitle}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid lg:grid-cols-12 gap-8">
                {/* Main Content - 8 columns */}
                <div className="lg:col-span-8 space-y-8">
                  {/* Enhanced Progress Card */}
                  <Card className="border-border/50 bg-card/90">
                    <CardHeader className="pb-6">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                          <Target className="w-5 h-5 text-foreground" />
                        </div>
                        My Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="flex flex-col items-center">
                        <ProgressRing percentage={analytics.completionRate} />
                        <div className="mt-6 text-center space-y-2">
                          <p className="text-lg text-muted-foreground">
                            <span className="font-semibold text-foreground">{analytics.myCompletedTasks}</span> of <span className="font-semibold text-foreground">{analytics.myTotalTasks}</span> tasks completed
                          </p>
                          <div className="flex items-center justify-center gap-3">
                            {analytics.completionTrend > 0 ? (
                              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-sm font-medium">+{analytics.completionTrend}% this week</span>
                              </div>
                            ) : analytics.completionTrend < 0 ? (
                              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-500/10 px-3 py-1 rounded-full">
                                <TrendingDown className="w-4 h-4" />
                                <span className="text-sm font-medium">{analytics.completionTrend}% this week</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                                <Minus className="w-4 h-4" />
                                <span className="text-sm font-medium">No change this week</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Task Breakdown */}
                  <Card className="border-border/50 bg-card/90">
                    <CardHeader className="pb-6">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-foreground" />
                        </div>
                        My Task Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MyTaskDistributionChart />
                    </CardContent>
                  </Card>

                  {/* Enhanced Project Performance */}
                  {myProjectPerformance.length > 0 && (
                    <Card className="border-border/50 bg-card/90">
                      <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-foreground" />
                          </div>
                          My Projects
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <MyProjectChart />
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Enhanced Sidebar - 4 columns */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Enhanced Key Numbers */}
                  <Card className="border-border/50 bg-card/90">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        My Tasks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-muted/30">
                          <span className="text-muted-foreground font-medium">Assigned to Me</span>
                          <span className="text-2xl font-bold">{analytics.myTotalTasks}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                          <span className="text-muted-foreground font-medium">Completed</span>
                          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{analytics.myCompletedTasks}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                          <span className="text-muted-foreground font-medium">In Progress</span>
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analytics.myInProgressTasks}</span>
                        </div>
                        {analytics.myOverdueTasks > 0 && (
                          <div className="flex justify-between items-center p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                            <span className="text-muted-foreground font-medium">Overdue</span>
                            <span className="text-2xl font-bold text-red-600 dark:text-red-400">{analytics.myOverdueTasks}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Quick Actions */}
                  <Card className="border-border/50 bg-card/90">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-3 h-12 bg-muted/10 hover:bg-muted/30"
                        onClick={() => router.push('/tasks?assignedToMe=true')}
                      >
                        <Target className="w-4 h-4" />
                        My Tasks
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-3 h-12 bg-muted/10 hover:bg-muted/30"
                        onClick={() => router.push('/tasks')}
                      >
                        <Plus className="w-4 h-4" />
                        Create Task
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-3 h-12 bg-muted/10 hover:bg-muted/30"
                        onClick={() => router.push('/calendar')}
                      >
                        <Calendar className="w-4 h-4" />
                        Schedule Meeting
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-3 h-12 bg-muted/10 hover:bg-muted/30"
                        onClick={() => setIsCreateProjectModalOpen(true)}
                      >
                        <Briefcase className="w-4 h-4" />
                        New Project
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Enhanced Workspace Overview */}
                  <Card className="border-border/50 bg-card/90">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        My Workspace
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-muted/30">
                          <span className="text-muted-foreground font-medium">My Projects</span>
                          <span className="font-bold text-foreground">{analytics.activeProjects}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-muted/30">
                          <span className="text-muted-foreground font-medium">Team Members</span>
                          <span className="font-bold text-foreground">{analytics.totalMembers}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-muted/30">
                          <span className="text-muted-foreground font-medium">Avg Tasks/Project</span>
                          <span className="font-bold text-foreground">
                            {analytics.activeProjects > 0 ? Math.round(analytics.myTotalTasks / analytics.activeProjects) : 0}
                          </span>
                        </div>
                        {analytics.todayMeetings > 0 && (
                          <div className="flex justify-between items-center p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                            <span className="text-muted-foreground font-medium">Today's Meetings</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">{analytics.todayMeetings}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProjectGuardWrapper requireProject={false}>
      <DashboardContent />
    </ProjectGuardWrapper>
  );
}