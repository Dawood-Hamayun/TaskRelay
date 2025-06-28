// frontend/src/components/calendar/MeetingListView.tsx
'use client';

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Link2, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { useMeetings } from '@/hooks/useMeetings';
import { formatDateTime } from '@/utils/dateUtils';
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
  
  const { userMeetings, projectMeetings, isLoading, deleteMeeting } = useMeetings(projectId);
  
  const meetings = projectId ? projectMeetings : userMeetings;
  
  const filteredMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.datetime);
    const now = new Date();
    
    switch (timeFilter) {
      case 'upcoming':
        return meetingDate >= now;
      case 'past':
        return meetingDate < now;
      default:
        return true;
    }
  }).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  const handleDeleteMeeting = async (meetingId: string) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      try {
        await deleteMeeting(meetingId);
      } catch (error) {
        console.error('Failed to delete meeting:', error);
      }
    }
  };

  const getAttendeeStatus = (meeting: Meeting) => {
    const acceptedCount = meeting.attendees.filter(a => a.status === 'ACCEPTED').length;
    const totalCount = meeting.attendees.length;
    return { acceptedCount, totalCount };
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
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Show:</span>
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            {[
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'past', label: 'Past' },
              { key: 'all', label: 'All' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setTimeFilter(filter.key as any)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  timeFilter === filter.key
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {filteredMeetings.length} meetings
        </div>
      </div>

      {/* Meetings List */}
      {filteredMeetings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No meetings found</h3>
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
            
            return (
              <div
                key={meeting.id}
                className={`bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  isPast ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isPast ? 'bg-muted' : 'bg-primary/10'
                      }`}>
                        <Calendar className={`w-5 h-5 ${isPast ? 'text-muted-foreground' : 'text-primary'}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-card-foreground mb-1 truncate">
                          {meeting.title}
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDateTime(meeting.datetime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{meeting.duration} min</span>
                          </div>
                        </div>
                        
                        {meeting.project && (
                          <div className="text-xs text-muted-foreground mb-2">
                            {meeting.project.name}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {meeting.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-[120px]">{meeting.location}</span>
                            </div>
                          )}
                          
                          {meeting.meetingUrl && (
                            <div className="flex items-center gap-1">
                              <Link2 className="w-3 h-3" />
                              <span>Virtual</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{acceptedCount}/{totalCount} attending</span>
                          </div>
                        </div>
                        
                        {meeting.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {meeting.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {/* Attendee Avatars */}
                    <div className="flex -space-x-2">
                      {meeting.attendees.slice(0, 3).map(attendee => (
                        <div
                          key={attendee.id}
                          className={`w-8 h-8 rounded-full ${attendee.user.color} border-2 border-background flex items-center justify-center text-white text-xs font-semibold`}
                          title={`${attendee.user.name || attendee.user.email} (${attendee.status})`}
                        >
                          {attendee.user.avatar}
                        </div>
                      ))}
                      {meeting.attendees.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                          +{meeting.attendees.length - 3}
                        </div>
                      )}
                    </div>
                    
                    {/* Actions Menu */}
                    <div className="relative group">
                      <button className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                      </button>
                      
                      <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={() => setSelectedMeeting(meeting)}
                          className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
                        >
                          <Eye className="w-3 h-3" />
                          View Details
                        </button>
                        <button
                          onClick={() => setEditingMeeting(meeting)}
                          className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMeeting(meeting.id)}
                          className="w-full px-3 py-2 text-sm text-left hover:bg-accent text-destructive flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
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