import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/dashboard/StatCard';
import AnnouncementBanner from '@/components/announcements/AnnouncementBanner';
import { mockLeads, mockTasks, mockLeaves, mockUsers, mockAnnouncements } from '@/data/mockData';
import { Users, ClipboardList, CheckSquare, CalendarOff, TrendingUp, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ManagerDashboard() {
  const staffMembers = mockUsers.filter(u => u.role === 'staff');
  const pendingStaffLeaves = mockLeaves.filter(l => l.userRole === 'staff' && l.status === 'pending').length;

  const staffPerformance = staffMembers.map(staff => ({
    name: staff.name.split(' ')[0],
    leads: mockLeads.filter(l => l.createdBy === staff.id).length,
    tasks: mockTasks.filter(t => t.assignedTo === staff.id).length,
  }));

  return (
    <div className="min-h-screen">
      <TopBar title="Manager Dashboard" subtitle="Monitor your team's performance" />
      
      <div className="p-6 space-y-6">
        {/* Announcements */}
        <AnnouncementBanner announcements={mockAnnouncements} userRole="manager" />
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Team Members"
            value={staffMembers.length}
            change="Active staff"
            changeType="neutral"
            icon={Users}
            iconColor="gradient-primary"
            delay={0}
          />
          <StatCard
            title="Total Leads"
            value={mockLeads.length}
            change="Created by team"
            changeType="neutral"
            icon={ClipboardList}
            iconColor="bg-info"
            delay={50}
          />
          <StatCard
            title="Active Tasks"
            value={mockTasks.filter(t => t.status !== 'completed' && t.status !== 'rejected').length}
            change="In progress"
            changeType="neutral"
            icon={CheckSquare}
            iconColor="gradient-accent"
            delay={100}
          />
          <StatCard
            title="Pending Leaves"
            value={pendingStaffLeaves}
            change="Awaiting approval"
            changeType={pendingStaffLeaves > 0 ? 'negative' : 'neutral'}
            icon={CalendarOff}
            iconColor="bg-warning"
            delay={150}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Staff Performance Chart */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-semibold text-foreground mb-4">Staff Performance</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffPerformance}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="leads" fill="hsl(215, 80%, 35%)" name="Leads" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tasks" fill="hsl(38, 95%, 55%)" name="Tasks" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Team Overview */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <h3 className="text-lg font-semibold text-foreground mb-4">Team Overview</h3>
            <div className="space-y-4">
              {staffMembers.map((staff, index) => {
                const staffLeads = mockLeads.filter(l => l.createdBy === staff.id).length;
                const staffTasks = mockTasks.filter(t => t.assignedTo === staff.id).length;
                
                return (
                  <div 
                    key={staff.id} 
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-semibold">
                      {staff.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{staff.name}</p>
                      <p className="text-sm text-muted-foreground">{staff.email}</p>
                    </div>
                    <div className="flex gap-6 text-center">
                      <div>
                        <p className="text-lg font-semibold text-foreground">{staffLeads}</p>
                        <p className="text-xs text-muted-foreground">Leads</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground">{staffTasks}</p>
                        <p className="text-xs text-muted-foreground">Tasks</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
