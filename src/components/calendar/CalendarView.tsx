// frontend/src/components/calendar/CalendarView.tsx
'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import { useMeetings } from '@/hooks/useMeetings';
import { getCalendarDays, formatTime, isToday, isSameDay } from '@/utils/dateUtils';
import { Meeting } from '@/types/meeting';
import CreateMeetingModal from './CreateMeetingModal';

interface CalendarViewProps {
  projectId?: string;
}

export default function CalendarView({ projectId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
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
    );
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
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsCreateModalOpen(true);
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
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateMonth('prev')}
              className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Meeting
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Day Names Header */}
        <div className="grid grid-cols-7 border-b border-border">
          {dayNames.map(day => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-muted-foreground bg-muted/50"
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
                className={`min-h-[120px] p-2 border-r border-b border-border cursor-pointer hover:bg-accent/50 transition-colors ${
                  !isCurrentMonth_ ? 'bg-muted/30 text-muted-foreground' : 'bg-card'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-medium ${
                      isToday_
                        ? 'w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center'
                        : isCurrentMonth_
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {dayMeetings.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {dayMeetings.length}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayMeetings.slice(0, 3).map(meeting => (
                    <div
                      key={meeting.id}
                      className="text-xs p-1 bg-primary/10 text-primary rounded border-l-2 border-primary"
                    >
                      <div className="font-medium truncate">{meeting.title}</div>
                      <div className="text-primary/70">{formatTime(meeting.datetime)}</div>
                    </div>
                  ))}
                  {dayMeetings.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayMeetings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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