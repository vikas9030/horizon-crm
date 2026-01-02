import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Lead, Task } from '@/types';
import { isAfter, isBefore, addDays, isToday } from 'date-fns';

interface NotificationState {
  leadReminders: number;
  taskReminders: number;
  overdueLeads: number;
  overdueTasks: number;
  totalNotifications: number;
}

interface NotificationContextType {
  notifications: NotificationState;
  updateNotifications: (leads: Lead[], tasks: Task[]) => void;
  playNotificationSound: () => void;
  hasNewNotifications: boolean;
  markAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationState>({
    leadReminders: 0,
    taskReminders: 0,
    overdueLeads: 0,
    overdueTasks: 0,
    totalNotifications: 0,
  });
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  const playNotificationSound = useCallback(() => {
    // Create a simple notification beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log('Audio notification not supported');
    }
  }, []);

  const updateNotifications = useCallback((leads: Lead[], tasks: Task[]) => {
    const today = new Date();
    const nextWeek = addDays(today, 7);

    // Get leads with reminder status and upcoming follow-up dates
    const upcomingLeadReminders = leads.filter(l => 
      l.status === 'reminder' && 
      l.followUpDate && 
      isAfter(l.followUpDate, today) &&
      isBefore(l.followUpDate, nextWeek)
    ).length;

    // Overdue leads (follow-up date passed)
    const overdueLeads = leads.filter(l => 
      l.status === 'reminder' && 
      l.followUpDate && 
      isBefore(l.followUpDate, today) &&
      !isToday(l.followUpDate)
    ).length;

    // Get tasks with upcoming action dates
    const upcomingTaskReminders = tasks.filter(t => 
      t.nextActionDate && 
      isAfter(t.nextActionDate, today) &&
      isBefore(t.nextActionDate, nextWeek) &&
      t.status !== 'completed' && 
      t.status !== 'rejected'
    ).length;

    // Overdue tasks
    const overdueTasks = tasks.filter(t => 
      t.nextActionDate && 
      isBefore(t.nextActionDate, today) &&
      !isToday(t.nextActionDate) &&
      t.status !== 'completed' && 
      t.status !== 'rejected'
    ).length;

    const totalNotifications = upcomingLeadReminders + upcomingTaskReminders + overdueLeads + overdueTasks;

    setNotifications({
      leadReminders: upcomingLeadReminders,
      taskReminders: upcomingTaskReminders,
      overdueLeads,
      overdueTasks,
      totalNotifications,
    });

    if (totalNotifications > 0) {
      setHasNewNotifications(true);
    }
  }, []);

  const markAsRead = useCallback(() => {
    setHasNewNotifications(false);
  }, []);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      updateNotifications, 
      playNotificationSound,
      hasNewNotifications,
      markAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
