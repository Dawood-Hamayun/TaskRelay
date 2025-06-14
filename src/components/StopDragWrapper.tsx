// app/components/StopDragWrapper
'use client';

export default function StopDragWrapper({ children }: { children: React.ReactNode }) {
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  return (
    <div onPointerDown={stop} onMouseDown={stop}>
      {children}
    </div>
  );
}