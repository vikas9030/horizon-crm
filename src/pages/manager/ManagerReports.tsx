import { useState, useEffect } from 'react';
import TopBar from '@/components/layout/TopBar';
import StaffPerformanceChart from '@/components/reports/StaffPerformanceChart';
import DailyLeadsPercentageChart from '@/components/reports/DailyLeadsPercentageChart';
import MonthlyLeavesChart from '@/components/reports/MonthlyLeavesChart';
import { mockUsers, mockLeads, mockTasks } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ClipboardList, CheckSquare, CalendarOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

export default function ManagerReports() {
  const { user } = useAuth();
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

  // Filter team members under this manager (staff with this manager as managerId) + the manager themselves
  const teamMembers = mockUsers.filter(u => 
    u.managerId === user?.id || u.id === user?.id
  );

  // Filter leads and tasks for team members
  const teamLeads = mockLeads.filter(l => 
    teamMembers.some(m => m.id === l.createdBy)
  );
  const teamTasks = mockTasks.filter(t => 
    teamMembers.some(m => m.id === t.assignedTo)
  );

  // Convert database leaves to match the Leave type for the chart
  const convertedLeaves = leaves
    .filter(l => teamMembers.some(m => m.id === l.user_id))
    .map(l => ({
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

  const approvedLeaves = leaves.filter(l => 
    l.status === 'approved' && teamMembers.some(m => m.id === l.user_id)
  ).length;

  return (
    <div className="min-h-screen">
      <TopBar title="Team Reports" subtitle="Your team's performance analytics" />
      
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
                Including yourself
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Team Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{teamLeads.length}</p>
              <p className="text-xs text-muted-foreground">Created by your team</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Team Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{teamTasks.length}</p>
              <p className="text-xs text-muted-foreground">
                {teamTasks.filter(t => t.status === 'completed').length} completed
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
              <p className="text-xs text-muted-foreground">Team leaves this period</p>
            </CardContent>
          </Card>
        </div>

        {/* Staff Performance Chart */}
        <StaffPerformanceChart 
          users={teamMembers} 
          leads={teamLeads} 
          tasks={teamTasks} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Leads Percentage */}
          <DailyLeadsPercentageChart 
            users={teamMembers} 
            leads={teamLeads}
            dailyTarget={100}
          />

          {/* Monthly Leaves Distribution */}
          <MonthlyLeavesChart 
            users={teamMembers}
            leaves={convertedLeaves}
          />
        </div>
      </div>
    </div>
  );
}
