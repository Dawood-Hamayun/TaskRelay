// app/components/DraggableTask
'use client';

import { useDraggable } from '@dnd-kit/core';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EditTaskModal from '@/components/EditTaskModal';
import StopDragWrapper from './StopDragWrapper';
import { format } from 'date-fns';

export default function DraggableTask({ task, onDelete }: { task: any, onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(task.id);
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card className="mb-4">
        <CardHeader className="flex flex-col gap-2">
          <div className="font-semibold">{task.title}</div>
          {task.description && <div className="text-sm text-muted-foreground">{task.description}</div>}
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Priority: {task.priority}</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Status: {task.status}</span>
            {task.dueDate && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
              </span>
            )}
          </div>

          <div className="flex gap-2 mt-4 justify-end">
            <StopDragWrapper>
              <div className="flex gap-2">
                <EditTaskModal task={task} />
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </StopDragWrapper>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}