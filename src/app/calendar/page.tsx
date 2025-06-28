// frontend/src/app/calendar/page.tsx - FIXED IMPORTS
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, ChevronDown, List, Grid3X3 } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import CalendarView from '@/components/calendar/CalendarView';
import MeetingListView from '@/components/calendar/MeetingListView';
import UpcomingMeetings from '@/components/calendar/UpcomingMeetings';
import { useProjects } from '@/hooks/useProjects';
import { useMeetings } from '@/hooks/useMeetings';

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  
  const { projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { userMeetings, getTodaysMeetings, getUpcomingMeetings, isLoading: meetingsLoading } = useMeetings();
  
  // Debug logging
  useEffect(() => {
    console.log('📅 Calendar Page Debug:', {
      projectsLoading,
      projectsError,
      projectsCount: projects?.length || 0,
      projects: projects,
      selectedProjectId
    });
  }, [projects, projectsLoading, projectsError, selectedProjectId]);

  // Reset selectedProjectId if the selected project no longer exists
  useEffect(() => {
    if (!projectsLoading && projects.length > 0 && selectedProjectId !== 'all') {
      const projectExists = projects.some(p => p.id === selectedProjectId);
      if (!projectExists) {
        console.log('🔄 Selected project no longer exists, resetting to "all"');
        setSelectedProjectId('all');
      }
    }
  }, [projects, selectedProjectId, projectsLoading]);

  const todaysMeetings = getTodaysMeetings();
  const upcomingMeetings = getUpcomingMeetings(7);

  // Show loading state
  if (projectsLoading || meetingsLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (projectsError) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-destructive">Failed to load projects</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header>
          <div className="flex items-center gap-3">
            {/* Project Filter */}
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  console.log('🔄 Project selection changed to:', e.target.value);
                  setSelectedProjectId(e.target.value);
                }}
                className="h-9 px-3 pr-8 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring appearance-none min-w-[160px]"
                disabled={projectsLoading}
              >
                <option value="all">All Projects ({projects.length})</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('calendar')}
                className={`h-8 text-xs px-3 rounded flex items-center gap-2 ${
                  viewMode === 'calendar' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Grid3X3 className="h-3 w-3" />
                Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`h-8 text-xs px-3 rounded flex items-center gap-2 ${
                  viewMode === 'list' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <List className="h-3 w-3" />
                List
              </button>
            </div>

            {/* Debug Info (remove in production) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                Projects: {projects.length} | Selected: {selectedProjectId}
              </div>
            )}
          </div>
        </Header>

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
                  <p className="text-sm text-muted-foreground">
                    {userMeetings.length} meetings this month
                    {selectedProjectId !== 'all' && (
                      <span className="ml-2 text-primary">
                        • Filtered by {projects.find(p => p.id === selectedProjectId)?.name}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-3">
                {viewMode === 'calendar' ? (
                  <CalendarView 
                    projectId={selectedProjectId === 'all' ? undefined : selectedProjectId} 
                  />
                ) : (
                  <MeetingListView 
                    projectId={selectedProjectId === 'all' ? undefined : selectedProjectId} 
                  />
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Today's Meetings */}
                {todaysMeetings.length > 0 && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-card-foreground">Today's Meetings</h3>
                    </div>
                    <div className="space-y-2">
                      {todaysMeetings.slice(0, 3).map(meeting => (
                        <div key={meeting.id} className="p-2 bg-muted/50 rounded-lg">
                          <div className="font-medium text-sm text-card-foreground truncate">
                            {meeting.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(meeting.datetime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        </div>
                      ))}
                      {todaysMeetings.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{todaysMeetings.length - 3} more today
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Upcoming Meetings */}
                <UpcomingMeetings meetings={upcomingMeetings} />

                {/* Quick Stats */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-card-foreground mb-3">This Week</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Meetings</span>
                      <span className="font-medium">{upcomingMeetings.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Hours Scheduled</span>
                      <span className="font-medium">
                        {Math.round(upcomingMeetings.reduce((acc, meeting) => acc + meeting.duration, 0) / 60)}h
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Projects</span>
                      <span className="font-medium">
                        {new Set(upcomingMeetings.map(m => m.project?.id).filter(Boolean)).size}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Project Summary */}
                {projects.length > 0 && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="font-semibold text-card-foreground mb-3">Your Projects</h3>
                    <div className="space-y-2">
                      {projects.slice(0, 3).map(project => (
                        <div key={project.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                          <span className="text-sm text-card-foreground truncate">{project.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {project._count?.tasks || 0} tasks
                          </span>
                        </div>
                      ))}
                      {projects.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{projects.length - 3} more projects
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}