// frontend/src/components/tasks/DroppableColumn.tsx
'use client';

import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface DroppableColumnProps {
  id: string;
  title: string;
  accent: string;
  accentColor: string;
  taskCount: number;
  children: ReactNode;
  className?: string;
}

export function DroppableColumn({
  id,
  title,
  accent,
  accentColor,
  taskCount,
  children,
  className = ''
}: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`${className} ${isOver ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${accentColor}`} />
          <h3 className="font-semibold text-sm text-foreground">
            {title}
          </h3>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${accent} text-muted-foreground`}>
          {taskCount}
        </span>
      </div>
      
      {/* Column Content */}
      <div className={`min-h-[200px] rounded-lg transition-colors ${
        isOver ? 'bg-primary/5 border-2 border-dashed border-primary' : ''
      }`}>
        {children}
      </div>
    </div>
  );
}