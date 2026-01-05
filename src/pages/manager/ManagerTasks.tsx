import TopBar from "@/components/layout/TopBar";
import TaskList from "@/components/tasks/TaskList";

export default function ManagerTasks() {
  return (
    <div className="min-h-screen">
      <TopBar title="Tasks" subtitle="View tasks" />
      <div className="p-4 md:p-6">
        <TaskList canCreate={false} canEdit={false} isManagerView />
      </div>
    </div>
  );
}
