import { useState, useMemo } from 'react';
import { Task, TaskStatus, Lead } from '@/types';
import { mockTasks, mockProjects, mockLeads } from '@/data/mockData';
import TaskStatusChip from './TaskStatusChip';
import TaskFormModal from './TaskFormModal';
import TaskExcelImportExport from './TaskExcelImportExport';
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
import { Search, Calendar, MoreHorizontal, Eye, Edit, Plus } from 'lucide-react';
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

interface TaskListProps {
  canEdit?: boolean;
  canCreate?: boolean;
  isManagerView?: boolean;
  isStaffView?: boolean;
  userId?: string;
}

export default function TaskList({ canEdit = true, canCreate = true, isManagerView = false, isStaffView = false, userId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = 
        task.lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.lead.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      
      const matchesProject = projectFilter === 'all' || task.assignedProject === projectFilter;
      
      // Date filter
      let matchesDate = true;
      if (dateRange.from && dateRange.to) {
        matchesDate = isWithinInterval(new Date(task.createdAt), {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to),
        });
      } else if (dateRange.from) {
        matchesDate = new Date(task.createdAt) >= startOfDay(dateRange.from);
      }
      
      // Role-based filtering: Staff can only see their assigned tasks
      let hasAccess = true;
      if (isStaffView && userId) {
        hasAccess = task.assignedTo === userId || task.assignedTo === '3'; // '3' is demo staff
      }
      
      return matchesSearch && matchesStatus && matchesProject && matchesDate && hasAccess;
    });
  }, [tasks, searchQuery, statusFilter, projectFilter, dateRange, isStaffView, userId]);

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date() } : t
    ));
    toast.success('Task status updated');
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleSaveTask = (updatedTask: Partial<Task>) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => 
        t.id === editingTask.id ? { ...t, ...updatedTask } : t
      ));
      toast.success('Task updated successfully');
    } else if (isCreating && updatedTask.lead) {
      const newTask: Task = {
        id: String(Date.now()),
        leadId: updatedTask.lead.id,
        lead: updatedTask.lead,
        status: updatedTask.status || 'pending',
        nextActionDate: updatedTask.nextActionDate,
        notes: updatedTask.notes || [],
        attachments: updatedTask.attachments || [],
        assignedTo: userId || '3',
        assignedProject: updatedTask.assignedProject,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTasks(prev => [newTask, ...prev]);
      toast.success('Task created successfully');
    }
    setIsFormOpen(false);
    setEditingTask(null);
    setIsCreating(false);
  };

  const handleAddTask = () => {
    setIsCreating(true);
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleImportTasks = (importedTasks: Partial<Task>[]) => {
    const newTasks: Task[] = importedTasks.map((taskData, index) => ({
      id: String(Date.now() + index),
      leadId: taskData.lead?.id || String(Date.now() + index),
      lead: taskData.lead as Lead,
      status: taskData.status || 'pending',
      nextActionDate: taskData.nextActionDate,
      notes: taskData.notes || [],
      attachments: taskData.attachments || [],
      assignedTo: userId || '3',
      assignedProject: taskData.assignedProject,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    setTasks(prev => [...newTasks, ...prev]);
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return '-';
    const project = mockProjects.find(p => p.id === projectId);
    return project ? project.name : '-';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-field w-full"
            />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
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

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Project" />
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
                <Button variant="outline" className="justify-start text-left font-normal w-full col-span-2 sm:col-span-1">
                  <Calendar className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate text-xs">
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd")
                      )
                    ) : (
                      "Date"
                    )}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={1}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {dateRange.from && (
              <Button variant="ghost" size="sm" onClick={() => setDateRange({})} className="col-span-2 sm:col-span-1">
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap justify-between">
          <TaskExcelImportExport onImport={handleImportTasks} />
          {canCreate && (
            <Button onClick={handleAddTask} className="btn-accent shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredTasks.map((task, index) => (
          <div 
            key={task.id} 
            className="glass-card rounded-xl p-4 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-foreground">{task.lead.name}</p>
                <p className="text-xs text-muted-foreground">{task.lead.phone}</p>
              </div>
              <TaskStatusChip status={task.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Project</p>
                <p className="font-medium">{getProjectName(task.assignedProject)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Next Action</p>
                <p className="font-medium">
                  {task.nextActionDate ? format(task.nextActionDate, 'MMM dd') : '-'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="w-3.5 h-3.5 mr-1" />
                View
              </Button>
              {canEdit && (
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditTask(task)}>
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="glass-card rounded-2xl overflow-hidden hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Lead Name</TableHead>
              {!isManagerView && <TableHead className="font-semibold">Contact</TableHead>}
              {!isManagerView && <TableHead className="font-semibold">Requirement</TableHead>}
              <TableHead className="font-semibold">Project</TableHead>
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
                  <p className="text-sm font-medium">{getProjectName(task.assignedProject)}</p>
                </TableCell>
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
                        <DropdownMenuItem onClick={() => handleEditTask(task)}>
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
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tasks found</p>
        </div>
      )}

      <TaskFormModal
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
          setIsCreating(false);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        isCreating={isCreating}
        availableLeads={mockLeads}
      />
    </div>
  );
}
