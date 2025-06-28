// frontend/src/components/calendar/CreateMeetingModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Link2, Users, Plus, Loader2, Check } from 'lucide-react';
import { useMeetings } from '@/hooks/useMeetings';
import { useProjects } from '@/hooks/useProjects';
import { formatDateTimeForInput } from '@/utils/dateUtils';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  defaultDate?: Date;
}

export default function CreateMeetingModal({ 
  isOpen, 
  onClose, 
  projectId: initialProjectId,
  defaultDate 
}: CreateMeetingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    datetime: defaultDate ? formatDateTimeForInput(defaultDate) : '',
    duration: 60,
    location: '',
    meetingUrl: '',
    projectId: initialProjectId || '',
    attendeeIds: [] as string[]
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { projects } = useProjects();
  const { createMeeting, isCreating } = useMeetings();
  
  // Get current project members for attendee selection
  const currentProject = projects.find(p => p.id === formData.projectId);
  const availableAttendees = currentProject?.members || [];

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        title: '',
        description: '',
        datetime: defaultDate ? formatDateTimeForInput(defaultDate) : '',
        duration: 60,
        location: '',
        meetingUrl: '',
        projectId: initialProjectId || (projects.length > 0 ? projects[0].id : ''),
        attendeeIds: []
      });
      setErrors({});
    }
  }, [isOpen, defaultDate, initialProjectId, projects]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Meeting title is required';
    }
    
    if (!formData.datetime) {
      newErrors.datetime = 'Date and time are required';
    } else {
      const meetingDate = new Date(formData.datetime);
      if (meetingDate < new Date()) {
        newErrors.datetime = 'Meeting cannot be scheduled in the past';
      }
    }
    
    if (!formData.projectId) {
      newErrors.projectId = 'Please select a project';
    }
    
    if (formData.duration < 15 || formData.duration > 480) {
      newErrors.duration = 'Duration must be between 15 minutes and 8 hours';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await createMeeting({
        projectId: formData.projectId,
        data: {
          title: formData.title,
          description: formData.description || undefined,
          datetime: formData.datetime,
          duration: formData.duration,
          location: formData.location || undefined,
          meetingUrl: formData.meetingUrl || undefined,
          attendeeIds: formData.attendeeIds
        }
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to create meeting:', error);
    }
  };

  const toggleAttendee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      attendeeIds: prev.attendeeIds.includes(userId)
        ? prev.attendeeIds.filter(id => id !== userId)
        : [...prev.attendeeIds, userId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">Schedule Meeting</h2>
                <p className="text-sm text-muted-foreground">Create a new team meeting</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Meeting Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter meeting title"
              className={`w-full h-10 px-3 text-sm bg-input border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring ${
                errors.title ? 'border-destructive' : 'border-border'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Project Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Project *
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value, attendeeIds: [] }))}
              className={`w-full h-10 px-3 text-sm bg-input border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring ${
                errors.projectId ? 'border-destructive' : 'border-border'
              }`}
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            {errors.projectId && (
              <p className="text-xs text-destructive">{errors.projectId}</p>
            )}
          </div>

          {/* Date & Time + Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">
                Date & Time *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="datetime-local"
                  value={formData.datetime}
                  onChange={(e) => setFormData(prev => ({ ...prev, datetime: e.target.value }))}
                  className={`w-full h-10 pl-10 pr-3 text-sm bg-input border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring ${
                    errors.datetime ? 'border-destructive' : 'border-border'
                  }`}
                />
              </div>
              {errors.datetime && (
                <p className="text-xs text-destructive">{errors.datetime}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">
                Duration (minutes)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  className="w-full h-10 pl-10 pr-3 text-sm bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                  <option value={240}>4 hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Meeting room, address, or location"
                className="w-full h-10 pl-10 pr-3 text-sm bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>
          </div>

          {/* Meeting URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Meeting Link
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="url"
                value={formData.meetingUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, meetingUrl: e.target.value }))}
                placeholder="https://zoom.us/j/... or Google Meet link"
                className="w-full h-10 pl-10 pr-3 text-sm bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Meeting agenda, notes, or additional details..."
              rows={3}
              className="w-full p-3 text-sm bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring resize-none"
            />
          </div>

          {/* Attendees */}
          {currentProject && availableAttendees.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium text-card-foreground">
                  Invite Team Members
                </label>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {availableAttendees.map(member => (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.attendeeIds.includes(member.user.id)}
                      onChange={() => toggleAttendee(member.user.id)}
                      className="rounded border-border"
                    />
                    <div className={`w-8 h-8 rounded-full ${member.user.color} flex items-center justify-center text-white text-xs font-semibold`}>
                      {member.user.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {member.user.name || member.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.user.email}
                      </p>
                    </div>
                    {formData.attendeeIds.includes(member.user.id) && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/20">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Meeting
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}