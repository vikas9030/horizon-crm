import { useState } from 'react';
import { Lead, LeadStatus } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { X, Phone, Mail, Calendar } from 'lucide-react';
import LeadStatusChip from '@/components/leads/LeadStatusChip';
import { format } from 'date-fns';

interface LeadStatusChartProps {
  leads: Lead[];
  title?: string;
}

const statusMap: Record<string, LeadStatus> = {
  'Interested': 'interested',
  'Not Interested': 'not_interested',
  'Pending': 'pending',
  'Reminder': 'reminder',
};

export default function LeadStatusChart({ leads, title = "Leads by Status" }: LeadStatusChartProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const leadsByStatus = [
    { name: 'Interested', value: leads.filter(l => l.status === 'interested').length, color: 'hsl(160, 70%, 40%)', status: 'interested' },
    { name: 'Pending', value: leads.filter(l => l.status === 'pending').length, color: 'hsl(38, 95%, 55%)', status: 'pending' },
    { name: 'Reminder', value: leads.filter(l => l.status === 'reminder').length, color: 'hsl(200, 80%, 50%)', status: 'reminder' },
    { name: 'Not Interested', value: leads.filter(l => l.status === 'not_interested').length, color: 'hsl(0, 75%, 55%)', status: 'not_interested' },
  ].filter(item => item.value > 0);

  const filteredLeads = selectedStatus 
    ? leads.filter(l => l.status === statusMap[selectedStatus])
    : [];

  const handleClick = (data: any, index: number) => {
    if (selectedStatus === data.name) {
      setSelectedStatus(null);
      setActiveIndex(null);
    } else {
      setSelectedStatus(data.name);
      setActiveIndex(index);
    }
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 4}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
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
              activeIndex={activeIndex !== null ? activeIndex : undefined}
              activeShape={renderActiveShape}
              onClick={handleClick}
              className="cursor-pointer"
            >
              {leadsByStatus.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {leadsByStatus.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              if (selectedStatus === item.name) {
                setSelectedStatus(null);
                setActiveIndex(null);
              } else {
                setSelectedStatus(item.name);
                setActiveIndex(leadsByStatus.findIndex(s => s.name === item.name));
              }
            }}
            className={`flex items-center gap-2 px-2 py-1 rounded-md transition-all ${
              selectedStatus === item.name ? 'bg-muted ring-2 ring-primary' : 'hover:bg-muted/50'
            }`}
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
          </button>
        ))}
      </div>

      {/* Filtered Details */}
      {selectedStatus && filteredLeads.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-foreground">
              {selectedStatus} Leads ({filteredLeads.length})
            </h4>
            <button
              onClick={() => { setSelectedStatus(null); setActiveIndex(null); }}
              className="p-1 hover:bg-muted rounded-md transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{lead.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {lead.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {lead.email}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <LeadStatusChip status={lead.status} />
                  {lead.followUpDate && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(lead.followUpDate, 'MMM dd')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
