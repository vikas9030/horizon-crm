import TopBar from '@/components/layout/TopBar';
import LeadList from '@/components/leads/LeadList';
import { useAuth } from '@/contexts/AuthContext';

export default function StaffLeads() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen">
      <TopBar title="My Leads" subtitle="Create and manage your leads" />
      <div className="p-6">
        <LeadList canCreate={true} canEdit={true} canConvert={true} isStaffView={true} userId={user?.id} />
      </div>
    </div>
  );
}
