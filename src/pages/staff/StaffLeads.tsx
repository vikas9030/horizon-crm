import TopBar from '@/components/layout/TopBar';
import LeadList from '@/components/leads/LeadList';

export default function StaffLeads() {
  return (
    <div className="min-h-screen">
      <TopBar title="My Leads" subtitle="Create and manage your leads" />
      <div className="p-6">
        <LeadList canCreate={true} canEdit={true} canConvert={true} />
      </div>
    </div>
  );
}
