import TopBar from '@/components/layout/TopBar';
import ProjectList from '@/components/projects/ProjectList';

export default function ManagerProjects() {
  return (
    <div className="min-h-screen">
      <TopBar title="Projects" subtitle="View real estate projects" />
      <div className="p-4 md:p-6">
        <ProjectList canCreate={false} canEdit={false} />
      </div>
    </div>
  );
}
