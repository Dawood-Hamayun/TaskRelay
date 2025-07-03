// frontend/src/components/calendar/UpcomingMeetings.tsx
'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Users, Video, ExternalLink, Play } from 'lucide-react';
import { Meeting } from '@/types/meeting';
import { formatTime, formatDate } from '@/utils/dateUtils';
import MeetingDetailModal from './MeetingDetailModal';

interface UpcomingMeetingsProps {
  meetings: Meeting[];
}

export default function UpcomingMeetings({ meetings }: UpcomingMeetingsProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const joinMeeting = (meetingUrl: string) => {
    window.open(meetingUrl, '_blank');
  };

  const isStartingSoon = (meeting: Meeting) => {
    const now = new Date();
    const meetingTime = new Date(meeting.datetime);
    const timeDiff = meetingTime.getTime() - now.getTime();
    return timeDiff > 0 && timeDiff < 15 * 60 * 1000; // 15 minutes
  };

  if (meetings.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          Upcoming Meetings
        </h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No upcoming meetings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-card-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          Upcoming Meetings
        </h3>
        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
          {meetings.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {meetings.slice(0, 3).map(meeting => {
          const startingSoon = isStartingSoon(meeting);
          
          return (
            <div 
              key={meeting.id} 
              className={`group p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                startingSoon 
                  ? 'bg-primary/10 border border-primary/20 hover:bg-primary/15' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedMeeting(meeting)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  startingSoon 
                    ? 'bg-primary/20 animate-pulse' 
                    : 'bg-primary/10 group-hover:bg-primary/20'
                } transition-all`}>
                  {meeting.meetingUrl ? (
                    <Video className={`w-5 h-5 ${startingSoon ? 'text-primary' : 'text-primary'}`} />
                  ) : (
                    <Calendar className="w-5 h-5 text-primary" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm text-card-foreground truncate group-hover:text-primary transition-colors">
                      {meeting.title}
                    </h4>
                    {startingSoon && (
                      <div className="bg-primary/20 text-primary px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ml-2">
                        Starting Soon
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(meeting.datetime)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{formatDate(meeting.datetime)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {meeting.project && (
                        <span className="bg-muted/50 px-2 py-1 rounded-lg">
                          {meeting.project.name}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{meeting.attendees.length}</span>
                      </div>
                    </div>
                    
                    {meeting.meetingUrl && (
                      <div className={`flex items-center gap-1 text-xs transition-all ${
                        startingSoon 
                          ? 'text-primary font-medium' 
                          : 'text-muted-foreground group-hover:text-primary'
                      }`}>
                        {startingSoon ? (
                          <Play className="w-3 h-3" />
                        ) : (
                          <ExternalLink className="w-3 h-3" />
                        )}
                        <span>{startingSoon ? 'Join Now' : 'Join'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {meetings.length > 3 && (
          <div className="text-center pt-3 border-t border-border">
            <button className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">
              View all {meetings.length} meetings
            </button>
          </div>
        )}
      </div>

      {/* Meeting Detail Modal */}
      <MeetingDetailModal
        meeting={selectedMeeting}
        isOpen={!!selectedMeeting}
        onClose={() => setSelectedMeeting(null)}
      />
    </div>
  );
}