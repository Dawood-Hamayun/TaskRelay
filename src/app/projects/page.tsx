'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderOpen,
  Star,
  Archive
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

// Types based on your Prisma schema
interface Project {
  id: string;
  name: string;
  description?: string;
  members: {
    id: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string;
      color: string;
    };
  }[];
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
  meetings: {
    id: string;
    title: string;
    datetime: string;
  }[];
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
  createdAt: string;
  lastActivity: string;
  status: 'active' | 'archived' | 'completed';
}

// Mock data with more neutral colors for dark mode
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern design and improved UX',
    members: [
      {
        id: 'm1',
        role: 'OWNER',
        user: {
          id: 'u1',
          name: 'John Doe',
          email: 'john@company.com',
          avatar: 'JD',
          color: 'bg-zinc-600'
        }
      },
      {
        id: 'm2',
        role: 'ADMIN',
        user: {
          id: 'u2',
          name: 'Jane Smith',
          email: 'jane@company.com',
          avatar: 'JS',
          color: 'bg-slate-600'
        }
      },
      {
        id: 'm3',
        role: 'MEMBER',
        user: {
          id: 'u3',
          name: 'Mike Wilson',
          email: 'mike@company.com',
          avatar: 'MW',
          color: 'bg-gray-600'
        }
      }
    ],
    tasks: {
      total: 15,
      completed: 8,
      inProgress: 5,
      overdue: 2
    },
    meetings: [
      {
        id: 'meet1',
        title: 'Design Review',
        datetime: '2024-12-15T14:00:00Z'
      }
    ],
    tags: [
      { id: 't1', name: 'Frontend', color: 'neutral' },
      { id: 't2', name: 'Design', color: 'neutral' }
    ],
    createdAt: '2024-11-01T10:00:00Z',
    lastActivity: '2024-12-13T16:30:00Z',
    status: 'active'
  },
  {
    id: '2',
    name: 'Performance Optimization',
    description: 'Improve application performance and reduce load times',
    members: [
      {
        id: 'm4',
        role: 'OWNER',
        user: {
          id: 'u3',
          name: 'Mike Wilson',
          email: 'mike@company.com',
          avatar: 'MW',
          color: 'bg-gray-600'
        }
      },
      {
        id: 'm5',
        role: 'MEMBER',
        user: {
          id: 'u4',
          name: 'Sarah Davis',
          email: 'sarah@company.com',
          avatar: 'SD',
          color: 'bg-stone-600'
        }
      }
    ],
    tasks: {
      total: 8,
      completed: 3,
      inProgress: 4,
      overdue: 1
    },
    meetings: [],
    tags: [
      { id: 't3', name: 'Backend', color: 'neutral' },
      { id: 't4', name: 'Performance', color: 'neutral' }
    ],
    createdAt: '2024-10-15T09:00:00Z',
    lastActivity: '2024-12-12T11:15:00Z',
    status: 'active'
  },
  {
    id: '3',
    name: 'Design System',
    description: 'Create a comprehensive design system and component library',
    members: [
      {
        id: 'm6',
        role: 'OWNER',
        user: {
          id: 'u4',
          name: 'Sarah Davis',
          email: 'sarah@company.com',
          avatar: 'SD',
          color: 'bg-stone-600'
        }
      },
      {
        id: 'm7',
        role: 'MEMBER',
        user: {
          id: 'u1',
          name: 'John Doe',
          email: 'john@company.com',
          avatar: 'JD',
          color: 'bg-zinc-600'
        }
      }
    ],
    tasks: {
      total: 12,
      completed: 9,
      inProgress: 2,
      overdue: 0
    },
    meetings: [
      {
        id: 'meet2',
        title: 'Component Review',
        datetime: '2024-12-16T10:00:00Z'
      }
    ],
    tags: [
      { id: 't2', name: 'Design', color: 'neutral' },
      { id: 't5', name: 'Components', color: 'neutral' }
    ],
    createdAt: '2024-09-20T14:00:00Z',
    lastActivity: '2024-12-13T09:45:00Z',
    status: 'active'
  },
  {
    id: '4',
    name: 'Team Management',
    description: 'Establish processes and workflows for better team collaboration',
    members: [
      {
        id: 'm8',
        role: 'OWNER',
        user: {
          id: 'u2',
          name: 'Jane Smith',
          email: 'jane@company.com',
          avatar: 'JS',
          color: 'bg-slate-600'
        }
      }
    ],
    tasks: {
      total: 6,
      completed: 6,
      inProgress: 0,
      overdue: 0
    },
    meetings: [],
    tags: [
      { id: 't6', name: 'Process', color: 'neutral' }
    ],
    createdAt: '2024-08-10T16:00:00Z',
    lastActivity: '2024-11-28T13:20:00Z',
    status: 'completed'
  }
];

