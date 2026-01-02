import { Lead, Task } from '@/types';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { Bell, Calendar, Phone, ClipboardList, CheckSquare } from 'lucide-react';
import LeadStatusChip from '@/components/leads/LeadStatusChip';
import TaskStatusChip from '@/components/tasks/TaskStatusChip';

interface RemindersWidgetProps {
  leads: Lead[];
  tasks: Task[];
}

export default function RemindersWidget({ leads, tasks }: RemindersWidgetProps) {
  const today = new Date();
  const nextWeek = addDays(today, 7);

  // Get leads with reminder status and upcoming follow-up dates
  const upcomingLeadReminders = leads.filter(l => 
    l.status === 'reminder' && 
    l.followUpDate && 
    isAfter(l.followUpDate, today) &&
    isBefore(l.followUpDate, nextWeek)
  ).sort((a, b) => a.followUpDate!.getTime() - b.followUpDate!.getTime());

  // Get tasks with upcoming action dates
  const upcomingTaskReminders = tasks.filter(t => 
    t.nextActionDate && 
    isAfter(t.nextActionDate, today) &&
    isBefore(t.nextActionDate, nextWeek) &&
    t.status !== 'completed' && 
    t.status !== 'rejected'
  ).sort((a, b) => a.nextActionDate!.getTime() - b.nextActionDate!.getTime());

  const totalReminders = upcomingLeadReminders.length + upcomingTaskReminders.length;

  return (
    <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5 text-primary" />
        Upcoming Reminders
        {totalReminders > 0 && (
          <span className="ml-auto text-sm bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
            {totalReminders} this week
          </span>
        )}
      </h3>

      {totalReminders === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No upcoming reminders this week
        </div>
      ) : (
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {/* Lead Reminders */}
          {upcomingLeadReminders.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ClipboardList className="w-4 h-4" />
                Lead Follow-ups
              </div>
              {upcomingLeadReminders.map((lead, index) => (
                <div 
                  key={lead.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-info/5 border border-info/20 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-10 h-10 rounded-full bg-info/20 flex items-center justify-center text-info shrink-0">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{lead.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span className="truncate">{lead.phone}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-sm text-info mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(lead.followUpDate!, 'MMM dd')}
                    </div>
                    <LeadStatusChip status={lead.status} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Task Reminders */}
          {upcomingTaskReminders.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CheckSquare className="w-4 h-4" />
                Task Actions
              </div>
              {upcomingTaskReminders.map((task, index) => (
                <div 
                  key={task.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-accent/5 border border-accent/20 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-white shrink-0">
                    {task.lead.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{task.lead.name}</p>
                    <p className="text-sm text-muted-foreground capitalize truncate">
                      {task.lead.requirementType} • {task.lead.bhkRequirement} BHK
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-sm text-accent mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(task.nextActionDate!, 'MMM dd')}
                    </div>
                    <TaskStatusChip status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
