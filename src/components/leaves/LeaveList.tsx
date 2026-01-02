import { useState, useEffect, useMemo } from 'react';
import { Leave, LeaveStatus } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import LeaveStatusChip from './LeaveStatusChip';
import LeaveFormModal from './LeaveFormModal';
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
import { Search, Plus, Calendar, Check, X, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

interface LeaveRecord {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  document_url: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

interface LeaveListProps {
  canApprove?: boolean;
  canCreate?: boolean;
  showOnlyPending?: boolean;
}

export default function LeaveList({ canApprove = false, canCreate = false, showOnlyPending = false }: LeaveListProps) {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(showOnlyPending ? 'pending' : 'all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fetch leaves from Supabase
  const fetchLeaves = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leaves')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leaves:', error);
        toast.error('Failed to load leaves');
        return;
      }

      setLeaves(data || []);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [user]);

  // Count previous leaves for current user (to determine if document is required)
  const userPreviousLeaveCount = useMemo(() => {
    if (!user) return 0;
    return leaves.filter(l => l.user_id === user.id).length;
  }, [leaves, user]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter(leave => {
      const matchesSearch = leave.user_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
      
      // Role-based access filtering
      let hasAccess = true;
      if (user?.role === 'manager') {
        hasAccess = leave.user_role === 'staff' || leave.user_id === user.id;
      } else if (user?.role === 'staff') {
        hasAccess = leave.user_id === user.id;
      }
      
      return matchesSearch && matchesStatus && hasAccess;
    });
  }, [leaves, searchQuery, statusFilter, user]);

  // Check if current user can view a leave's document
  const canViewDocument = (leave: LeaveRecord): boolean => {
    if (!leave.document_url) return false;
    
    // Admin can see all documents
    if (user?.role === 'admin') return true;
    
    // Manager can see staff documents and their own
    if (user?.role === 'manager') {
      return leave.user_role === 'staff' || leave.user_id === user.id;
    }
    
    // Staff can only see their own documents
    if (user?.role === 'staff') {
      return leave.user_id === user.id;
    }
    
    return false;
  };

  const handleApprove = async (leaveId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('leaves')
        .update({ 
          status: 'approved', 
          approved_by: user.id 
        })
        .eq('id', leaveId);

      if (error) {
        console.error('Error approving leave:', error);
        toast.error('Failed to approve leave');
        return;
      }

      setLeaves(prev => prev.map(l => 
        l.id === leaveId ? { ...l, status: 'approved', approved_by: user.id } : l
      ));
      toast.success('Leave request approved');
    } catch (error) {
      console.error('Error approving leave:', error);
      toast.error('Failed to approve leave');
    }
  };

  const handleReject = async (leaveId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('leaves')
        .update({ 
          status: 'rejected', 
          approved_by: user.id 
        })
        .eq('id', leaveId);

      if (error) {
        console.error('Error rejecting leave:', error);
        toast.error('Failed to reject leave');
        return;
      }

      setLeaves(prev => prev.map(l => 
        l.id === leaveId ? { ...l, status: 'rejected', approved_by: user.id } : l
      ));
      toast.success('Leave request rejected');
    } catch (error) {
      console.error('Error rejecting leave:', error);
      toast.error('Failed to reject leave');
    }
  };

  const handleCreateLeave = async (leaveData: Partial<Leave> & { documentUrl?: string }) => {
    if (!user) return;
    
    try {
      const insertData = {
        user_id: user.id,
        user_name: user.name,
        user_role: user.role,
        leave_type: leaveData.type || 'casual',
        start_date: leaveData.startDate ? format(leaveData.startDate, 'yyyy-MM-dd') : '',
        end_date: leaveData.endDate ? format(leaveData.endDate, 'yyyy-MM-dd') : '',
        reason: leaveData.reason || '',
        status: 'pending',
        document_url: leaveData.documentUrl || null,
      };

      const { data, error } = await supabase
        .from('leaves')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating leave:', error);
        toast.error('Failed to submit leave request');
        return;
      }

      if (data) {
        setLeaves(prev => [data, ...prev]);
        toast.success('Leave request submitted successfully');
      }
    } catch (error) {
      console.error('Error creating leave:', error);
      toast.error('Failed to submit leave request');
    }
  };

  const canApproveLeave = (leave: LeaveRecord) => {
    if (!canApprove) return false;
    if (leave.status !== 'pending') return false;
    
    // Admin can approve all leaves
    if (user?.role === 'admin') return true;
    
    // Manager can only approve staff leaves
    if (user?.role === 'manager' && leave.user_role === 'staff') return true;
    
    return false;
  };

  const getLeaveTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sick: 'Sick Leave',
      casual: 'Casual Leave',
      annual: 'Annual Leave',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
          
          {!showOnlyPending && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {canCreate && (
          <Button className="btn-accent shrink-0" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Apply Leave
          </Button>
        )}
      </div>

      {/* Leave Stats */}
      {canCreate && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-xl">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Leaves</p>
            <p className="text-2xl font-bold text-foreground">{leaves.filter(l => l.user_id === user?.id).length}</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-warning">{leaves.filter(l => l.user_id === user?.id && l.status === 'pending').length}</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Approved</p>
            <p className="text-2xl font-bold text-success">{leaves.filter(l => l.user_id === user?.id && l.status === 'approved').length}</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Rejected</p>
            <p className="text-2xl font-bold text-destructive">{leaves.filter(l => l.user_id === user?.id && l.status === 'rejected').length}</p>
          </div>
        </div>
      )}

      {/* Admin/Manager Stats */}
      {canApprove && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-xl">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Requests</p>
            <p className="text-2xl font-bold text-foreground">{filteredLeaves.length}</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-warning">{filteredLeaves.filter(l => l.status === 'pending').length}</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Approved</p>
            <p className="text-2xl font-bold text-success">{filteredLeaves.filter(l => l.status === 'approved').length}</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Rejected</p>
            <p className="text-2xl font-bold text-destructive">{filteredLeaves.filter(l => l.status === 'rejected').length}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Employee</TableHead>
              <TableHead className="font-semibold">Leave Type</TableHead>
              <TableHead className="font-semibold">Duration</TableHead>
              <TableHead className="font-semibold">Reason</TableHead>
              <TableHead className="font-semibold">Document</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              {canApprove && <TableHead className="font-semibold w-32">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeaves.map((leave, index) => (
              <TableRow 
                key={leave.id} 
                className="table-row-hover animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{leave.user_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{leave.user_role}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{getLeaveTypeLabel(leave.leave_type)}</p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <div>
                      <p>{format(new Date(leave.start_date), 'MMM dd')} - {format(new Date(leave.end_date), 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-muted-foreground">
                        {differenceInDays(new Date(leave.end_date), new Date(leave.start_date)) + 1} day(s)
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                    {leave.reason}
                  </p>
                </TableCell>
                <TableCell>
                  {leave.document_url && canViewDocument(leave) ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDocument(leave.document_url!)}
                      className="text-primary hover:text-primary"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      View
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <LeaveStatusChip status={leave.status as LeaveStatus} />
                </TableCell>
                {canApprove && (
                  <TableCell>
                    {canApproveLeave(leave) ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                          onClick={() => handleApprove(leave.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleReject(leave.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredLeaves.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No leave requests found</p>
          </div>
        )}
      </div>

      <LeaveFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleCreateLeave}
        previousLeaveCount={userPreviousLeaveCount}
      />
    </div>
  );
}
