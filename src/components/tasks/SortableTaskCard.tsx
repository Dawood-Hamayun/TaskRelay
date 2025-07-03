
// frontend/src/components/tasks/SortableTaskCard.tsx
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import { Task } from '@/types/task';

interface SortableTaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onDuplicate?: (task: Task) => void;
}

export function SortableTaskCard({ 
  task, 
  onClick, 
  onEdit, 
  onDelete, 
  onDuplicate 
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <TaskCard
        task={task}
        onClick={onClick}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        className={isDragging ? 'ring-2 ring-primary ring-offset-2' : ''}
      />
    </div>
  );
}