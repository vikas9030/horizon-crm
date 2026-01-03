import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@/types';
import { mockUsers, demoCredentials } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (module: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (userId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check credentials by userId
    const foundUser = mockUsers.find(u => u.userId === userId);
    
    if (!foundUser) {
      return { success: false, error: 'User ID not found' };
    }

    if (foundUser.password !== password) {
      return { success: false, error: 'Invalid password' };
    }

    if (foundUser.status !== 'active') {
      return { success: false, error: 'Account is inactive. Please contact admin.' };
    }

    setUser(foundUser);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const hasPermission = useCallback((module: string, action: string): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;

    const permission = user.permissions.find(p => p.module === module);
    return permission ? permission.actions.includes(action as any) : false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout, 
      hasPermission 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
