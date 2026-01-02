import { Task } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface TaskStatusChartProps {
  tasks: Task[];
  title?: string;
}

export default function TaskStatusChart({ tasks, title = "Tasks by Status" }: TaskStatusChartProps) {
  const tasksByStatus = [
    { name: 'Visit', value: tasks.filter(t => t.status === 'visit').length, color: 'hsl(215, 80%, 50%)' },
    { name: 'Family Visit', value: tasks.filter(t => t.status === 'family_visit').length, color: 'hsl(280, 70%, 55%)' },
    { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: 'hsl(38, 95%, 55%)' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: 'hsl(160, 70%, 40%)' },
    { name: 'Rejected', value: tasks.filter(t => t.status === 'rejected').length, color: 'hsl(0, 75%, 55%)' },
  ].filter(item => item.value > 0);

  if (tasksByStatus.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-slide-up">
        <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No tasks data available
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 animate-slide-up">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={tasksByStatus}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {tasksByStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {tasksByStatus.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
