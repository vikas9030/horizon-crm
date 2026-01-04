import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Lead, Task } from '@/types';
import { mockLeads, mockTasks, mockAnnouncements } from '@/data/mockData';
import { isAfter, isBefore, addDays, isToday } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'lead' | 'task' | 'announcement' | 'reminder';
  createdAt: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  playNotificationSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const playNotificationSound = useCallback(() => {
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

  useEffect(() => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    const leadNotifications: Notification[] = mockLeads
      .filter(l => 
        l.status === 'reminder' && 
        l.followUpDate && 
        ((isAfter(l.followUpDate, today) && isBefore(l.followUpDate, nextWeek)) ||
         (isBefore(l.followUpDate, today) && !isToday(l.followUpDate)))
      )
      .map(lead => ({
        id: `lead-${lead.id}`,
        title: 'Lead Follow-up',
        message: `Follow-up required for ${lead.name}`,
        type: 'lead' as const,
        createdAt: lead.followUpDate || new Date(),
        read: false,
      }));

    const taskNotifications: Notification[] = mockTasks
      .filter(t => 
        t.nextActionDate && 
        ((isAfter(t.nextActionDate, today) && isBefore(t.nextActionDate, nextWeek)) ||
         (isBefore(t.nextActionDate, today) && !isToday(t.nextActionDate))) &&
        t.status !== 'completed' && 
        t.status !== 'rejected'
      )
      .map(task => ({
        id: `task-${task.id}`,
        title: 'Task Action Required',
        message: `Action needed for ${task.lead.name}`,
        type: 'task' as const,
        createdAt: task.nextActionDate || new Date(),
        read: false,
      }));

    const announcementNotifications: Notification[] = mockAnnouncements
      .filter(a => a.isActive && (!a.expiresAt || new Date(a.expiresAt) > new Date()))
      .map(announcement => ({
        id: `announcement-${announcement.id}`,
        title: 'Announcement',
        message: announcement.title,
        type: 'announcement' as const,
        createdAt: announcement.createdAt,
        read: false,
      }));

    setNotifications([...announcementNotifications, ...leadNotifications, ...taskNotifications]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead, 
      clearNotifications,
      playNotificationSound 
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
