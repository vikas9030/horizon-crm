import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import AnnouncementList from "@/components/announcements/AnnouncementList";
import TopBar from "@/components/layout/TopBar";
import { Announcement } from "@/types";

export default function AdminAnnouncements() {
  const { user } = useAuth();
  const { announcements, addAnnouncement, deleteAnnouncement, toggleAnnouncementActive } = useData();

  const handleAdd = (data: Omit<Announcement, "id" | "createdAt" | "createdBy">) => {
    const newAnnouncement: Announcement = {
      ...data,
      id: Date.now().toString(),
      createdBy: user?.id || "1",
      createdAt: new Date(),
    };

    addAnnouncement(newAnnouncement);
    toast.success("Announcement created");
  };

  return (
    <div className="min-h-screen">
      <TopBar title="Announcements" subtitle="Broadcast messages to staff and managers" />
      <div className="p-4 md:p-6">
        <AnnouncementList
          announcements={announcements}
          onAdd={handleAdd}
          onDelete={deleteAnnouncement}
          onToggleActive={toggleAnnouncementActive}
        />
      </div>
    </div>
  );
}