export default function ProjectsPage() {
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';
  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || project.status === filter;
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressPercentage = (tasks: Project['tasks']) => {
    return tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0;
  };

  const getProgressColor = (percentage: number, isDark: boolean) => {
    if (isDark) {
      if (percentage >= 80) return 'bg-emerald-500';
      if (percentage >= 60) return 'bg-blue-500';
      if (percentage >= 40) return 'bg-amber-500';
      return 'bg-zinc-500';
    }
    
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-amber-500';
    return 'bg-gray-400';
  };

  const ProjectCard = ({ project }: { project: Project }) => {
    const progress = getProgressPercentage(project.tasks);
    const isOwner = project.members.some(member => 
      member.role === 'OWNER' && member.user.name === 'John Doe' // Current user check
    );

    return (
      <Card className={`group hover:shadow-lg transition-all duration-200 cursor-pointer border shadow-sm ${isDark ? 'glass-card' : 'bg-white border-border'}`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {project.name}
                </h3>
                {project.status === 'completed' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                )}
                {project.status === 'archived' && (
                  <Archive className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-5">
                  {project.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 ml-3">
              {isOwner && <Star className="w-4 h-4 text-amber-500" />}
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {project.tags.slice(0, 3).map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                >
                  <div className="w-2 h-2 rounded-full bg-muted-foreground mr-1" />
                  {tag.name}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">+{project.tags.length - 3} more</span>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-card-foreground">{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress, isDark)}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-card-foreground">{project.tasks.total}</div>
              <div className="text-xs text-muted-foreground">Total Tasks</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{project.tasks.completed}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-primary">{project.tasks.inProgress}</div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </div>
          </div>

          {/* Team & Meta */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {project.members.slice(0, 4).map(member => (
                  <div
                    key={member.id}
                    className={`w-7 h-7 rounded-full ${member.user.color} flex items-center justify-center text-white text-xs font-semibold border-2 border-background shadow-sm`}
                    title={member.user.name}
                  >
                    {member.user.avatar}
                  </div>
                ))}
                {project.members.length > 4 && (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-semibold border-2 border-background shadow-sm">
                    +{project.members.length - 4}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground ml-1">
                {project.members.length} member{project.members.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {project.tasks.overdue > 0 && (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-3 h-3" />
                  {project.tasks.overdue}
                </div>
              )}
              {project.meetings.length > 0 && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {project.meetings.length}
                </div>
              )}
              <span>{formatDate(project.lastActivity)}</span>
            </div>
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
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-10 pr-4 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring w-64"
              />
            </div>
            
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Filter className="h-4 w-4" />
            </Button>
            
            <Button className="gap-2 h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </Header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Page Header */}
          <div className="px-6 py-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Projects</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredProjects.length} projects
                </p>
              </div>
              
              {/* Filter Tabs */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'active', label: 'Active' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'archived', label: 'Archived' }
                ].map(tab => (
                  <Button
                    key={tab.key}
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilter(tab.key as any)}
                    className={`h-8 text-xs px-3 ${filter === tab.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="p-6">
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first project'}
                </p>
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4" />
                  Create Project
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}