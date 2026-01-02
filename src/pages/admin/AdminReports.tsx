import { useState, useEffect } from 'react';
import TopBar from '@/components/layout/TopBar';
import StaffPerformanceChart from '@/components/reports/StaffPerformanceChart';
import DailyLeadsPercentageChart from '@/components/reports/DailyLeadsPercentageChart';
import MonthlyLeavesChart from '@/components/reports/MonthlyLeavesChart';
import { mockUsers, mockLeads, mockTasks } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ClipboardList, CheckSquare, CalendarOff } from 'lucide-react';

interface LeaveRecord {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  document_url?: string | null;
  approved_by?: string | null;
  created_at: string;
}

export default function AdminReports() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const { data, error } = await supabase
        .from('leaves')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeaves(data || []);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert database leaves to match the Leave type for the chart
  const convertedLeaves = leaves.map(l => ({
    id: l.id,
    userId: l.user_id,
    userName: l.user_name,
    userRole: l.user_role as 'admin' | 'manager' | 'staff',
    type: l.leave_type as 'sick' | 'casual' | 'annual' | 'other',
    startDate: new Date(l.start_date),
    endDate: new Date(l.end_date),
    reason: l.reason,
    status: l.status as 'pending' | 'approved' | 'rejected',
    approvedBy: l.approved_by || undefined,
    createdAt: new Date(l.created_at),
  }));

  // Get team members (managers and staff)
  const teamMembers = mockUsers.filter(u => u.role === 'manager' || u.role === 'staff');
  const totalLeads = mockLeads.length;
  const totalTasks = mockTasks.length;
  const approvedLeaves = leaves.filter(l => l.status === 'approved').length;

  return (
    <div className="min-h-screen">
      <TopBar title="Reports" subtitle="Team performance analytics and insights" />
      
      <div className="p-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{teamMembers.length}</p>
              <p className="text-xs text-muted-foreground">
                {mockUsers.filter(u => u.role === 'manager').length} managers, {mockUsers.filter(u => u.role === 'staff').length} staff
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalLeads}</p>
              <p className="text-xs text-muted-foreground">All time leads created</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalTasks}</p>
              <p className="text-xs text-muted-foreground">
                {mockTasks.filter(t => t.status === 'completed').length} completed
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CalendarOff className="w-4 h-4" />
                Approved Leaves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{approvedLeaves}</p>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>
        </div>

        {/* Staff Performance Chart */}
        <StaffPerformanceChart 
          users={mockUsers} 
          leads={mockLeads} 
          tasks={mockTasks} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Leads Percentage */}
          <DailyLeadsPercentageChart 
            users={mockUsers} 
            leads={mockLeads}
            dailyTarget={100}
          />

          {/* Monthly Leaves Distribution */}
          <MonthlyLeavesChart 
            users={mockUsers}
            leaves={convertedLeaves}
          />
        </div>
      </div>
    </div>
  );
}
