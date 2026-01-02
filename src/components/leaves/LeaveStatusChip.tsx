import { LeaveStatus } from '@/types';
import { cn } from '@/lib/utils';

interface LeaveStatusChipProps {
  status: LeaveStatus;
}

const statusConfig: Record<LeaveStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'status-pending' },
  approved: { label: 'Approved', className: 'status-interested' },
  rejected: { label: 'Rejected', className: 'status-not-interested' },
};

export default function LeaveStatusChip({ status }: LeaveStatusChipProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn('status-chip', config.className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
