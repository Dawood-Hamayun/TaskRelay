// frontend/src/components/CreateProjectModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Plus, FolderPlus } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createProject } = useProjects();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: ''
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        setIsSubmitting(true);
        
        await createProject({ 
          name: formData.name.trim(), 
          description: formData.description.trim() || undefined
        });
        
        handleClose();
        onSuccess?.();
      } catch (error: any) {
        console.error('Error creating project:', error);
        
        if (error.response?.data?.message) {
          setErrors({
            submit: Array.isArray(error.response.data.message) 
              ? error.response.data.message.join(', ')
              : error.response.data.message
          });
        } else if (error.response?.status === 401) {
          setErrors({ submit: 'You need to be logged in to create a project' });
        } else {
          setErrors({ submit: 'Failed to create project. Please try again.' });
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        description: ''
      });
      setErrors({});
      setIsSubmitting(false);
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden p-0 bg-card border-border">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-xl font-semibold flex items-center gap-3 text-card-foreground">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FolderPlus className="w-6 h-6 text-primary" />
            </div>
            Create New Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-100px)]">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* Project Name */}
              <div className="space-y-2">
                <label htmlFor="project-name" className="text-sm font-medium text-card-foreground">
                  Project Name
                </label>
                <Input
                  id="project-name"
                  placeholder="Enter your project name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`text-lg h-12 font-medium ${
                    errors.name ? 'border-destructive' : ''
                  }`}
                  onKeyDown={handleKeyPress}
                  autoFocus
                  disabled={isSubmitting}
                  maxLength={100}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="project-description" className="text-sm font-medium text-card-foreground">
                  Description (Optional)
                </label>
                <Textarea
                  id="project-description"
                  placeholder="Describe your project's goals and objectives..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="resize-none"
                  disabled={isSubmitting}
                  maxLength={500}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Help your team understand what this project is about</span>
                  <span>{formData.description.length}/500</span>
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{errors.submit}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              Press 
              <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">⌘</kbd> 
              + 
              <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">Enter</kbd> 
              to create
            </div>
            <div className="flex items-center gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose} 
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={!formData.name.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}