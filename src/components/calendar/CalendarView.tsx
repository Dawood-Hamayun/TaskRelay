// frontend/src/components/calendar/CalendarView.tsx
'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, Video, Users, Clock } from 'lucide-react';
import { useMeetings } from '@/hooks/useMeetings';
import { getCalendarDays, formatTime, isToday, isSameDay } from '@/utils/dateUtils';
import { Meeting } from '@/types/meeting';
import CreateMeetingModal from './CreateMeetingModal';
import MeetingDetailModal from './MeetingDetailModal';
import EditMeetingModal from './EditMeetingModal';

interface CalendarViewProps {
  projectId?: string;
}

export default function CalendarView({ projectId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  
  const { userMeetings, projectMeetings, isLoading } = useMeetings(projectId);
  
  const meetings = projectId ? projectMeetings : userMeetings;
  const calendarDays = getCalendarDays(currentDate);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getMeetingsForDay = (date: Date): Meeting[] => {
    return meetings.filter(meeting => 
      isSameDay(new Date(meeting.datetime), date)
    ).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const isViewingCurrentMonth = () => {
    const today = new Date();
    return currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsCreateModalOpen(true);
  };

  const handleMeetingClick = (meeting: Meeting, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedMeeting(meeting);
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              {monthNames[currentDate.getMonth()]}
            </h2>
            <span className="text-2xl font-light text-muted-foreground">
              {currentDate.getFullYear()}
            </span>
          </div>
          
          <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
            <button
              onClick={() => navigateMonth('prev')}
              className="w-9 h-9 rounded-lg hover:bg-background hover:shadow-sm flex items-center justify-center transition-all duration-200"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isViewingCurrentMonth()
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary hover:bg-background'
              }`}
              title="Go to current month"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="w-9 h-9 rounded-lg hover:bg-background hover:shadow-sm flex items-center justify-center transition-all duration-200"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4" />
          New Meeting
        </button>
      </div>

      {/* Enhanced Calendar Grid */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Day Names Header */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {dayNames.map(day => (
            <div
              key={day}
              className="p-4 text-center text-sm font-semibold text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            const dayMeetings = getMeetingsForDay(date);
            const isToday_ = isToday(date);
            const isCurrentMonth_ = isCurrentMonth(date);
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`min-h-[140px] p-3 border-r border-b border-border cursor-pointer hover:bg-accent/30 transition-all duration-200 ${
                  !isCurrentMonth_ ? 'bg-muted/20 text-muted-foreground' : 'bg-card hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-sm font-semibold transition-all duration-200 ${
                      isToday_
                        ? 'w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs'
                        : isCurrentMonth_
                        ? 'text-foreground hover:text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {dayMeetings.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {dayMeetings.length}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  {dayMeetings.slice(0, 4).map(meeting => (
                    <div
                      key={meeting.id}
                      onClick={(e) => handleMeetingClick(meeting, e)}
                      className="group text-xs p-2 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 text-primary rounded-lg border border-primary/20 hover:border-primary/30 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {meeting.meetingUrl && (
                          <Video className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                        )}
                        <div className="font-semibold truncate flex-1">{meeting.title}</div>
                      </div>
                      <div className="flex items-center justify-between text-primary/70 group-hover:text-primary/90">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(meeting.datetime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {meeting.attendees.length}
                        </span>
                      </div>
                    </div>
                  ))}
                  {dayMeetings.length > 4 && (
                    <div className="text-xs text-muted-foreground font-medium text-center py-1 bg-muted/50 rounded-md">
                      +{dayMeetings.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meeting Detail Modal */}
      <MeetingDetailModal
        meeting={selectedMeeting}
        isOpen={!!selectedMeeting}
        onClose={() => setSelectedMeeting(null)}
        onEdit={setEditingMeeting}
      />

      <EditMeetingModal
        meeting={editingMeeting}
        isOpen={!!editingMeeting}
        onClose={() => setEditingMeeting(null)}
      />

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedDate(null);
        }}
        projectId={projectId}
        defaultDate={selectedDate || undefined}
      />
    </div>
  );
}