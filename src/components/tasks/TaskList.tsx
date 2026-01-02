import { useState } from 'react';
import { Task, TaskStatus } from '@/types';
import { mockTasks } from '@/data/mockData';
import TaskStatusChip from './TaskStatusChip';
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
import { Search, Calendar, MoreHorizontal, Eye, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface TaskListProps {
  canEdit?: boolean;
  isManagerView?: boolean;
}

export default function TaskList({ canEdit = true, isManagerView = false }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date() } : t
    ));
    toast.success('Task status updated');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
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
            <SelectItem value="visit">Visit</SelectItem>
            <SelectItem value="family_visit">Family Visit</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Lead Name</TableHead>
              {!isManagerView && <TableHead className="font-semibold">Contact</TableHead>}
              {!isManagerView && <TableHead className="font-semibold">Requirement</TableHead>}
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Assigned To</TableHead>
              {!isManagerView && <TableHead className="font-semibold">Next Action</TableHead>}
              <TableHead className="font-semibold">Created</TableHead>
              <TableHead className="font-semibold w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task, index) => (
              <TableRow 
                key={task.id} 
                className="table-row-hover animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>
                  <p className="font-medium text-foreground">{task.lead.name}</p>
                </TableCell>
                {!isManagerView && (
                  <TableCell>
                    <div>
                      <p className="text-sm text-muted-foreground">{task.lead.email}</p>
                      <p className="text-sm text-muted-foreground">{task.lead.phone}</p>
                    </div>
                  </TableCell>
                )}
                {!isManagerView && (
                  <TableCell>
                    <div>
                      <p className="text-sm capitalize">{task.lead.requirementType}</p>
                      <p className="text-xs text-muted-foreground">{task.lead.bhkRequirement} BHK</p>
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  {canEdit ? (
                    <Select
                      value={task.status}
                      onValueChange={(value: TaskStatus) => handleStatusChange(task.id, value)}
                    >
                      <SelectTrigger className="w-36 h-8 text-xs">
                        <TaskStatusChip status={task.status} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visit">Visit</SelectItem>
                        <SelectItem value="family_visit">Family Visit</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <TaskStatusChip status={task.status} />
                  )}
                </TableCell>
                <TableCell>
                  <StaffProfileChip userId={task.assignedTo} showDetails={!isManagerView} />
                </TableCell>
                {!isManagerView && (
                  <TableCell>
                    {task.nextActionDate ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(task.nextActionDate, 'MMM dd, yyyy')}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <p className="text-sm text-muted-foreground">
                    {format(task.createdAt, 'MMM dd, yyyy')}
                  </p>
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
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Task
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
}
