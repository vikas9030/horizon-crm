import { useState, useEffect } from 'react';
import TopBar from '@/components/layout/TopBar';
import StaffPerformanceChart from '@/components/reports/StaffPerformanceChart';
import DailyLeadsPercentageChart from '@/components/reports/DailyLeadsPercentageChart';
import MonthlyLeavesChart from '@/components/reports/MonthlyLeavesChart';
import { mockUsers, mockLeads, mockTasks } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, ClipboardList, CheckSquare, CalendarOff, Filter } from 'lucide-react';

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
  const [selectedUserId, setSelectedUserId] = useState<string>('all');

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

  // Get team members (managers and staff)
  const allTeamMembers = mockUsers.filter(u => u.role === 'manager' || u.role === 'staff');
  
  // Filter based on selection
  const filteredUsers = selectedUserId === 'all' 
    ? allTeamMembers 
    : allTeamMembers.filter(u => u.id === selectedUserId);

  const filteredLeads = selectedUserId === 'all'
    ? mockLeads
    : mockLeads.filter(l => l.createdBy === selectedUserId);

  const filteredTasks = selectedUserId === 'all'
    ? mockTasks
    : mockTasks.filter(t => t.assignedTo === selectedUserId);

  // Convert database leaves to match the Leave type for the chart
  const convertedLeaves = leaves
    .filter(l => selectedUserId === 'all' || l.user_id === selectedUserId)
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

  const approvedLeaves = convertedLeaves.filter(l => l.status === 'approved').length;
  const selectedUser = allTeamMembers.find(u => u.id === selectedUserId);

  return (
    <div className="min-h-screen">
      <TopBar title="Reports" subtitle="Team performance analytics and insights" />
      
      <div className="p-6 space-y-6">
        {/* Filter Section */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 max-w-xs">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    <SelectItem value="all">All Team Members</SelectItem>
                    {allTeamMembers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedUserId !== 'all' && selectedUser && (
                <div className="text-sm text-muted-foreground">
                  Showing reports for <span className="font-medium text-foreground">{selectedUser.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                {selectedUserId === 'all' ? 'Team Members' : 'Selected Member'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{filteredUsers.length}</p>
              <p className="text-xs text-muted-foreground">
                {selectedUserId === 'all' 
                  ? `${mockUsers.filter(u => u.role === 'manager').length} managers, ${mockUsers.filter(u => u.role === 'staff').length} staff`
                  : selectedUser?.role
                }
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
              <p className="text-2xl font-bold">{filteredLeads.length}</p>
              <p className="text-xs text-muted-foreground">
                {selectedUserId === 'all' ? 'All time leads created' : 'Created by this member'}
              </p>
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
              <p className="text-2xl font-bold">{filteredTasks.length}</p>
              <p className="text-xs text-muted-foreground">
                {filteredTasks.filter(t => t.status === 'completed').length} completed
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
          users={filteredUsers} 
          leads={filteredLeads} 
          tasks={filteredTasks} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Leads Percentage */}
          <DailyLeadsPercentageChart 
            users={filteredUsers} 
            leads={filteredLeads}
            dailyTarget={100}
          />

          {/* Monthly Leaves Distribution */}
          <MonthlyLeavesChart 
            users={filteredUsers}
            leaves={convertedLeaves}
          />
        </div>
      </div>
    </div>
  );
}
