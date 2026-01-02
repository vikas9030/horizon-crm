import TopBar from '@/components/layout/TopBar';
import LeadList from '@/components/leads/LeadList';

export default function ManagerLeads() {
  return (
    <div className="min-h-screen">
      <TopBar title="Leads Monitor" subtitle="View leads created by staff" />
      <div className="p-6">
        <LeadList canCreate={false} canEdit={false} canConvert={false} isManagerView={true} />
      </div>
    </div>
  );
}
