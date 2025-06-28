// frontend/src/components/dashboard/TodaysMeetingsCard.tsx
'use client';

import React from 'react';
import { Clock, MapPin, Users, Video, ExternalLink } from 'lucide-react';
import { useMeetings } from '@/hooks/useMeetings';
import { formatTime } from '@/utils/dateUtils';

export default function TodaysMeetingsCard() {
  const { getTodaysMeetings, isLoading } = useMeetings();
  const todaysMeetings = getTodaysMeetings();

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-card-foreground">Today's Schedule</h3>
        </div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (todaysMeetings.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-card-foreground">Today's Schedule</h3>
        </div>
        <div className="text-center py-6">
          <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No meetings today</p>
          <p className="text-xs text-muted-foreground mt-1">Enjoy your free day!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-card-foreground">Today's Schedule</h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
          {todaysMeetings.length}
        </span>
      </div>

      <div className="space-y-4">
        {todaysMeetings.map(meeting => {
          const meetingTime = new Date(meeting.datetime);
          const now = new Date();
          const isHappening = meetingTime <= now && 
            new Date(meetingTime.getTime() + meeting.duration * 60000) > now;
          const isPast = new Date(meetingTime.getTime() + meeting.duration * 60000) <= now;

          return (
            <div
              key={meeting.id}
              className={`border rounded-lg p-4 transition-all ${
                isHappening
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : isPast
                  ? 'border-border bg-muted/30 opacity-60'
                  : 'border-border hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={`font-medium text-sm truncate ${
                      isHappening ? 'text-primary' : 'text-card-foreground'
                    }`}>
                      {meeting.title}
                    </h4>
                    {isHappening && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full animate-pulse">
                        Live
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(meeting.datetime)} ({meeting.duration}m)</span>
                    </div>
                    
                    {meeting.attendees.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{meeting.attendees.length}</span>
                      </div>
                    )}
                  </div>

                  {(meeting.location || meeting.meetingUrl) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {meeting.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{meeting.location}</span>
                        </div>
                      )}
                      
                      {meeting.meetingUrl && (
                        <a
                          href={meeting.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                        >
                          <Video className="w-3 h-3" />
                          <span>Join</span>
                          <ExternalLink className="w-2 h-2" />
                        </a>
                      )}
                    </div>
                  )}

                  {meeting.project && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {meeting.project.name}
                    </div>
                  )}
                </div>

                {/* Meeting attendees avatars */}
                <div className="flex -space-x-1 ml-3">
                  {meeting.attendees.slice(0, 3).map(attendee => (
                    <div
                      key={attendee.id}
                      className={`w-6 h-6 rounded-full ${attendee.user.color} border border-background flex items-center justify-center text-white text-xs font-semibold`}
                      title={attendee.user.name || attendee.user.email}
                    >
                      {attendee.user.avatar}
                    </div>
                  ))}
                  {meeting.attendees.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-muted border border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                      +{meeting.attendees.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}