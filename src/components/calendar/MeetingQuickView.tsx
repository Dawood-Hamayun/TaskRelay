// frontend/src/components/calendar/MeetingQuickView.tsx
'use client';

import React from 'react';
import { Calendar, Clock, Users, Video, ExternalLink, User } from 'lucide-react';
import { Meeting } from '@/types/meeting';
import { formatDateTime } from '@/utils/dateUtils';

interface MeetingQuickViewProps {
  meeting: Meeting;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function MeetingQuickView({ meeting, position, onClose }: MeetingQuickViewProps) {
  const joinMeeting = () => {
    if (meeting.meetingUrl) {
      window.open(meeting.meetingUrl, '_blank');
    }
  };

  return (
    <>
      {/* Overlay to close on click */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Quick View Card */}
      <div
        className="fixed z-50 w-80 bg-card border border-border rounded-xl shadow-2xl p-4"
        style={{
          left: Math.min(position.x - 160, window.innerWidth - 320 - 20),
          top: Math.max(position.y - 20, 20),
          transform: position.y < 200 ? 'translateY(0)' : 'translateY(-100%)'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-card-foreground truncate mb-1">
              {meeting.title}
            </h3>
            {meeting.project && (
              <div className="text-xs text-muted-foreground">
                {meeting.project.name}
              </div>
            )}
          </div>
          {meeting.meetingUrl && (
            <button
              onClick={joinMeeting}
              className="ml-2 flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-xs font-medium"
            >
              <Video className="w-3 h-3" />
              Join
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Meeting Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDateTime(meeting.datetime)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{meeting.duration} minutes</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{meeting.attendees.length} attendees</span>
          </div>

          {/* Attendees Preview */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {meeting.attendees.slice(0, 4).map(attendee => (
                <div
                  key={attendee.id}
                  className={`w-6 h-6 rounded-full ${attendee.user.color} border-2 border-background flex items-center justify-center text-white text-xs font-semibold`}
                  title={attendee.user.name || attendee.user.email}
                >
                  {attendee.user.avatar}
                </div>
              ))}
              {meeting.attendees.length > 4 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                  +{meeting.attendees.length - 4}
                </div>
              )}
            </div>
          </div>

          {/* Description Preview */}
          {meeting.description && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {meeting.description}
              </p>
            </div>
          )}

          {/* Organizer */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Organized by {meeting.creator.name || meeting.creator.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}