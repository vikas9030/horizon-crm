import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/dashboard/StatCard';
import AnnouncementBanner from '@/components/announcements/AnnouncementBanner';
import { mockLeads, mockTasks, mockLeaves, mockAnnouncements } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardList, CheckSquare, CalendarOff, Bell, Target, Clock } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import LeadStatusChip from '@/components/leads/LeadStatusChip';
import TaskStatusChip from '@/components/tasks/TaskStatusChip';
import { Calendar } from 'lucide-react';

export default function StaffDashboard() {
  const { user } = useAuth();
  
  // Filter data for current staff
  const myLeads = mockLeads.filter(l => l.createdBy === user?.id || l.createdBy === '3');
  const myTasks = mockTasks.filter(t => t.assignedTo === user?.id || t.assignedTo === '3');
  const myLeaves = mockLeaves.filter(l => l.userId === user?.id || l.userId === '3');
  
  const upcomingReminders = myLeads.filter(l => 
    l.status === 'reminder' && 
    l.followUpDate && 
    isAfter(l.followUpDate, new Date()) &&
    isBefore(l.followUpDate, addDays(new Date(), 7))
  );

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
            title="Upcoming Reminders"
            value={upcomingReminders.length}
            change="This week"
            changeType={upcomingReminders.length > 0 ? 'negative' : 'neutral'}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Reminders */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Upcoming Follow-ups
            </h3>
            
            {upcomingReminders.length > 0 ? (
              <div className="space-y-3">
                {upcomingReminders.map((lead, index) => (
                  <div 
                    key={lead.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-info/5 border border-info/20 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="w-10 h-10 rounded-full bg-info/20 flex items-center justify-center text-info">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.phone}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-info">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(lead.followUpDate!, 'MMM dd, yyyy')}
                      </div>
                      <LeadStatusChip status={lead.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming reminders this week
              </div>
            )}
          </div>

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
        </div>

        {/* Recent Leads */}
        <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            My Recent Leads
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myLeads.slice(0, 6).map((lead, index) => (
              <div 
                key={lead.id}
                className="p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-foreground">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.phone}</p>
                  </div>
                  <LeadStatusChip status={lead.status} />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="capitalize">{lead.requirementType} • {lead.bhkRequirement} BHK</p>
                  <p className="text-xs mt-1">
                    Created {format(lead.createdAt, 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
