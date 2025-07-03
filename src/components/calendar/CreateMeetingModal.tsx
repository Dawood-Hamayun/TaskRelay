// frontend/src/components/calendar/CreateMeetingModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Link2, Users, Plus, Loader2, Check, Video, Globe, ChevronRight, ChevronDown } from 'lucide-react';
import { useMeetings } from '@/hooks/useMeetings';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  defaultDate?: Date;
}

const MEETING_PLATFORMS = [
  { id: 'zoom', name: 'Zoom', icon: Video, urlPattern: 'https://zoom.us/j/' },
  { id: 'meet', name: 'Google Meet', icon: Video, urlPattern: 'https://meet.google.com/' },
  { id: 'teams', name: 'Microsoft Teams', icon: Video, urlPattern: 'https://teams.microsoft.com/' },
  { id: 'custom', name: 'Custom Link', icon: Globe, urlPattern: '' }
];

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

export default function CreateMeetingModal({ 
  isOpen, 
  onClose, 
  projectId: initialProjectId,
  defaultDate 
}: CreateMeetingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: defaultDate || new Date(),
    time: '10:00',
    duration: 60,
    meetingUrl: '',
    projectId: initialProjectId || '',
    attendeeIds: [] as string[]
  });
  
  const [selectedPlatform, setSelectedPlatform] = useState('zoom');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const { projects } = useProjects();
  const { createMeeting, isCreating } = useMeetings();
  
  // Get current project members for attendee selection
  const currentProject = projects.find(p => p.id === formData.projectId);
  const availableAttendees = currentProject?.members || [];

  useEffect(() => {
    if (isOpen) {
      const defaultTime = defaultDate ? 
        `${String(defaultDate.getHours()).padStart(2, '0')}:${String(defaultDate.getMinutes()).padStart(2, '0')}` : 
        '10:00';
        
      setFormData({
        title: '',
        description: '',
        date: defaultDate || new Date(),
        time: defaultTime,
        duration: 60,
        meetingUrl: '',
        projectId: initialProjectId || (projects.length > 0 ? projects[0].id : ''),
        attendeeIds: []
      });
      setErrors({});
      setStep(1);
    }
  }, [isOpen, defaultDate, initialProjectId, projects]);

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Meeting title is required';
      }
      if (!formData.projectId) {
        newErrors.projectId = 'Please select a project';
      }
    }
    
    if (currentStep === 2) {
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
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    
    try {
      const [hours, minutes] = formData.time.split(':').map(Number);
      const meetingDateTime = new Date(formData.date);
      meetingDateTime.setHours(hours, minutes, 0, 0);
      
      await createMeeting({
        projectId: formData.projectId,
        data: {
          title: formData.title,
          description: formData.description || undefined,
          datetime: meetingDateTime.toISOString(),
          duration: formData.duration,
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

  const generateMeetingUrl = (platform: string) => {
    // Note: These are placeholder URLs for demo purposes
    // In production, you'd integrate with actual platform APIs
    const patterns = {
      zoom: `https://zoom.us/j/demo-meeting-${Date.now()}`,
      meet: `https://meet.google.com/demo-${Math.random().toString(36).substr(2, 10)}`,
      teams: `https://teams.microsoft.com/l/meetup-join/demo-${Math.random().toString(36).substr(2, 20)}`
    };
    
    if (patterns[platform]) {
      setFormData(prev => ({ ...prev, meetingUrl: patterns[platform] }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">Schedule New Meeting</h2>
                <p className="text-sm text-muted-foreground">Step {step} of 3</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-accent flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  stepNum <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-card-foreground">Meeting Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-card-foreground block mb-2">
                      Meeting Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Weekly Team Standup"
                      className={`w-full h-12 px-4 text-sm bg-input border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                        errors.title ? 'border-destructive' : 'border-border'
                      }`}
                    />
                    {errors.title && (
                      <p className="text-xs text-destructive mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-card-foreground block mb-2">
                      Project *
                    </label>
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value, attendeeIds: [] }))}
                      className={`w-full h-12 px-4 text-sm bg-input border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                        errors.projectId ? 'border-destructive' : 'border-border'
                      }`}
                    >
                      <option value="">Select a project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                    {errors.projectId && (
                      <p className="text-xs text-destructive mt-1">{errors.projectId}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-card-foreground block mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Meeting agenda, notes, or additional details..."
                      rows={3}
                      className="w-full p-4 text-sm bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Schedule */}
          {step === 2 && (
            <div className="space-y-6">
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

              <div>
                <h3 className="text-lg font-semibold mb-4 text-card-foreground">Meeting Platform</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {MEETING_PLATFORMS.map(platform => {
                    const IconComponent = platform.icon;
                    return (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => setSelectedPlatform(platform.id)}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          selectedPlatform === platform.id
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-input border-border hover:border-primary/50'
                        }`}
                      >
                        <IconComponent className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-xs font-medium">{platform.name}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.meetingUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, meetingUrl: e.target.value }))}
                      placeholder="https://zoom.us/j/... or paste meeting link"
                      className="flex-1 h-12 px-4 text-sm bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    {selectedPlatform !== 'custom' && (
                      <button
                        type="button"
                        onClick={() => generateMeetingUrl(selectedPlatform)}
                        className="px-4 h-12 bg-muted/50 text-muted-foreground rounded-xl hover:bg-muted transition-all text-sm"
                        title="Generate demo URL (replace with real meeting link)"
                      >
                        Demo URL
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedPlatform === 'custom' 
                      ? 'Enter any meeting platform URL'
                      : 'Paste your real meeting link or use demo URL for testing'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Attendees */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-card-foreground">Invite Team Members</h3>
                
                {currentProject && availableAttendees.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground mb-4">
                      Select team members from <span className="font-medium text-card-foreground">{currentProject.name}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                      {availableAttendees.map(member => (
                        <label
                          key={member.id}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent cursor-pointer transition-all"
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={formData.attendeeIds.includes(member.user.id)}
                              onChange={() => toggleAttendee(member.user.id)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded border-2 transition-all ${
                              formData.attendeeIds.includes(member.user.id)
                                ? 'bg-primary border-primary'
                                : 'border-border'
                            }`}>
                              {formData.attendeeIds.includes(member.user.id) && (
                                <Check className="w-3 h-3 text-primary-foreground m-0.5" />
                              )}
                            </div>
                          </div>
                          
                          <div className={`w-10 h-10 rounded-full ${member.user.color} flex items-center justify-center text-white font-semibold`}>
                            {member.user.avatar}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-card-foreground truncate">
                              {member.user.name || member.user.email}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {member.user.email}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {formData.attendeeIds.length} of {availableAttendees.length} members selected
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No team members available to invite</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isCreating}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors disabled:opacity-50"
                >
                  Back
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isCreating}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              
              {step < 3 ? (
                <button
                  onClick={nextStep}
                  disabled={isCreating}
                  className="px-6 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isCreating}
                  className="px-6 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200"
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}