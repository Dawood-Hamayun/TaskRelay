// frontend/src/components/dashboard/UpcomingMeetingsCard.tsx
'use client';

import React from 'react';
import { Calendar, Clock, Users, ArrowRight, Plus } from 'lucide-react';
import { useMeetings } from '@/hooks/useMeetings';
import { formatTime, formatDate } from '@/utils/dateUtils';
import Link from 'next/link';

export default function UpcomingMeetingsCard() {
  const { userMeetings, getUpcomingMeetings, isLoading } = useMeetings();
  const upcomingMeetings = getUpcomingMeetings(7); // Next 7 days

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-card-foreground">Upcoming Meetings</h3>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-card-foreground">Upcoming Meetings</h3>
        </div>
        <Link
          href="/calendar"
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {upcomingMeetings.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No upcoming meetings</p>
          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingMeetings.slice(0, 4).map(meeting => (
            <div
              key={meeting.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-card-foreground truncate group-hover:text-primary transition-colors">
                  {meeting.title}
                </h4>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(meeting.datetime)}</span>
                  </div>
                  <span>•</span>
                  <span>{formatDate(meeting.datetime)}</span>
                </div>
                
                {meeting.project && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {meeting.project.name}
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Users className="w-3 h-3" />
                  <span>{meeting.attendees.length} attendees</span>
                </div>
              </div>
              
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
            </div>
          ))}
          
          {upcomingMeetings.length > 4 && (
            <div className="text-center pt-2">
              <Link
                href="/calendar"
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                +{upcomingMeetings.length - 4} more meetings
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
