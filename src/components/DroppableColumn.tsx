// app/components/DroppableColumn
'use client';

import { useDroppable } from '@dnd-kit/core';
import DraggableTask from './DraggableTask';

export default function DroppableColumn({ id, title, tasks, onDelete }: any) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className={`w-1/3 bg-muted rounded-lg p-4 border border-border shadow-sm ${isOver ? 'ring-2 ring-primary' : ''}`}>
      <h2 className="font-bold text-lg mb-4">{title}</h2>

      {tasks.map((task: any) => (
        <DraggableTask key={task.id} task={task} onDelete={onDelete} />
      ))}
    </div>
  );
}