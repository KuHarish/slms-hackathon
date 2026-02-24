import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Crown, Users, Shield, BookOpen, Settings, Mail,
  Search, UserPlus, Trash2, Edit2, Check, X
} from 'lucide-react';
import { allStudents, librarianUser, adminUser, allBorrowRecords, books } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import type { User, UserRole } from '@/types/library';

// Combine all users for the admin panel
const allUsers: User[] = [adminUser, librarianUser, ...allStudents];

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('student');

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleCounts = {
    all: allUsers.length,
    admin: allUsers.filter(u => u.role === 'admin').length,
    librarian: allUsers.filter(u => u.role === 'librarian').length,
    student: allUsers.filter(u => u.role === 'student').length,
  };

  const totalBorrows = allBorrowRecords.length;
  const totalOverdue = allBorrowRecords.filter(r => r.status === 'overdue').length;
  const totalBooks = books.length;
  const totalAvailable = books.reduce((sum, b) => sum + b.availableCopies, 0);

  const stats = [
    { label: 'Total Users', value: allUsers.length, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Total Books', value: totalBooks, sub: `${totalAvailable} available`, icon: BookOpen, color: 'bg-accent/10 text-accent' },
    { label: 'Active Borrows', value: totalBorrows, sub: `${totalOverdue} overdue`, icon: Shield, color: 'bg-info/10 text-info' },
    { label: 'System Roles', value: 3, sub: 'admin · librarian · student', icon: Settings, color: 'bg-muted text-muted-foreground' },
  ];

  const handleStartEdit = (user: User) => {
    setEditingUser(user.id);
    setEditRole(user.role);
  };

  const handleSaveRole = (userId: string) => {
    // In a real app this would call an API to update the role in the user_roles table
    console.log(`[Mock] Would update user ${userId} role to: ${editRole}`);
    setEditingUser(null);
  };

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-destructive/10 text-destructive border-destructive/20',
    librarian: 'bg-accent/10 text-accent border-accent/20',
    student: 'bg-primary/10 text-primary border-primary/20',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
          <Crown className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-0.5">Manage users, roles, and system overview</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-5 shadow-card"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            {stat.sub && <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>}
          </motion.div>
        ))}
      </div>

      {/* User Management */}
      <section className="space-y-4">
        <h2 className="font-display text-xl text-foreground">User Management</h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users by name or email…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-card-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'admin', 'librarian', 'student'] as const).map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${
                  roleFilter === role
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {role} ({roleCounts[role]})
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Badges</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                        u.role === 'admin' ? 'bg-destructive/10 text-destructive' :
                        u.role === 'librarian' ? 'bg-accent/10 text-accent' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-sm text-card-foreground">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    {editingUser === u.id ? (
                      <select
                        value={editRole}
                        onChange={e => setEditRole(e.target.value as UserRole)}
                        className="text-xs rounded-md border border-input bg-background px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="student">Student</option>
                        <option value="librarian">Librarian</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border capitalize ${roleColors[u.role]}`}>
                        {u.role}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-card-foreground">{u.tokens}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {u.badges.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                      {u.badges.map(b => (
                        <span key={b.id} title={b.name} className="text-base">{b.icon}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      {editingUser === u.id ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleSaveRole(u.id)}>
                            <Check className="w-4 h-4 text-success" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingUser(null)}>
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleStartEdit(u)} title="Edit role">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <a href={`mailto:${u.email}`}>
                            <Button variant="ghost" size="sm" title="Send email">
                              <Mail className="w-4 h-4" />
                            </Button>
                          </a>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No users found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Security Note */}
        <div className="bg-muted/50 rounded-xl border border-border p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-card-foreground">Role Security Note</p>
            <p className="text-xs text-muted-foreground mt-1">
              In production, roles must be stored in a separate <code className="px-1 py-0.5 bg-muted rounded text-xs">user_roles</code> table 
              with server-side validation via a <code className="px-1 py-0.5 bg-muted rounded text-xs">SECURITY DEFINER</code> function. 
              Never rely on client-side role checks for access control.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
