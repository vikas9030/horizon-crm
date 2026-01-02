import TopBar from '@/components/layout/TopBar';
import TaskList from '@/components/tasks/TaskList';

export default function ManagerTasks() {
  return (
    <div className="min-h-screen">
      <TopBar title="Tasks Monitor" subtitle="View tasks assigned to staff" />
      <div className="p-6">
        <TaskList canEdit={false} />
      </div>
    </div>
  );
}
