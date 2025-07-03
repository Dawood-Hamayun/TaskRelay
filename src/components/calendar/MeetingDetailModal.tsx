// frontend/src/components/calendar/MeetingDetailModal.tsx
'use client';

import React from 'react';
import { X, Calendar, Clock, Users, Edit, Trash2, ExternalLink, Video, Play, User, MapPin } from 'lucide-react';
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
  const isStartingSoon = !isPast && new Date(meeting.datetime).getTime() - new Date().getTime() < 15 * 60 * 1000;

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

  const joinMeeting = () => {
    if (meeting.meetingUrl) {
      window.open(meeting.meetingUrl, '_blank');
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isPast ? 'bg-muted' : isStartingSoon ? 'bg-primary/20' : 'bg-primary/10'
              }`}>
                {meeting.meetingUrl ? (
                  <Video className={`w-6 h-6 ${isPast ? 'text-muted-foreground' : 'text-primary'}`} />
                ) : (
                  <Calendar className={`w-6 h-6 ${isPast ? 'text-muted-foreground' : 'text-primary'}`} />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground mb-1">{meeting.title}</h2>
                {meeting.project && (
                  <p className="text-sm text-muted-foreground">{meeting.project.name}</p>
                )}
                {isStartingSoon && (
                  <div className="bg-primary/20 text-primary px-2 py-1 rounded-lg text-xs font-medium mt-2 inline-block">
                    Starting Soon
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {meeting.meetingUrl && !isPast && (
                <button
                  onClick={joinMeeting}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    isStartingSoon
                      ? 'bg-primary text-primary-foreground shadow-lg hover:shadow-xl'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {isStartingSoon ? <Play className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  Join Meeting
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
              
              {(isCreator || !isPast) && (
                <div className="flex items-center gap-1">
                  {isCreator && (
                    <>
                      <button
                        onClick={() => onEdit?.(meeting)}
                        className="w-10 h-10 rounded-xl hover:bg-accent flex items-center justify-center transition-colors"
                        title="Edit meeting"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-10 h-10 rounded-xl hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
                        title="Delete meeting"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              )}
              
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl hover:bg-accent flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Meeting Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm font-medium text-card-foreground">
                    {formatDateTime(meeting.datetime)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isPast ? 'Meeting ended' : 'Scheduled'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm font-medium text-card-foreground">
                    {meeting.duration} minutes
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Duration
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm font-medium text-card-foreground">
                    {meeting.attendees.length} attendees
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {meeting.attendees.filter(a => a.status === 'ACCEPTED').length} confirmed
                  </div>
                </div>
              </div>
              
              {meeting.location && (
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm font-medium text-card-foreground">
                      {meeting.location}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Location
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Meeting Link */}
          {meeting.meetingUrl && (
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium text-card-foreground">Virtual Meeting</div>
                    <div className="text-sm text-muted-foreground">Click to join the meeting</div>
                  </div>
                </div>
                <button
                  onClick={joinMeeting}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Join
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          {meeting.description && (
            <div className="bg-muted/30 rounded-xl p-4">
              <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Description
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {meeting.description}
              </p>
            </div>
          )}

          {/* Attendees */}
          <div className="bg-muted/30 rounded-xl p-4">
            <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Attendees ({meeting.attendees.length})
            </h3>
            
            <div className="space-y-3">
              {meeting.attendees.map(attendee => (
                <div key={attendee.id} className="flex items-center justify-between p-3 bg-background/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${attendee.user.color} flex items-center justify-center text-white font-semibold`}>
                      {attendee.user.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-card-foreground">
                        {attendee.user.name || attendee.user.email}
                        {attendee.user.id === meeting.creator.id && (
                          <span className="text-xs text-muted-foreground ml-2 bg-primary/10 text-primary px-2 py-1 rounded-full">
                            Organizer
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {attendee.user.email}
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(attendee.status)}`}>
                    {attendee.status.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Meeting Creator */}
          <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Organized by</div>
                <div className="font-medium text-card-foreground">
                  {meeting.creator.name || meeting.creator.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Response Actions */}
        {!isCreator && !isPast && userStatus && (
          <div className="p-6 border-t border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Your response: <span className={`font-medium px-2 py-1 rounded-lg ${getStatusColor(userStatus)}`}>
                  {userStatus.toLowerCase()}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRespond('ACCEPTED')}
                  className={`px-4 py-2 text-sm rounded-xl transition-all ${
                    userStatus === 'ACCEPTED'
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/40'
                  }`}
                >
                  ✓ Accept
                </button>
                <button
                  onClick={() => handleRespond('TENTATIVE')}
                  className={`px-4 py-2 text-sm rounded-xl transition-all ${
                    userStatus === 'TENTATIVE'
                      ? 'bg-amber-600 text-white shadow-lg'
                      : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/40'
                  }`}
                >
                  ? Maybe
                </button>
                <button
                  onClick={() => handleRespond('DECLINED')}
                  className={`px-4 py-2 text-sm rounded-xl transition-all ${
                    userStatus === 'DECLINED'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40'
                  }`}
                >
                  ✗ Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}