import { useState, useMemo } from 'react';
import { Leave, LeaveStatus } from '@/types';
import { mockLeaves } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
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
import { Search, Plus, Calendar, Check, X, FileText, ExternalLink } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

interface ExtendedLeave extends Leave {
  documentUrl?: string;
}

interface LeaveListProps {
  canApprove?: boolean;
  canCreate?: boolean;
  showOnlyPending?: boolean;
}

export default function LeaveList({ canApprove = false, canCreate = false, showOnlyPending = false }: LeaveListProps) {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<ExtendedLeave[]>(mockLeaves as ExtendedLeave[]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(showOnlyPending ? 'pending' : 'all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Count previous leaves for current user (to determine if document is required)
  const userPreviousLeaveCount = useMemo(() => {
    if (!user) return 0;
    return leaves.filter(l => l.userId === user.id || l.userId === '3').length; // '3' is demo staff
  }, [leaves, user]);

  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = leave.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
    
    // Admin can see all, Manager can see staff leaves + own, Staff can see their own
    let hasAccess = true;
    if (user?.role === 'manager') {
      hasAccess = leave.userRole === 'staff' || leave.userId === user.id;
    } else if (user?.role === 'staff') {
      hasAccess = leave.userId === user.id || leave.userId === '3'; // '3' is the demo staff ID
    }
    
    return matchesSearch && matchesStatus && hasAccess;
  });

  // Check if current user can view a leave's document
  const canViewDocument = (leave: ExtendedLeave): boolean => {
    if (!leave.documentUrl) return false;
    
    // Admin can see all documents
    if (user?.role === 'admin') return true;
    
    // Manager can see staff documents and their own
    if (user?.role === 'manager') {
      return leave.userRole === 'staff' || leave.userId === user.id;
    }
    
    // Staff can only see their own documents
    if (user?.role === 'staff') {
      return leave.userId === user.id || leave.userId === '3';
    }
    
    return false;
  };

  const handleApprove = (leaveId: string) => {
    setLeaves(prev => prev.map(l => 
      l.id === leaveId ? { ...l, status: 'approved' as LeaveStatus, approvedBy: user?.id } : l
    ));
    toast.success('Leave request approved');
  };

  const handleReject = (leaveId: string) => {
    setLeaves(prev => prev.map(l => 
      l.id === leaveId ? { ...l, status: 'rejected' as LeaveStatus, approvedBy: user?.id } : l
    ));
    toast.success('Leave request rejected');
  };

  const handleCreateLeave = (leaveData: Partial<ExtendedLeave>) => {
    const newLeave: ExtendedLeave = {
      ...leaveData as ExtendedLeave,
      id: String(Date.now()),
      createdAt: new Date(),
    };
    setLeaves(prev => [newLeave, ...prev]);
    toast.success('Leave request submitted successfully');
  };

  const canApproveLeave = (leave: ExtendedLeave) => {
    if (!canApprove) return false;
    if (leave.status !== 'pending') return false;
    
    // Admin can approve all leaves
    if (user?.role === 'admin') return true;
    
    // Manager can only approve staff leaves
    if (user?.role === 'manager' && leave.userRole === 'staff') return true;
    
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
                    <p className="font-medium text-foreground">{leave.userName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{leave.userRole}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{getLeaveTypeLabel(leave.type)}</p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <div>
                      <p>{format(leave.startDate, 'MMM dd')} - {format(leave.endDate, 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-muted-foreground">
                        {differenceInDays(leave.endDate, leave.startDate) + 1} day(s)
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
                  {leave.documentUrl && canViewDocument(leave) ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDocument(leave.documentUrl!)}
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
                  <LeaveStatusChip status={leave.status} />
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
