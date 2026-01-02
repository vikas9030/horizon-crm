import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/dashboard/StatCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import TaskStatusChart from '@/components/dashboard/TaskStatusChart';
import LeadStatusChart from '@/components/dashboard/LeadStatusChart';
import ProjectStatusChart from '@/components/dashboard/ProjectStatusChart';
import RemindersWidget from '@/components/dashboard/RemindersWidget';
import { mockLeads, mockTasks, mockProjects, mockLeaves, mockActivities } from '@/data/mockData';
import { ClipboardList, CheckSquare, Building, CalendarOff, Users, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
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
          {/* Leads by Status Chart - Interactive */}
          <LeadStatusChart leads={mockLeads} />

          {/* Tasks by Status Chart - Interactive */}
          <TaskStatusChart tasks={mockTasks} />

          {/* Projects by Status Chart - Interactive */}
          <ProjectStatusChart projects={mockProjects} />
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
