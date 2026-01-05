import TopBar from "@/components/layout/TopBar";
import LeadList from "@/components/leads/LeadList";

export default function ManagerLeads() {
  return (
    <div className="min-h-screen">
      <TopBar title="Leads" subtitle="View leads" />
      <div className="p-4 md:p-6">
        <LeadList canCreate={false} canEdit={false} canConvert={false} isManagerView />
      </div>
    </div>
  );
}
