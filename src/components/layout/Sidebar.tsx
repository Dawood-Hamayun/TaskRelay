// frontend/src/components/layout/Sidebar.tsx - Final Updated Version
'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { CreateProjectModal } from '@/components/project/CreateProjectModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FolderOpen, 
  Calendar, 
  Settings, 
  LogOut,
  ChevronDown,
  User,
  CheckCircle2,
  Plus,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: FolderOpen, label: 'Projects', href: '/projects' },
  { icon: CheckCircle2, label: 'Tasks', href: '/tasks' },
  { icon: Calendar, label: 'Calendar', href: '/calendar' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { projects, isLoading: projectsLoading } = useProjects();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProjectClick = (projectId: string) => {
    // Navigate to project overview page
    router.push(`/projects/${projectId}`);
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className={cn(
      "flex h-screen w-64 flex-col bg-card border-r border-border",
      className
    )}>
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-border">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
          <Image
            src="/taskrelay.svg"
            alt="TaskRelay"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </div>
        <div className="min-w-0 flex-1">
          <span className="font-semibold text-card-foreground block truncate">TaskRelay</span>
          <div className="text-xs text-muted-foreground truncate">Workspace</div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="px-4 py-4 border-b border-border">
        <Button
          variant="ghost"
          className="w-full justify-between h-auto p-3 text-left font-normal hover:bg-accent hover:text-accent-foreground min-w-0"
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              {user?.name ? (
                <span className="text-sm font-medium text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-sm font-medium text-card-foreground truncate w-full max-w-[140px]" title={user?.name || user?.email || 'User'}>
                {user?.name || user?.email || 'User'}
              </span>
              {user?.name && (
                <span className="text-xs text-muted-foreground truncate w-full max-w-[140px]" title={user?.email || ''}>
                  {user?.email || ''}
                </span>
              )}
            </div>
          </div>
          <ChevronDown className={cn(
            "w-4 h-4 text-muted-foreground transition-transform shrink-0 ml-2",
            isUserMenuOpen && "rotate-180"
          )} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link key={item.label} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-9 px-3 font-normal text-sm min-w-0",
                  "hover:bg-accent hover:text-accent-foreground",
                  active 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            </Link>
          );
        })}

        {/* Projects Section */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-3 px-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Projects
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-card-foreground"
              onClick={() => setIsCreateProjectModalOpen(true)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Projects List */}
          <div className="space-y-1">
            {projectsLoading ? (
              <div className="text-xs text-muted-foreground p-2">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground p-2">No projects yet</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-2"
                  onClick={() => setIsCreateProjectModalOpen(true)}
                >
                  <Plus className="h-3 w-3" />
                  Create Project
                </Button>
              </div>
            ) : (
              projects.slice(0, 5).map((project) => (
                <Button
                  key={project.id}
                  variant="ghost"
                  className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-card-foreground hover:bg-muted/50 group px-3"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <FolderOpen className="w-3 h-3 shrink-0" />
                  <span className="truncate flex-1 text-left">{project.name}</span>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Button>
              ))
            )}

            {projects.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-card-foreground px-3"
                onClick={() => router.push('/projects')}
              >
                View all {projects.length} projects
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-9 px-3 font-normal text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground min-w-0"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="truncate">Logout</span>
        </Button>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onSuccess={() => {
          setIsCreateProjectModalOpen(false);
        }}
      />
    </div>
  );
}