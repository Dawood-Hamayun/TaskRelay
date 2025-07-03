// frontend/src/components/calendar/MeetingListView.tsx
'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Users, Video, MoreVertical, Edit, Trash2, Eye, ExternalLink, Play, Filter } from 'lucide-react';
import { useMeetings } from '@/hooks/useMeetings';
import { formatDateTime, getRelativeTimeLabel } from '@/utils/dateUtils';
import { Meeting } from '@/types/meeting';
import MeetingDetailModal from './MeetingDetailModal';
import EditMeetingModal from './EditMeetingModal';

interface MeetingListViewProps {
  projectId?: string;
}

export default function MeetingListView({ projectId }: MeetingListViewProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const { userMeetings, projectMeetings, isLoading, deleteMeeting } = useMeetings(projectId);
  
  const meetings = projectId ? projectMeetings : userMeetings;
  
  const filteredMeetings = meetings.filter(meeting => {
    try {
      const meetingDate = new Date(meeting.datetime);
      const now = new Date();
      
      if (isNaN(meetingDate.getTime())) {
        console.warn('Invalid meeting date:', meeting.datetime);
        return false;
      }
      
      switch (timeFilter) {
        case 'upcoming':
          return meetingDate >= now;
        case 'past':
          return meetingDate < now;
        default:
          return true;
      }
    } catch (error) {
      console.error('Error filtering meeting:', error, meeting);
      return false;
    }
  }).sort((a, b) => {
    try {
      return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
    } catch (error) {
      console.error('Error sorting meetings:', error);
      return 0;
    }
  });

  const handleDeleteMeeting = async (meetingId: string) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      try {
        await deleteMeeting(meetingId);
        setOpenDropdown(null);
      } catch (error) {
        console.error('Failed to delete meeting:', error);
      }
    }
  };

  const joinMeeting = (meetingUrl: string) => {
    window.open(meetingUrl, '_blank');
  };

  const getAttendeeStatus = (meeting: Meeting) => {
    const acceptedCount = meeting.attendees.filter(a => a.status === 'ACCEPTED').length;
    const totalCount = meeting.attendees.length;
    return { acceptedCount, totalCount };
  };

  const isStartingSoon = (meeting: Meeting) => {
    const now = new Date();
    const meetingTime = new Date(meeting.datetime);
    const timeDiff = meetingTime.getTime() - now.getTime();
    return timeDiff > 0 && timeDiff < 15 * 60 * 1000; // 15 minutes
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Clean Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            {[
              { key: 'upcoming', label: 'Upcoming', count: meetings.filter(m => new Date(m.datetime) >= new Date()).length },
              { key: 'past', label: 'Past', count: meetings.filter(m => new Date(m.datetime) < new Date()).length },
              { key: 'all', label: 'All', count: meetings.length }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setTimeFilter(filter.key as any)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 flex items-center gap-2 ${
                  timeFilter === filter.key
                    ? 'bg-background shadow-sm text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                {filter.label}
                <span className="text-xs bg-muted-foreground/10 px-1.5 py-0.5 rounded">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clean Meeting List */}
      {filteredMeetings.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No meetings found</h3>
          <p className="text-muted-foreground">
            {timeFilter === 'upcoming' 
              ? 'No upcoming meetings scheduled' 
              : timeFilter === 'past'
              ? 'No past meetings found'
              : 'No meetings in this project'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMeetings.map(meeting => {
            const { acceptedCount, totalCount } = getAttendeeStatus(meeting);
            const isPast = new Date(meeting.datetime) < new Date();
            const startingSoon = isStartingSoon(meeting);
            
            return (
              <div
                key={meeting.id}
                className={`group bg-card border rounded-xl p-5 transition-all duration-200 hover:shadow-md ${
                  isPast 
                    ? 'border-border/50 opacity-60' 
                    : startingSoon 
                    ? 'border-primary/30 bg-primary/[0.02] ring-1 ring-primary/10' 
                    : 'border-border hover:border-primary/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Clean Time Display */}
                  <div className="flex flex-col items-center min-w-[90px]">
                    <div className={`w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center ${
                      isPast 
                        ? 'border-border bg-muted/30' 
                        : startingSoon 
                        ? 'border-primary bg-primary/10' 
                        : 'border-primary/30 bg-primary/5'
                    }`}>
                      <div className={`text-sm font-bold ${isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {new Date(meeting.datetime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          hour12: true
                        })}
                      </div>
                      <div className={`text-xs ${isPast ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                        {new Date(meeting.datetime).toLocaleTimeString('en-US', {
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 text-center font-medium">
                      {getRelativeTimeLabel(new Date(meeting.datetime))}
                    </div>
                    {startingSoon && (
                      <div className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full mt-1 font-medium">
                        Soon
                      </div>
                    )}
                  </div>

                  {/* Meeting Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-card-foreground mb-2 truncate">
                          {meeting.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{meeting.duration} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{acceptedCount}/{totalCount} attending</span>
                          </div>
                          {meeting.project && (
                            <span className="bg-muted px-2 py-1 rounded text-xs">
                              {meeting.project.name}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {meeting.meetingUrl && !isPast && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              joinMeeting(meeting.meetingUrl!);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                              startingSoon
                                ? 'bg-primary text-primary-foreground shadow-lg hover:shadow-xl'
                                : 'bg-primary/10 text-primary hover:bg-primary/20'
                            }`}
                          >
                            {startingSoon ? <Play className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                            Join
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                        
                        {/* Dropdown Menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(openDropdown === meeting.id ? null : meeting.id);
                            }}
                            className="w-10 h-10 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </button>
                          
                          {openDropdown === meeting.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setOpenDropdown(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-20 min-w-[140px] py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMeeting(meeting);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-3 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingMeeting(meeting);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-3 transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMeeting(meeting.id);
                                  }}
                                  className="w-full px-3 py-2 text-sm text-left hover:bg-accent text-destructive flex items-center gap-3 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {meeting.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {meeting.description}
                      </p>
                    )}

                    {/* Attendees and Details */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {meeting.attendees.slice(0, 4).map(attendee => (
                            <div
                              key={attendee.id}
                              className={`w-8 h-8 rounded-full ${attendee.user.color} border-2 border-background flex items-center justify-center text-white text-xs font-semibold`}
                              title={`${attendee.user.name || attendee.user.email} (${attendee.status})`}
                            >
                              {attendee.user.avatar}
                            </div>
                          ))}
                          {meeting.attendees.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                              +{meeting.attendees.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setSelectedMeeting(meeting)}
                        className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
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
    </div>
  );
}