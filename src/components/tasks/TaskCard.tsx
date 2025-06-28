// 5. frontend/src/components/tasks/TaskCard.tsx - Updated with tag display
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Task } from '@/types/task';
import { UserAvatar } from '@/components/common/UserAvatar';
import { 
  MoreHorizontal, 
  Clock, 
  MessageSquare, 
  Paperclip,
  Tag as TagIcon
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  className?: string;
}

const priorityConfig = {
  LOW: { dot: 'bg-zinc-400 dark:bg-zinc-500' },
  MEDIUM: { dot: 'bg-amber-500 dark:bg-amber-600' },
  HIGH: { dot: 'bg-orange-500 dark:bg-orange-600' },
  CRITICAL: { dot: 'bg-red-500 dark:bg-red-600' }
};

const getTagClasses = (color: string, isDark: boolean) => {
  const tagColors = {
    blue: {
      light: 'bg-blue-600 text-white border-blue-600',
      dark: 'bg-blue-500 text-white border-blue-500'
    },
    purple: {
      light: 'bg-purple-600 text-white border-purple-600',
      dark: 'bg-purple-500 text-white border-purple-500'
    },
    emerald: {
      light: 'bg-emerald-600 text-white border-emerald-600',
      dark: 'bg-emerald-500 text-white border-emerald-500'
    },
    red: {
      light: 'bg-red-600 text-white border-red-600',
      dark: 'bg-red-500 text-white border-red-500'
    },
    amber: {
      light: 'bg-amber-600 text-white border-amber-600',
      dark: 'bg-amber-500 text-white border-amber-500'
    },
    orange: {
      light: 'bg-orange-600 text-white border-orange-600',
      dark: 'bg-orange-500 text-white border-orange-500'
    }
  };

  const colorConfig = tagColors[color as keyof typeof tagColors];
  if (!colorConfig) return tagColors.blue.light;
  
  return isDark ? colorConfig.dark : colorConfig.light;
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

const isOverdue = (dueDate: string | null) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

export function TaskCard({ task, onClick, className = '' }: TaskCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const overdue = isOverdue(task.dueDate);
  const priorityInfo = priorityConfig[task.priority];

  // Calculate subtask progress
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = hasSubtasks ? task.subtasks.filter(st => st.completed).length : 0;
  const totalSubtasks = hasSubtasks ? task.subtasks.length : 0;
  const progressPercentage = hasSubtasks ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Get task tags - only show assigned tags
  const taskTags = task.tags || [];
  const displayTags = taskTags.slice(0, 3); // Show max 3 tags
  const remainingTagsCount = Math.max(0, taskTags.length - 3);

  return (
    <Card 
      className={`group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border shadow-sm ${isDark ? 'glass-card' : 'bg-white border-border'} ${className}`}
      onClick={() => onClick(task)}
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
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              // Handle task menu actions
            }}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>

        {/* Tags - Show assigned tags only */}
        {taskTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {displayTags.map(({ tag }) => (
              <span
                key={tag.id}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border transition-all duration-200 ${getTagClasses(tag.color, isDark)}`}
              >
                <TagIcon className="h-2.5 w-2.5 mr-1" />
                {tag.name}
              </span>
            ))}
            {remainingTagsCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                +{remainingTagsCount} more
              </span>
            )}
          </div>
        )}

        {/* Subtask Progress */}
        {hasSubtasks && (
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Subtasks {completedSubtasks}/{totalSubtasks}
              </span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {/* Due Date */}
            {task.dueDate && (
              <div className={`flex items-center gap-1 ${overdue ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                <Clock className="h-3 w-3" />
                <span className={overdue ? 'font-medium' : ''}>{formatDueDate(task.dueDate)}</span>
              </div>
            )}

            {/* Activity indicators */}
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{task.comments.length}</span>
              </div>
            )}
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                <span>{task.attachments.length}</span>
              </div>
            )}
          </div>

          {/* Assignee */}
          <UserAvatar 
            user={task.assignee?.user} 
            size="sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}