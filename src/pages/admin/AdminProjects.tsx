import TopBar from '@/components/layout/TopBar';
import ProjectList from '@/components/projects/ProjectList';

export default function AdminProjects() {
  return (
    <div className="min-h-screen">
      <TopBar title="Project Management" subtitle="Manage real estate projects" />
      <div className="p-6">
        <ProjectList canCreate={true} />
      </div>
    </div>
  );
}
