import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { MobileNavProvider } from '@/contexts/MobileNavContext';

interface DashboardLayoutProps {
  requiredRole: UserRole;
}

export default function DashboardLayout({ requiredRole }: DashboardLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== requiredRole) {
    return <Navigate to={`/${user?.role}`} replace />;
  }

  return (
    <MobileNavProvider value={{ mobileMenuOpen, setMobileMenuOpen }}>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Hidden on mobile, shown on lg+ */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto transition-transform duration-300 ease-in-out",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
        </div>

        <main className="flex-1 overflow-y-auto w-full">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </MobileNavProvider>
  );
}
