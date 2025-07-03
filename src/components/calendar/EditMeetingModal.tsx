// frontend/src/components/calendar/EditMeetingModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Link2, Users, Save, Loader2, ChevronDown } from 'lucide-react';
import { Meeting, UpdateMeetingDto } from '@/types/meeting';
import { useMeetings } from '@/hooks/useMeetings';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface EditMeetingModalProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
}

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

export default function EditMeetingModal({ meeting, isOpen, onClose }: EditMeetingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: '10:00',
    duration: 60,
    meetingUrl: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const { updateMeeting, isUpdating } = useMeetings();

  useEffect(() => {
    if (meeting && isOpen) {
      const meetingDate = new Date(meeting.datetime);
      const timeString = `${String(meetingDate.getHours()).padStart(2, '0')}:${String(meetingDate.getMinutes()).padStart(2, '0')}`;
      
      setFormData({
        title: meeting.title,
        description: meeting.description || '',
        date: meetingDate,
        time: timeString,
        duration: meeting.duration,
        meetingUrl: meeting.meetingUrl || ''
      });
      setErrors({});
    }
  }, [meeting, isOpen]);

  if (!meeting || !isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Meeting title is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const [hours, minutes] = formData.time.split(':').map(Number);
      const meetingDateTime = new Date(formData.date);
      meetingDateTime.setHours(hours, minutes, 0, 0);
      
      if (meetingDateTime < new Date()) {
        newErrors.datetime = 'Meeting cannot be scheduled in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const [hours, minutes] = formData.time.split(':').map(Number);
      const meetingDateTime = new Date(formData.date);
      meetingDateTime.setHours(hours, minutes, 0, 0);
      
      await updateMeeting({
        meetingId: meeting.id,
        data: {
          title: formData.title,
          description: formData.description || undefined,
          datetime: meetingDateTime.toISOString(),
          duration: formData.duration,
          meetingUrl: formData.meetingUrl || undefined
        }
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to update meeting:', error);
    }
  };

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
                <h2 className="text-xl font-semibold text-card-foreground">Edit Meeting</h2>
                <p className="text-sm text-muted-foreground">{meeting.project?.name}</p>
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

          {/* Date & Time + Duration */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-card-foreground">When & How Long</h3>
            
            <div className="flex gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="date-picker" className="px-1">
                  Date
                </Label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date-picker"
                      className={`w-32 justify-between font-normal ${
                        errors.date ? 'border-destructive' : ''
                      }`}
                    >
                      {formData.date ? formData.date.toLocaleDateString() : "Select date"}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.date}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        if (date) {
                          setFormData(prev => ({ ...prev, date }));
                          setIsDatePickerOpen(false);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <p className="text-xs text-destructive">{errors.date}</p>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                <Label htmlFor="time-picker" className="px-1">
                  Time
                </Label>
                <Input
                  type="time"
                  id="time-picker"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className={`bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none ${
                    errors.datetime ? 'border-destructive' : ''
                  }`}
                />
                {errors.datetime && (
                  <p className="text-xs text-destructive">{errors.datetime}</p>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                <Label className="px-1">Duration</Label>
                <div className="grid grid-cols-2 gap-2 w-32">
                  {DURATION_OPTIONS.slice(0, 4).map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, duration: option.value }))}
                      className={`h-10 text-xs rounded-lg border transition-all ${
                        formData.duration === option.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-input border-border hover:border-primary/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
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

          {/* Current Attendees Info */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-card-foreground">
                Current Attendees ({meeting.attendees.length})
              </span>
            </div>
            <div className="flex -space-x-2">
              {meeting.attendees.slice(0, 5).map(attendee => (
                <div
                  key={attendee.id}
                  className={`w-8 h-8 rounded-full ${attendee.user.color} border-2 border-background flex items-center justify-center text-white text-xs font-semibold`}
                  title={attendee.user.name || attendee.user.email}
                >
                  {attendee.user.avatar}
                </div>
              ))}
              {meeting.attendees.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                  +{meeting.attendees.length - 5}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}