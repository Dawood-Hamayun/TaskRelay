// frontend/src/hooks/useMeetings.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/api';
import { Meeting, CreateMeetingDto, UpdateMeetingDto, AttendeeStatus } from '@/types/meeting';
import { useAuth } from './useAuth';

export const useMeetings = (projectId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get user meetings
  const { 
    data: userMeetings = [], 
    isLoading: isLoadingUser,
    error: userError 
  } = useQuery<Meeting[]>({
    queryKey: ['meetings', 'user', user?.userId],
    queryFn: async () => {
      const res = await API.get('/meetings/user');
      return res.data;
    },
    enabled: !!user?.userId,
  });

  // Get project meetings
  const { 
    data: projectMeetings = [], 
    isLoading: isLoadingProject,
    error: projectError 
  } = useQuery<Meeting[]>({
    queryKey: ['meetings', 'project', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await API.get(`/meetings/project/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
  });

  // Get meetings by date range
  const getMeetingsByDateRange = (startDate: string, endDate: string, isProject = false) => {
    const baseUrl = isProject ? `/meetings/project/${projectId}` : '/meetings/user';
    return useQuery<Meeting[]>({
      queryKey: ['meetings', isProject ? 'project' : 'user', projectId || user?.userId, startDate, endDate],
      queryFn: async () => {
        const params = new URLSearchParams();
        params.append('startDate', startDate);
        params.append('endDate', endDate);
        const res = await API.get(`${baseUrl}?${params.toString()}`);
        return res.data;
      },
      enabled: isProject ? !!projectId : !!user?.userId,
    });
  };

  // Create meeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: CreateMeetingDto }) => {
      const res = await API.post(`/meetings/${projectId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: (error) => {
      console.error('Failed to create meeting:', error);
    },
  });

  // Update meeting mutation
  const updateMeetingMutation = useMutation({
    mutationFn: async ({ meetingId, data }: { meetingId: string; data: UpdateMeetingDto }) => {
      const res = await API.put(`/meetings/${meetingId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: (error) => {
      console.error('Failed to update meeting:', error);
    },
  });

  // Delete meeting mutation
  const deleteMeetingMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      await API.delete(`/meetings/${meetingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: (error) => {
      console.error('Failed to delete meeting:', error);
    },
  });

  // Respond to meeting mutation
  const respondToMeetingMutation = useMutation({
    mutationFn: async ({ meetingId, status }: { meetingId: string; status: AttendeeStatus }) => {
      await API.put(`/meetings/${meetingId}/response`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: (error) => {
      console.error('Failed to respond to meeting:', error);
    },
  });

  // Helper functions
  const getTodaysMeetings = () => {
    const today = new Date().toISOString().split('T')[0];
    return userMeetings.filter(meeting => 
      meeting.datetime.startsWith(today)
    );
  };

  const getUpcomingMeetings = (days = 7) => {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);

    return userMeetings.filter(meeting => {
      const meetingDate = new Date(meeting.datetime);
      return meetingDate >= now && meetingDate <= future;
    });
  };

  const getMeetingsByWeek = (weekStart: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return userMeetings.filter(meeting => {
      const meetingDate = new Date(meeting.datetime);
      return meetingDate >= weekStart && meetingDate <= weekEnd;
    });
  };

  const getMeetingsByDay = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return userMeetings.filter(meeting => {
      const meetingDate = new Date(meeting.datetime);
      return meetingDate >= dayStart && meetingDate <= dayEnd;
    });
  };

  const getUserAttendanceStatus = (meeting: Meeting) => {
    const userAttendee = meeting.attendees.find(
      attendee => attendee.user.id === user?.userId
    );
    return userAttendee?.status || null;
  };

  return {
    // Data
    userMeetings,
    projectMeetings,
    
    // Loading states
    isLoadingUser,
    isLoadingProject,
    isLoading: isLoadingUser || isLoadingProject,
    
    // Errors
    userError,
    projectError,
    error: userError || projectError,
    
    // Mutations
    createMeeting: createMeetingMutation.mutateAsync,
    updateMeeting: updateMeetingMutation.mutateAsync,
    deleteMeeting: deleteMeetingMutation.mutateAsync,
    respondToMeeting: respondToMeetingMutation.mutateAsync,
    
    // Loading states for mutations
    isCreating: createMeetingMutation.isPending,
    isUpdating: updateMeetingMutation.isPending,
    isDeleting: deleteMeetingMutation.isPending,
    isResponding: respondToMeetingMutation.isPending,
    
    // Helper functions
    getMeetingsByDateRange,
    getTodaysMeetings,
    getUpcomingMeetings,
    getMeetingsByWeek,
    getMeetingsByDay,
    getUserAttendanceStatus,
  };
};