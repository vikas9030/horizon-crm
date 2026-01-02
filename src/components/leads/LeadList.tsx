import { useState } from 'react';
import { Lead } from '@/types';
import { mockLeads } from '@/data/mockData';
import LeadStatusChip from './LeadStatusChip';
import LeadFormModal from './LeadFormModal';
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
import { format } from 'date-fns';
import { toast } from 'sonner';

interface LeadListProps {
  canCreate?: boolean;
  canEdit?: boolean;
  canConvert?: boolean;
}

export default function LeadList({ canCreate = true, canEdit = true, canConvert = true }: LeadListProps) {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
      if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
      return `$${val}`;
    };
    return `${formatValue(min)} - ${formatValue(max)}`;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
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
        </div>

        {canCreate && (
          <Button onClick={() => setIsFormOpen(true)} className="btn-accent shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        )}
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
              <TableHead className="font-semibold">Contact</TableHead>
              <TableHead className="font-semibold">Requirement</TableHead>
              <TableHead className="font-semibold">Budget</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Follow-up</TableHead>
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
                    <p className="text-xs text-muted-foreground capitalize">{lead.source || 'Direct'}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      {lead.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      {lead.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm capitalize">{lead.requirementType}</p>
                    <p className="text-xs text-muted-foreground">{lead.bhkRequirement} BHK</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium">{formatBudget(lead.budgetMin, lead.budgetMax)}</p>
                </TableCell>
                <TableCell>
                  <LeadStatusChip status={lead.status} />
                </TableCell>
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
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
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
    </div>
  );
}
