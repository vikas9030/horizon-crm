import TopBar from '@/components/layout/TopBar';
import LeadList from '@/components/leads/LeadList';

export default function AdminLeads() {
  return (
    <div className="min-h-screen">
      <TopBar title="Lead Management" subtitle="View and manage all leads" />
      <div className="p-6">
        <LeadList canCreate={true} canEdit={true} canConvert={true} />
      </div>
    </div>
  );
}
