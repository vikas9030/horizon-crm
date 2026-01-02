import { useState } from 'react';
import { Project, ProjectStatus } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { X, MapPin, Calendar, Building } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectStatusChartProps {
  projects: Project[];
  title?: string;
}

const statusMap: Record<string, ProjectStatus> = {
  'Ongoing': 'ongoing',
  'Upcoming': 'upcoming',
  'Completed': 'completed',
};

const statusColors: Record<string, string> = {
  'Ongoing': 'hsl(215, 80%, 50%)',
  'Upcoming': 'hsl(38, 95%, 55%)',
  'Completed': 'hsl(160, 70%, 40%)',
};

export default function ProjectStatusChart({ projects, title = "Projects Overview" }: ProjectStatusChartProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const projectsByStatus = [
    { name: 'Ongoing', count: projects.filter(p => p.status === 'ongoing').length },
    { name: 'Upcoming', count: projects.filter(p => p.status === 'upcoming').length },
    { name: 'Completed', count: projects.filter(p => p.status === 'completed').length },
  ].filter(item => item.count > 0);

  const filteredProjects = selectedStatus 
    ? projects.filter(p => p.status === statusMap[selectedStatus])
    : [];

  const handleClick = (data: any) => {
    if (selectedStatus === data.name) {
      setSelectedStatus(null);
    } else {
      setSelectedStatus(data.name);
    }
  };

  const formatPrice = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  return (
    <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={projectsByStatus} layout="vertical">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar 
              dataKey="count" 
              radius={[0, 8, 8, 0]}
              onClick={handleClick}
              className="cursor-pointer"
            >
              {projectsByStatus.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={selectedStatus === entry.name ? statusColors[entry.name] : 'hsl(215, 80%, 35%)'}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {projectsByStatus.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              if (selectedStatus === item.name) {
                setSelectedStatus(null);
              } else {
                setSelectedStatus(item.name);
              }
            }}
            className={`flex items-center gap-2 px-2 py-1 rounded-md transition-all ${
              selectedStatus === item.name ? 'bg-muted ring-2 ring-primary' : 'hover:bg-muted/50'
            }`}
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors[item.name] }} />
            <span className="text-xs text-muted-foreground">{item.name} ({item.count})</span>
          </button>
        ))}
      </div>

      {/* Filtered Details */}
      {selectedStatus && filteredProjects.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-foreground">
              {selectedStatus} Projects ({filteredProjects.length})
            </h4>
            <button
              onClick={() => setSelectedStatus(null)}
              className="p-1 hover:bg-muted rounded-md transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                  <img 
                    src={project.coverImage} 
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{project.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {project.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {project.type}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-foreground">
                    {formatPrice(project.priceMin)} - {formatPrice(project.priceMax)}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                    <Calendar className="w-3 h-3" />
                    {format(project.possessionDate, 'MMM yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
