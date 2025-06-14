// types/task.ts
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BACKLOG';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Member {
  id: string;
  userId: string;
  user: User;
  projectId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  projectId: string;
}

export interface TaskTag {
  taskId: string;
  tagId: string;
  tag: Tag;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: User;
  taskId: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  url: string;
  fileName: string;
  taskId: string;
  createdAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  assigneeId?: string | null;
  assignee?: Member | null;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  project: {
    id: string;
    name: string;
  };
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  assigneeId?: string | null;
  assignee?: Member | null;
  subtasks: Subtask[];
  comments: Comment[];
  attachments: Attachment[];
  tags: TaskTag[];
  createdAt: string;
}

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
}

export interface CreateSubtaskDto {
  title: string;
  assigneeId?: string;
}

export interface UpdateSubtaskDto {
  title?: string;
  completed?: boolean;
  assigneeId?: string;
}