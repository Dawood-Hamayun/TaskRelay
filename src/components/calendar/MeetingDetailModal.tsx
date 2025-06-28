// frontend/src/components/calendar/MeetingDetailModal.tsx
'use client';

import React from 'react';
import { X, Calendar, Clock, MapPin, Link2, Users, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Meeting } from '@/types/meeting';
import { formatDateTime } from '@/utils/dateUtils';
import { useMeetings } from '@/hooks/useMeetings';
import { useAuth } from '@/hooks/useAuth';

interface MeetingDetailModalProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (meeting: Meeting) => void;
}

export default function MeetingDetailModal({ 
  meeting, 
  isOpen, 
  onClose, 
  onEdit 
}: MeetingDetailModalProps) {
  const { deleteMeeting, respondToMeeting, getUserAttendanceStatus } = useMeetings();
  const { user } = useAuth();

  if (!meeting || !isOpen) return null;

  const userStatus = getUserAttendanceStatus(meeting);
  const isCreator = meeting.creator.id === user?.userId;
  const isPast = new Date(meeting.datetime) < new Date();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      try {
        await deleteMeeting(meeting.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete meeting:', error);
      }
    }
  };

  const handleRespond = async (status: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE') => {
    try {
      await respondToMeeting({ meetingId: meeting.id, status });
    } catch (error) {
      console.error('Failed to respond to meeting:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20';
      case 'DECLINED': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'TENTATIVE': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/20';
      default: return 'text-zinc-600 bg-zinc-100 dark:bg-zinc-900/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">{meeting.title}</h2>
                {meeting.project && (
                  <p className="text-sm text-muted-foreground">{meeting.project.name}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {(isCreator || !isPast) && (
                <>
                  {isCreator && (
                    <>
                      <button
                        onClick={() => onEdit?.(meeting)}
                        className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
                        title="Edit meeting"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-8 h-8 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
                        title="Delete meeting"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </>
              )}
              
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Meeting Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-card-foreground">
                  {formatDateTime(meeting.datetime)}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-card-foreground">
                  {meeting.duration} minutes
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              {meeting.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-card-foreground">{meeting.location}</span>
                </div>
              )}
              
              {meeting.meetingUrl && (
                <div className="flex items-center gap-3">
                  <Link2 className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={meeting.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                  >
                    Join Meeting
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {meeting.description && (
            <div>
              <h3 className="font-medium text-card-foreground mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {meeting.description}
              </p>
            </div>
          )}

          {/* Attendees */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium text-card-foreground">
                Attendees ({meeting.attendees.length})
              </h3>
            </div>
            
            <div className="space-y-2">
              {meeting.attendees.map(attendee => (
                <div key={attendee.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${attendee.user.color} flex items-center justify-center text-white text-xs font-semibold`}>
                      {attendee.user.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-card-foreground">
                        {attendee.user.name || attendee.user.email}
                        {attendee.user.id === meeting.creator.id && (
                          <span className="text-xs text-muted-foreground ml-2">(Organizer)</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {attendee.user.email}
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attendee.status)}`}>
                    {attendee.status.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Meeting Creator */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Organized by</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {meeting.creator.name?.[0] || meeting.creator.email[0]}
              </div>
              <span className="text-sm font-medium text-card-foreground">
                {meeting.creator.name || meeting.creator.email}
              </span>
            </div>
          </div>
        </div>

        {/* Footer - Response Actions */}
        {!isCreator && !isPast && userStatus && (
          <div className="p-6 border-t border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Your response: <span className={`font-medium ${getStatusColor(userStatus).split(' ')[0]}`}>
                  {userStatus.toLowerCase()}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRespond('ACCEPTED')}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    userStatus === 'ACCEPTED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/40'
                  }`}
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRespond('TENTATIVE')}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    userStatus === 'TENTATIVE'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/40'
                  }`}
                >
                  Maybe
                </button>
                <button
                  onClick={() => handleRespond('DECLINED')}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    userStatus === 'DECLINED'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40'
                  }`}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

