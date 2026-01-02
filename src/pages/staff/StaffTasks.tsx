import TopBar from '@/components/layout/TopBar';
import TaskList from '@/components/tasks/TaskList';
import { useAuth } from '@/contexts/AuthContext';

export default function StaffTasks() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen">
      <TopBar title="My Tasks" subtitle="Manage your assigned tasks" />
      <div className="p-6">
        <TaskList canEdit={true} isStaffView={true} userId={user?.id} />
      </div>
    </div>
  );
}
