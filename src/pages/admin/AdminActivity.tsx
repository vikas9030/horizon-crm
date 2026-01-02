import TopBar from '@/components/layout/TopBar';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import { mockActivities } from '@/data/mockData';

export default function AdminActivity() {
  return (
    <div className="min-h-screen">
      <TopBar title="Activity Log" subtitle="Track all system activities" />
      <div className="p-6">
        <ActivityFeed activities={mockActivities} />
      </div>
    </div>
  );
}
