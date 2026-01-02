import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/dashboard/StatCard';
import AnnouncementBanner from '@/components/announcements/AnnouncementBanner';
import TaskStatusChart from '@/components/dashboard/TaskStatusChart';
import LeadStatusChart from '@/components/dashboard/LeadStatusChart';
import RemindersWidget from '@/components/dashboard/RemindersWidget';
import { mockLeads, mockTasks, mockLeaves, mockAnnouncements } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardList, CheckSquare, CalendarOff, Bell, Target } from 'lucide-react';
import { format } from 'date-fns';
import LeadStatusChip from '@/components/leads/LeadStatusChip';
import TaskStatusChip from '@/components/tasks/TaskStatusChip';

export default function StaffDashboard() {
  const { user } = useAuth();
  
  // Filter data for current staff
  const myLeads = mockLeads.filter(l => l.createdBy === user?.id || l.createdBy === '3');
  const myTasks = mockTasks.filter(t => t.assignedTo === user?.id || t.assignedTo === '3');
  const myLeaves = mockLeaves.filter(l => l.userId === user?.id || l.userId === '3');

  const pendingLeaves = myLeaves.filter(l => l.status === 'pending').length;

  return (
    <div className="min-h-screen">
      <TopBar title="Staff Dashboard" subtitle={`Welcome back, ${user?.name}!`} />
      
      <div className="p-6 space-y-6">
        {/* Announcements */}
        <AnnouncementBanner announcements={mockAnnouncements} userRole="staff" />
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="My Leads"
            value={myLeads.length}
            change={`${myLeads.filter(l => l.status === 'interested').length} interested`}
            changeType="positive"
            icon={ClipboardList}
            iconColor="gradient-primary"
            delay={0}
          />
          <StatCard
            title="Active Tasks"
            value={myTasks.filter(t => t.status !== 'completed' && t.status !== 'rejected').length}
            change="In progress"
            changeType="neutral"
            icon={CheckSquare}
            iconColor="gradient-accent"
            delay={50}
          />
          <StatCard
            title="Reminders"
            value={myLeads.filter(l => l.status === 'reminder').length}
            change="Follow-ups pending"
            changeType="neutral"
            icon={Bell}
            iconColor="bg-info"
            delay={100}
          />
          <StatCard
            title="Leave Status"
            value={pendingLeaves > 0 ? `${pendingLeaves} Pending` : 'All Clear'}
            change={pendingLeaves > 0 ? 'Awaiting approval' : 'No pending requests'}
            changeType="neutral"
            icon={CalendarOff}
            iconColor="bg-warning"
            delay={150}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leads by Status Chart - Interactive */}
          <LeadStatusChart leads={myLeads} title="My Leads by Status" />

          {/* Tasks by Status Chart - Interactive */}
          <TaskStatusChart tasks={myTasks} title="My Tasks by Status" />

          {/* Reminders Widget */}
          <RemindersWidget leads={myLeads} tasks={myTasks} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              Recent Tasks
            </h3>
            
            {myTasks.length > 0 ? (
              <div className="space-y-3">
                {myTasks.slice(0, 5).map((task, index) => (
                  <div 
                    key={task.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold">
                      {task.lead.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{task.lead.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {task.lead.requirementType} • {task.lead.bhkRequirement} BHK
                      </p>
                    </div>
                    <TaskStatusChip status={task.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No tasks assigned yet
              </div>
            )}
          </div>

          {/* Recent Leads */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              My Recent Leads
            </h3>
            
            <div className="space-y-3">
              {myLeads.slice(0, 5).map((lead, index) => (
                <div 
                  key={lead.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{lead.name}</p>
                      <LeadStatusChip status={lead.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{lead.phone}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground shrink-0">
                    <p className="capitalize">{lead.requirementType}</p>
                    <p className="text-xs">{format(lead.createdAt, 'MMM dd')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
