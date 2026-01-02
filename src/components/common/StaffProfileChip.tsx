import { User } from '@/types';
import { mockUsers } from '@/data/mockData';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin } from 'lucide-react';

interface StaffProfileChipProps {
  userId: string;
  showDetails?: boolean;
}

export default function StaffProfileChip({ userId, showDetails = true }: StaffProfileChipProps) {
  const user = mockUsers.find(u => u.id === userId);
  
  if (!user) {
    return <span className="text-muted-foreground text-sm">Unknown</span>;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-primary text-primary-foreground';
      case 'manager':
        return 'bg-info text-white';
      case 'staff':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const chipContent = (
    <div className="flex items-center gap-2">
      <Avatar className="h-7 w-7">
        <AvatarFallback className={`text-xs ${getRoleColor(user.role)}`}>
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium leading-none">{user.name}</span>
        <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
      </div>
    </div>
  );

  if (!showDetails) {
    return chipContent;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          {chipContent}
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className={`text-lg ${getRoleColor(user.role)}`}>
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">{user.name}</h4>
              <Badge variant="outline" className="capitalize mt-1">
                {user.role}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              <span>{user.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>{user.address}</span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Status: <span className={user.status === 'active' ? 'text-success' : 'text-destructive'}>{user.status}</span>
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
