import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import AnnouncementList from '@/components/announcements/AnnouncementList';
import { mockAnnouncements } from '@/data/mockData';
import { Announcement } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);

  const handleAdd = (data: Omit<Announcement, 'id' | 'createdAt' | 'createdBy'>) => {
    const newAnnouncement: Announcement = {
      ...data,
      id: Date.now().toString(),
      createdBy: user?.id || '1',
      createdAt: new Date(),
    };
    setAnnouncements([newAnnouncement, ...announcements]);
  };

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setAnnouncements(announcements.map(a =>
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ));
  };

  return (
    <div className="min-h-screen">
      <TopBar title="Announcements" subtitle="Broadcast messages to staff and managers" />
      <div className="p-6">
        <AnnouncementList
          announcements={announcements}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      </div>
    </div>
  );
}
