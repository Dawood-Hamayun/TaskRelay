// components/CreateSubtasksModal.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, User, X, Loader2
} from 'lucide-react';
import { Task } from '@/types/task';

// Hardcoded members for now
const HARDCODED_MEMBERS = [
  { id: 'member-1', user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' } },
  { id: 'member-2', user: { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' } },
  { id: 'member-3', user: { id: 'user-3', name: 'Mike Wilson', email: 'mike@example.com' } },
  { id: 'member-4', user: { id: 'user-4', name: 'Sarah Davis', email: 'sarah@example.com' } },
];

interface CreateSubtasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subtasks: Array<{ title: string; assigneeId?: string }>) => Promise<void>;
  parentTask: Task | null;
}

export function CreateSubtasksModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  parentTask 
}: CreateSubtasksModalProps) {
  const [subtasks, setSubtasks] = useState<Array<{ 
    id: string; 
    title: string; 
    assigneeId?: string 
  }>>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('unassigned');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks(prev => [...prev, {
        id: Date.now().toString(),
        title: newSubtask.trim(),
        assigneeId: selectedAssignee !== 'unassigned' ? selectedAssignee : undefined
      }]);
      setNewSubtask('');
      setSelectedAssignee('unassigned');
    }
  };

  const removeSubtask = (subtaskId: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== subtaskId));
  };

  const handleSubmit = async () => {
    if (subtasks.length > 0) {
      try {
        setIsLoading(true);
        await onSubmit(subtasks.map(st => ({
          title: st.title,
          assigneeId: st.assigneeId
        })));
        handleClose();
      } catch (error) {
        console.error('Failed to create subtasks:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    setSubtasks([]);
    setNewSubtask('');
    setSelectedAssignee('unassigned');
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  const getAssigneeInfo = (assigneeId?: string) => {
    if (!assigneeId) return null;
    return HARDCODED_MEMBERS.find(m => m.id === assigneeId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-3 text-card-foreground">
            <div className="w-2 h-2 bg-primary rounded-full" />
            Add Subtasks to "{parentTask?.title}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Subtask Form */}
          <div className="flex items-center gap-3">
            <Input
              placeholder="What needs to be done?"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              autoFocus
              disabled={isLoading}
            />
            
            <Select 
              value={selectedAssignee} 
              onValueChange={setSelectedAssignee}
              disabled={isLoading}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Assign to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-dashed border-muted-foreground flex items-center justify-center">
                      <User className="w-2 h-2 text-muted-foreground" />
                    </div>
                    <span className="text-sm">Unassigned</span>
                  </div>
                </SelectItem>
                {HARDCODED_MEMBERS.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-zinc-600 flex items-center justify-center text-white text-xs font-medium">
                        {member.user?.name?.charAt(0) || member.user?.email?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm">{member.user?.name || member.user?.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleAddSubtask}
              disabled={!newSubtask.trim() || isLoading}
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Added Subtasks List */}
          {subtasks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">
                Subtasks to create ({subtasks.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {subtasks.map((subtask) => {
                  const assignee = getAssigneeInfo(subtask.assigneeId);
                  
                  return (
                    <div key={subtask.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group">
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                      <span className="flex-1 text-sm font-medium">
                        {subtask.title}
                      </span>
                      
                      {assignee && (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-zinc-600 flex items-center justify-center text-white text-xs font-medium">
                            {assignee.user?.name?.charAt(0) || assignee.user?.email?.charAt(0) || '?'}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {assignee.user?.name || assignee.user?.email}
                          </span>
                        </div>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSubtask(subtask.id)}
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity"
                        disabled={isLoading}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {subtasks.length === 0 
                ? 'Add some subtasks to break down this task' 
                : `Ready to create ${subtasks.length} subtask${subtasks.length !== 1 ? 's' : ''}`
              }
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={subtasks.length === 0 || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>Create {subtasks.length} Subtask{subtasks.length !== 1 ? 's' : ''}</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}