import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Building2,
  LayoutDashboard,
  Users,
  UserCircle,
  ClipboardList,
  CheckSquare,
  Building,
  CalendarOff,
  BarChart3,
  Activity,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Megaphone,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  roles: ('admin' | 'manager' | 'staff')[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '', roles: ['admin', 'manager', 'staff'] },
  { label: 'Users', icon: Users, href: '/users', roles: ['admin'] },
  { label: 'Announcements', icon: Megaphone, href: '/announcements', roles: ['admin'] },
  { label: 'Leads', icon: ClipboardList, href: '/leads', roles: ['admin', 'manager', 'staff'] },
  { label: 'Tasks', icon: CheckSquare, href: '/tasks', roles: ['admin', 'manager', 'staff'] },
  { label: 'Projects', icon: Building, href: '/projects', roles: ['admin', 'manager', 'staff'] },
  { label: 'Leaves', icon: CalendarOff, href: '/leaves', roles: ['admin', 'manager', 'staff'] },
  { label: 'Reports', icon: BarChart3, href: '/reports', roles: ['admin', 'manager'] },
  { label: 'Activity', icon: Activity, href: '/activity', roles: ['admin'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const basePath = `/${user.role}`;
  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <aside 
      className={cn(
        "glass-sidebar h-screen flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to={basePath} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-sidebar-foreground animate-fade-in">
              PropertyCRM
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === `${basePath}${item.href}` || 
            (item.href === '' && location.pathname === basePath);
          
          return (
            <Link
              key={item.label}
              to={`${basePath}${item.href}`}
              className={cn(
                "nav-link",
                isActive && "nav-link-active",
                collapsed && "justify-center px-3"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent mb-3",
          collapsed && "justify-center"
        )}>
          <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center shrink-0">
            <UserCircle className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex-1 nav-link justify-center"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          
          {!collapsed && (
            <>
              <Link to={`${basePath}/settings`} className="nav-link flex-1 justify-center">
                <Settings className="w-5 h-5" />
              </Link>
              <button onClick={logout} className="nav-link flex-1 justify-center hover:text-destructive">
                <LogOut className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
