import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/dashboard/StatCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import TaskStatusChart from '@/components/dashboard/TaskStatusChart';
import RemindersWidget from '@/components/dashboard/RemindersWidget';
import { mockLeads, mockTasks, mockProjects, mockLeaves, mockActivities } from '@/data/mockData';
import { ClipboardList, CheckSquare, Building, CalendarOff, Users, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function AdminDashboard() {
  const leadsByStatus = [
    { name: 'Interested', value: mockLeads.filter(l => l.status === 'interested').length, color: 'hsl(160, 70%, 40%)' },
    { name: 'Pending', value: mockLeads.filter(l => l.status === 'pending').length, color: 'hsl(38, 95%, 55%)' },
    { name: 'Reminder', value: mockLeads.filter(l => l.status === 'reminder').length, color: 'hsl(200, 80%, 50%)' },
    { name: 'Not Interested', value: mockLeads.filter(l => l.status === 'not_interested').length, color: 'hsl(0, 75%, 55%)' },
  ];

  const projectsByStatus = [
    { name: 'Ongoing', count: mockProjects.filter(p => p.status === 'ongoing').length },
    { name: 'Upcoming', count: mockProjects.filter(p => p.status === 'upcoming').length },
    { name: 'Completed', count: mockProjects.filter(p => p.status === 'completed').length },
  ];

  const pendingLeaves = mockLeaves.filter(l => l.status === 'pending').length;

  return (
    <div className="min-h-screen">
      <TopBar title="Admin Dashboard" subtitle="Welcome back! Here's your overview." />
      
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Total Leads"
            value={mockLeads.length}
            change="+12% from last month"
            changeType="positive"
            icon={ClipboardList}
            iconColor="gradient-primary"
            delay={0}
          />
          <StatCard
            title="Active Tasks"
            value={mockTasks.filter(t => t.status !== 'completed' && t.status !== 'rejected').length}
            change="3 due this week"
            changeType="neutral"
            icon={CheckSquare}
            iconColor="bg-info"
            delay={50}
          />
          <StatCard
            title="Projects"
            value={mockProjects.length}
            change={`${mockProjects.filter(p => p.status === 'ongoing').length} ongoing`}
            changeType="neutral"
            icon={Building}
            iconColor="gradient-accent"
            delay={100}
          />
          <StatCard
            title="Pending Leaves"
            value={pendingLeaves}
            change="Requires attention"
            changeType={pendingLeaves > 0 ? 'negative' : 'neutral'}
            icon={CalendarOff}
            iconColor="bg-warning"
            delay={150}
          />
          <StatCard
            title="Team Members"
            value={3}
            change="1 manager, 2 staff"
            changeType="neutral"
            icon={Users}
            iconColor="bg-primary"
            delay={200}
          />
          <StatCard
            title="Conversion Rate"
            value="24%"
            change="+5% from last month"
            changeType="positive"
            icon={TrendingUp}
            iconColor="gradient-success"
            delay={250}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leads by Status Chart */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-semibold text-foreground mb-4">Leads by Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {leadsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {leadsByStatus.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks by Status Chart */}
          <TaskStatusChart tasks={mockTasks} />

          {/* Projects by Status Chart */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <h3 className="text-lg font-semibold text-foreground mb-4">Projects Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectsByStatus} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(215, 80%, 35%)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reminders Widget */}
          <RemindersWidget leads={mockLeads} tasks={mockTasks} />

          {/* Activity Feed */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <ActivityFeed activities={mockActivities} />
          </div>
        </div>
      </div>
    </div>
  );
}
