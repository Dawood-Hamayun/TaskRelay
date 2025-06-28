// STEP 2: Fix UpcomingMeetings export
// frontend/src/components/calendar/UpcomingMeetings.tsx

'use client';

import React from 'react';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { Meeting } from '@/types/meeting';
import { formatTime, formatDate } from '@/utils/dateUtils';

interface UpcomingMeetingsProps {
  meetings: Meeting[];
}

// ✅ CHANGE THIS: Use default export directly
export default function UpcomingMeetings({ meetings }: UpcomingMeetingsProps) {
  if (meetings.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-card-foreground mb-3">Upcoming Meetings</h3>
        <div className="text-center py-6">
          <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No upcoming meetings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-card-foreground">Upcoming Meetings</h3>
        <span className="text-xs text-muted-foreground">{meetings.length}</span>
      </div>
      
      <div className="space-y-3">
        {meetings.slice(0, 5).map(meeting => (
          <div key={meeting.id} className="group">
            <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-card-foreground truncate group-hover:text-primary transition-colors">
                  {meeting.title}
                </h4>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(meeting.datetime)}</span>
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
              
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          </div>
        ))}
        
        {meetings.length > 5 && (
          <div className="text-center pt-2">
            <button className="text-xs text-primary hover:text-primary/80 transition-colors">
              View all {meetings.length} meetings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ❌ REMOVE THIS LINE - Don't export after defining the function
// export default UpcomingMeetings;