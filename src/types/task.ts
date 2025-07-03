// frontend/src/types/task.ts
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BACKLOG';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;     // ← optional
  color?: string;      // ← optional
}

export interface Member {
  id: string;
  user: User;
  role?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  projectId: string;
}

export interface TaskTag {
  id: string;
  taskId: string;
  tagId: string;
  tag: Tag;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: User;
  taskId: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: User;
  taskId: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  taskId: string;
  assigneeId?: string;
  assignee?: Member;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  assigneeId?: string;
  assignee?: Member;
  project: Project;
  tags: TaskTag[];
  comments: Comment[];
  attachments: Attachment[];
  subtasks: Subtask[];
}

// DTOs
export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  assigneeId?: string;
  tags?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  assigneeId?: string;
  tags?: string[];
}

export interface CreateSubtaskDto {
  title: string;
  assigneeId?: string;
  completed?: boolean;
}

export interface UpdateSubtaskDto {
  title?: string;
  assigneeId?: string;
  completed?: boolean;
}

export interface CreateCommentDto {
  content: string;
}

export interface CreateTagDto {
  name: string;
  color: string;
}