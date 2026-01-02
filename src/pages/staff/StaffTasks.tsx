import TopBar from '@/components/layout/TopBar';
import TaskList from '@/components/tasks/TaskList';

export default function StaffTasks() {
  return (
    <div className="min-h-screen">
      <TopBar title="My Tasks" subtitle="Manage your assigned tasks" />
      <div className="p-6">
        <TaskList canEdit={true} />
      </div>
    </div>
  );
}
