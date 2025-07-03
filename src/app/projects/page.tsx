// frontend/src/app/projects/page.tsx - Updated with Project Modal
'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ProjectCard } from '@/components/project/ProjectCard';
import { CreateProjectModal } from '@/components/project/CreateProjectModal';
import { ProjectGuardWrapper } from '@/components/project/ProjectGuardWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Filter, 
  FolderOpen,
  Loader2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useProjects } from '@/hooks/useProjects';

function ProjectsContent() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  
  const { projects, isLoading } = useProjects();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  
  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || project.status === filter;
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-64"
              />
            </div>
            
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Filter className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => setIsCreateProjectModalOpen(true)}
              className="gap-2 h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </Header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Page Header */}
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Projects</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {isLoading ? 'Loading...' : `${filteredProjects.length} projects`}
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Loading projects...</p>
                </div>
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchQuery ? 'No projects found' : 'No projects yet'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first project'}
                </p>
                <Button 
                  onClick={() => setIsCreateProjectModalOpen(true)}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Create Project
                </Button>
              </div>
            )}
          </div>
        </main>

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={isCreateProjectModalOpen}
          onClose={() => setIsCreateProjectModalOpen(false)}
          onSuccess={() => {
            setIsCreateProjectModalOpen(false);
          }}
        />
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <ProjectGuardWrapper requireProject={false}>
      <ProjectsContent />
    </ProjectGuardWrapper>
  );
}