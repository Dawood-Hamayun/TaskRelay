'use client';

import { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { ArrowRight, Moon, Sun } from 'lucide-react';

export default function CreateProjectPage() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { createProject } = useProjects();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      console.log('Creating project with name:', name);
      await createProject({ name: name.trim() });
      console.log('Project created successfully');
      router.push('/tasks');
    } catch (error: any) {
      console.error('Error creating project:', error);
      
      if (error.response?.data?.message) {
        setError(Array.isArray(error.response.data.message) 
          ? error.response.data.message.join(', ')
          : error.response.data.message
        );
      } else if (error.response?.status === 401) {
        setError('You need to be logged in to create a project');
      } else {
        setError('Failed to create project. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          <Image
            src="/taskrelay.svg"
            alt="TaskRelay"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-xl font-semibold text-foreground">TaskRelay</span>
        </div>

        <Card className="border border-border shadow-sm bg-card relative">
          {/* Theme Toggle - inside card top-right */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-card-foreground">Create your first project</h1>
                <p className="text-muted-foreground">What would you like to work on?</p>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}

                <Input
                  placeholder="Enter project name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="h-12 text-center text-lg bg-input border-border focus:border-ring focus:ring-1 focus:ring-ring transition-all duration-200"
                  autoFocus
                />

                <Button
                  onClick={handleCreate}
                  disabled={loading || !name.trim()}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create project
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </span>
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Press Enter to create your project
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}