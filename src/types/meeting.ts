// frontend/src/types/meeting.ts - Complete Meeting Types
export type AttendeeStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;     // ← optional
  color?: string;      // ← optional
}

export interface MeetingAttendee {
  id: string;
  status: AttendeeStatus;
  user: User;
}

export interface MeetingProject {
  id: string;
  name: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  datetime: string;
  duration: number; // in minutes
  location?: string;
  meetingUrl?: string;
  creator: User;
  project?: MeetingProject;
  attendees: MeetingAttendee[];
  createdAt: string;
}

export interface CreateMeetingDto {
  title: string;
  description?: string;
  datetime: string;
  duration?: number;
  location?: string;
  meetingUrl?: string;
  attendeeIds?: string[];
}

export interface UpdateMeetingDto {
  title?: string;
  description?: string;
  datetime?: string;
  duration?: number;
  location?: string;
  meetingUrl?: string;
}

export interface MeetingResponse {
  status: AttendeeStatus;
}

export interface MeetingFilters {
  projectId?: string;
  startDate?: string;
  endDate?: string;
  status?: 'upcoming' | 'past' | 'all';
}

// Calendar specific types
export interface CalendarDay {
  date: Date;
  meetings: Meeting[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export interface MeetingStats {
  total: number;
  today: number;
  upcoming: number;
  past: number;
  thisWeek: number;
  thisMonth: number;
}

// Meeting creation context
export interface MeetingContext {
  projectId?: string;
  defaultDate?: Date;
  preselectedAttendees?: string[];
}