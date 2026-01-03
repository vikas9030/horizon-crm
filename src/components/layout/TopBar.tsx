import { Bell, Search, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface TopBarProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export default function TopBar({ title, subtitle, showBackButton = true }: TopBarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we're on a dashboard (root page for each role)
  const isDashboard = ['/', '/admin', '/manager', '/staff'].includes(location.pathname);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className="h-16 md:h-20 bg-card border-b border-border px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2 md:gap-4 ml-10 lg:ml-0">
        {/* Back Button - show on non-dashboard pages */}
        {showBackButton && !isDashboard && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="hover:bg-muted h-8 w-8 md:h-10 md:w-10"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        )}
        
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-foreground truncate max-w-[180px] sm:max-w-none">{title}</h1>
          {subtitle && <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="w-48 lg:w-64 pl-10 h-10 input-field"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative h-8 w-8 md:h-10 md:w-10">
          <Bell className="w-4 h-4 md:w-5 md:h-5" />
          <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        <div className="hidden sm:flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-border">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm md:text-base">
            {user?.name.charAt(0)}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
