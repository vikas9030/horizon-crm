import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { Announcement, Lead, Project, Task } from '@/types';
import { mockAnnouncements, mockLeads, mockProjects, mockTasks } from '@/data/mockData';
import { useNotifications } from './NotificationContext';

interface DataContextType {
  leads: Lead[];
  tasks: Task[];
  projects: Project[];
  announcements: Announcement[];
  addLead: (lead: Lead) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  addAnnouncement: (announcement: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
  toggleAnnouncementActive: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  
  // Get notification functions from context if available
  const notificationContext = useNotifications();

  const addLead = useCallback((lead: Lead) => {
    setLeads(prev => [lead, ...prev]);
    // Add notification for new lead
    if (notificationContext?.addNotification) {
      notificationContext.addNotification({
        title: 'New Lead Created',
        message: `Lead "${lead.name}" has been created`,
        type: 'lead',
        createdAt: new Date(),
      });
    }
  }, [notificationContext]);

  const updateLead = useCallback((id: string, data: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data, updatedAt: new Date() } : l));
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  }, []);

  const addTask = useCallback((task: Task) => {
    setTasks(prev => [task, ...prev]);
    // Add notification for new task
    if (notificationContext?.addNotification) {
      notificationContext.addNotification({
        title: 'New Task Created',
        message: `Task for "${task.lead.name}" has been created`,
        type: 'task',
        createdAt: new Date(),
      });
    }
  }, [notificationContext]);

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data, updatedAt: new Date() } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const addProject = useCallback((project: Project) => {
    setProjects(prev => [project, ...prev]);
  }, []);

  const updateProject = useCallback((id: string, data: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);

  const addAnnouncement = useCallback((announcement: Announcement) => {
    setAnnouncements(prev => [announcement, ...prev]);
    // Add notification for new announcement
    if (notificationContext?.addNotification) {
      notificationContext.addNotification({
        title: 'New Announcement',
        message: announcement.title,
        type: 'announcement',
        createdAt: new Date(),
      });
    }
  }, [notificationContext]);

  const deleteAnnouncement = useCallback((id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  }, []);

  const toggleAnnouncementActive = useCallback((id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  }, []);

  const value = useMemo(() => ({
    leads,
    tasks,
    projects,
    announcements,
    addLead,
    updateLead,
    deleteLead,
    addTask,
    updateTask,
    deleteTask,
    addProject,
    updateProject,
    addAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementActive,
  }), [leads, tasks, projects, announcements, addLead, updateLead, deleteLead, addTask, updateTask, deleteTask, addProject, updateProject, addAnnouncement, deleteAnnouncement, toggleAnnouncementActive]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
