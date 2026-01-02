import { useState, useMemo } from 'react';
import { Lead } from '@/types';
import { mockLeads, mockProjects } from '@/data/mockData';
import LeadStatusChip from './LeadStatusChip';
import LeadFormModal from './LeadFormModal';
import LeadDetailsModal from './LeadDetailsModal';
import ExcelImportExport from './ExcelImportExport';
import StaffProfileChip from '@/components/common/StaffProfileChip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  CheckSquare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface LeadListProps {
  canCreate?: boolean;
  canEdit?: boolean;
  canConvert?: boolean;
  isManagerView?: boolean;
  isStaffView?: boolean;
  userId?: string;
}

import { useAuth } from '@/contexts/AuthContext';

export default function LeadList({ canCreate = true, canEdit = true, canConvert = true, isManagerView = false, isStaffView = false, userId }: LeadListProps) {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery);
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      
      const matchesProject = projectFilter === 'all' || lead.assignedProject === projectFilter;
      
      // Date filter
      let matchesDate = true;
      if (dateRange.from && dateRange.to) {
        matchesDate = isWithinInterval(new Date(lead.createdAt), {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to),
        });
      } else if (dateRange.from) {
        matchesDate = new Date(lead.createdAt) >= startOfDay(dateRange.from);
      }
      
      // Role-based filtering: Staff can only see their own leads
      let hasAccess = true;
      if (isStaffView && userId) {
        hasAccess = lead.createdBy === userId || lead.createdBy === '3'; // '3' is demo staff
      }
      
      return matchesSearch && matchesStatus && matchesProject && matchesDate && hasAccess;
    });
  }, [leads, searchQuery, statusFilter, projectFilter, dateRange, isStaffView, userId]);

  const handleSaveLead = (leadData: Partial<Lead>) => {
    if (editingLead) {
      setLeads(prev => prev.map(l => 
        l.id === editingLead.id ? { ...l, ...leadData, updatedAt: new Date() } : l
      ));
      toast.success('Lead updated successfully');
    } else {
      const newLead: Lead = {
        ...leadData as Lead,
        id: String(Date.now()),
        notes: [],
        createdBy: '3',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setLeads(prev => [newLead, ...prev]);
      toast.success('Lead created successfully');
    }
    setIsFormOpen(false);
    setEditingLead(null);
  };

  const handleConvertToTask = (lead: Lead) => {
    toast.success(`Lead "${lead.name}" converted to task`, {
      description: 'You can now track this lead in the Tasks module.',
    });
  };

  const handleDeleteLead = (lead: Lead) => {
    setLeads(prev => prev.filter(l => l.id !== lead.id));
    toast.success('Lead deleted successfully');
  };

  const formatBudget = (min: number, max: number) => {
    const formatValue = (val: number) => {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(0)} L`;
      if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
      return `₹${val}`;
    };
    return `${formatValue(min)} - ${formatValue(max)}`;
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return '-';
    const project = mockProjects.find(p => p.id === projectId);
    return project ? project.name : '-';
  };

  const handleStatusChange = (leadId: string, newStatus: Lead['status']) => {
    setLeads(prev => prev.map(l => 
      l.id === leadId ? { ...l, status: newStatus, updatedAt: new Date() } : l
    ));
    toast.success('Lead status updated');
  };

  const handleImportLeads = (importedLeads: Partial<Lead>[]) => {
    const newLeads: Lead[] = importedLeads.map((leadData, index) => ({
      ...leadData as Lead,
      id: String(Date.now() + index),
      notes: [],
      createdBy: '3',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    setLeads(prev => [...newLeads, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:max-w-xs min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="interested">Interested</SelectItem>
              <SelectItem value="not_interested">Not Interested</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {mockProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal min-w-[200px]">
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM dd, yyyy")
                  )
                ) : (
                  "Filter by date"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {dateRange.from && (
            <Button variant="ghost" size="sm" onClick={() => setDateRange({})}>
              Clear dates
            </Button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <ExcelImportExport onImport={handleImportLeads} />
          {canCreate && (
            <Button onClick={() => setIsFormOpen(true)} className="btn-accent shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">
                <div className="flex items-center gap-2">
                  Name
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </TableHead>
              {!isManagerView && <TableHead className="font-semibold">Phone</TableHead>}
              {!isManagerView && <TableHead className="font-semibold">Contact</TableHead>}
              {!isManagerView && <TableHead className="font-semibold">Requirement</TableHead>}
              {!isManagerView && <TableHead className="font-semibold">Budget</TableHead>}
              <TableHead className="font-semibold">Project</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Created By</TableHead>
              {!isManagerView && <TableHead className="font-semibold">Follow-up</TableHead>}
              <TableHead className="font-semibold w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead, index) => (
              <TableRow 
                key={lead.id} 
                className="table-row-hover animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{lead.name}</p>
                    {!isManagerView && <p className="text-xs text-muted-foreground capitalize">{lead.source || 'Direct'}</p>}
                  </div>
                </TableCell>
                {!isManagerView && (
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      {lead.phone}
                    </div>
                  </TableCell>
                )}
                {!isManagerView && (
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      {lead.email}
                    </div>
                  </TableCell>
                )}
                {!isManagerView && (
                  <TableCell>
                    <div>
                      <p className="text-sm capitalize">{lead.requirementType}</p>
                      <p className="text-xs text-muted-foreground">{lead.bhkRequirement} BHK</p>
                    </div>
                  </TableCell>
                )}
                {!isManagerView && (
                  <TableCell>
                    <p className="text-sm font-medium">{formatBudget(lead.budgetMin, lead.budgetMax)}</p>
                  </TableCell>
                )}
                <TableCell>
                  <p className="text-sm font-medium">{getProjectName(lead.assignedProject)}</p>
                </TableCell>
                <TableCell>
                  <Select 
                    value={lead.status} 
                    onValueChange={(value) => handleStatusChange(lead.id, value as Lead['status'])}
                  >
                    <SelectTrigger className="w-36 h-8">
                      <LeadStatusChip status={lead.status} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interested">Interested</SelectItem>
                      <SelectItem value="not_interested">Not Interested</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <StaffProfileChip userId={lead.createdBy} showDetails={!isManagerView} />
                </TableCell>
                {!isManagerView && (
                  <TableCell>
                    {lead.followUpDate ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(lead.followUpDate, 'MMM dd, yyyy')}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewingLead(lead)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {canEdit && (
                        <DropdownMenuItem onClick={() => { setEditingLead(lead); setIsFormOpen(true); }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Lead
                        </DropdownMenuItem>
                      )}
                      {canConvert && (
                        <DropdownMenuItem onClick={() => handleConvertToTask(lead)}>
                          <CheckSquare className="w-4 h-4 mr-2" />
                          Convert to Task
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteLead(lead)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No leads found</p>
          </div>
        )}
      </div>

      <LeadFormModal
        open={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingLead(null); }}
        onSave={handleSaveLead}
        lead={editingLead}
      />

      <LeadDetailsModal
        open={!!viewingLead}
        onClose={() => setViewingLead(null)}
        lead={viewingLead}
        isManagerView={isManagerView}
      />
    </div>
  );
}
