import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, UserRole } from '@/types/library';
import { currentUser, librarianUser, adminUser } from '@/data/mockData';

interface AuthContextType {
  user: User;
  switchRole: (role: UserRole) => void;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const usersByRole: Record<UserRole, User> = {
  student: currentUser,
  librarian: librarianUser,
  admin: adminUser,
};

const roleCycle: UserRole[] = ['student', 'librarian', 'admin'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(currentUser);

  const switchRole = (role: UserRole) => {
    setUser(usersByRole[role] || currentUser);
  };

  const nextRole = (): UserRole => {
    const idx = roleCycle.indexOf(user.role);
    return roleCycle[(idx + 1) % roleCycle.length];
  };

  const hasRole = (role: UserRole) => user.role === role || user.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, switchRole, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useNextRole(): UserRole {
  const { user } = useAuth();
  const idx = roleCycle.indexOf(user.role);
  return roleCycle[(idx + 1) % roleCycle.length];
}
