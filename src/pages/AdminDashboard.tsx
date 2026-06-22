import { API_URL } from '@/config';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Crown, Users, Shield, BookOpen, Settings, Mail,
  Search, Trash2, Edit2, Check, X, PlusCircle, BookCopy, Loader2
} from 'lucide-react';
import AddBookForm from '@/components/admin/AddBookForm';
import EditBookModal from '@/components/admin/EditBookModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import type { User, UserRole, Book } from '@/types/library';

// Combine all users for the admin panel — replaced by live API data below

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('user');
  
  // ── Live data from MongoDB ────────────────────────────────────────
  const [users, setUsers] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  // App state & Tabs
  const [activeTab, setActiveTab] = useState<'users' | 'books'>('users');
  const [showAddBook, setShowAddBook] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoadingUsers(true);
    fetch(API_URL + '/auth/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
        setLoadingUsers(false);
      })
      .catch(() => setLoadingUsers(false));

    // Fetch books
    fetch(API_URL + '/books')
      .then(res => res.json())
      .then(data => {
        const mapped = Array.isArray(data) ? data.map((b: any) => ({
          ...b,
          id: b._id,
          availableCopies: b.availableCopies !== undefined ? b.availableCopies : b.available_copies,
          totalCopies: b.totalCopies !== undefined ? b.totalCopies : b.total_copies
        })) : [];
        setBooks(mapped);
      })
      .catch(console.error);

    // Fetch transactions
    fetch(API_URL + '/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setTransactions(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoadingData(false));

  }, [refreshTrigger]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleCounts = {
    all:   users.length,
    admin: users.filter(u => u.role === 'admin').length,
    user:  users.filter(u => u.role === 'user').length,
  };

  const filteredBooks = books.filter(b => 
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBorrows = transactions.filter(t => t.status === 'issued').length;
  const totalOverdue = transactions.filter(t => t.status === 'overdue').length;
  const totalBooks = books.length;
  const totalAvailable = books.reduce((sum, b) => sum + (b.availableCopies || 0), 0);

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, gradient: 'from-primary/10 to-primary/5 border-primary/20', iconBg: 'bg-primary/10 text-primary' },
    { label: 'Total Books', value: totalBooks, sub: `${totalAvailable} copies available`, icon: BookOpen, gradient: 'from-accent/10 to-accent/5 border-accent/20', iconBg: 'bg-accent/20 text-accent-foreground' },
    { label: 'Active Borrows', value: totalBorrows, sub: `${totalOverdue} overdue`, icon: Shield, gradient: 'from-info/10 to-info/5 border-info/20', iconBg: 'bg-info/10 text-info' },
    { label: 'System Roles', value: 2, sub: 'admin · user', icon: Settings, gradient: 'from-muted to-muted/50 border-border', iconBg: 'bg-muted text-muted-foreground' },
  ];

  const handleStartEdit = (user: any) => {
    setEditingUser(user._id);
    setEditRole(user.role);
  };

  const handleSaveRole = async (userId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/auth/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: editRole }),
      });
      const data = await res.json();
      if (res.ok) {
        // Update local state so the table refreshes instantly
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: data.role } : u));
      }
    } catch (err) {
      console.error('Failed to update role:', err);
    }
    setEditingUser(null);
  };

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-destructive/10 text-destructive border-destructive/20',
    user: 'bg-primary/10 text-primary border-primary/20',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
          <Crown className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-0.5">Manage users, roles, and system overview</p>
        </div>
      </div>

      {/* Stats — library summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' }}
            className={`relative bg-gradient-to-br ${stat.gradient} rounded-2xl border p-5 overflow-hidden`}
          >
            {/* Decorative background circle */}
            <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-current opacity-[0.04]" />
            <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
            {stat.sub && (
              <p className="text-xs text-muted-foreground/70 mt-0.5">{stat.sub}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-1">
        <button
          onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-5 py-3 font-medium text-sm transition-all duration-200 relative rounded-t-lg ${
            activeTab === 'users'
              ? 'text-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Users className="w-4 h-4" />
          Users
          {activeTab === 'users' && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => { setActiveTab('books'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-5 py-3 font-medium text-sm transition-all duration-200 relative rounded-t-lg ${
            activeTab === 'books'
              ? 'text-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <BookCopy className="w-4 h-4" />
          Books
          {activeTab === 'books' && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {activeTab === 'users' && (
      <section className="space-y-4">
        {/* User Management */}
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
            {(['all', 'admin', 'user'] as const).map(role => (
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
              {loadingUsers ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
                  </TableCell>
                </TableRow>
              ) : (
              <>
              {filteredUsers.map((u: any) => (
                <TableRow key={u._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                        u.role === 'admin' ? 'bg-destructive/10 text-destructive' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {u.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                      </div>
                      <span className="font-medium text-sm text-card-foreground">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    {editingUser === u._id ? (
                      <select
                        value={editRole}
                        onChange={e => setEditRole(e.target.value as UserRole)}
                        className="text-xs rounded-md border border-input bg-background px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border capitalize ${roleColors[u.role as UserRole]}`}>
                        {u.role}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-card-foreground">{u.tokens}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {(!u.badges || u.badges.length === 0) && <span className="text-xs text-muted-foreground">—</span>}
                      {(u.badges || []).map((b: any, i: number) => (
                        <span key={b.id || i} title={b.name} className="text-base">{b.icon}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      {editingUser === u._id ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleSaveRole(u._id)}>
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
              {!loadingUsers && filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No users found matching your filters.
                  </TableCell>
                </TableRow>
              )}
              </>
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
      )}

      {activeTab === 'books' && (
      <section className="space-y-4">
        {/* Books Management */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">Books Management</h2>
          <Button onClick={() => setShowAddBook(!showAddBook)} variant={showAddBook ? "secondary" : "default"} className="flex gap-2">
            {showAddBook ? <X className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            {showAddBook ? 'Close Form' : 'Add New Book'}
          </Button>
        </div>

        {/* Add Book Form Area */}
        {showAddBook && (
          <motion.div
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="overflow-hidden"
          >
            {/* Note: In a fully connected setup we would pass token={localStorage.getItem('token') || ''} */}
            <AddBookForm 
              onSuccess={() => {
                setShowAddBook(false);
                setRefreshTrigger(prev => prev + 1);
              }} 
              onCancel={() => setShowAddBook(false)} 
            />
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search books by title or author…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-card-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Books Table */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Available / Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium text-sm text-card-foreground">
                    <div className="flex items-center gap-3">
                      {b.coverUrl ? (
                         <img src={b.coverUrl} className="w-8 h-10 object-cover rounded shadow border border-border" alt={b.title} />
                      ) : (
                         <div className="w-8 h-10 rounded bg-muted flex items-center justify-center border border-border">
                           <BookOpen className="w-4 h-4 text-muted-foreground" />
                         </div>
                      )}
                      <span className="line-clamp-1">{b.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.author}</TableCell>
                  <TableCell>
                    <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium border border-border capitalize bg-muted/50">
                      {b.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className={b.availableCopies > 0 ? "text-success font-medium" : "text-destructive font-medium"}>
                      {b.availableCopies}
                    </span>
                    <span className="text-muted-foreground"> / {b.totalCopies}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setEditingBookId(b.id)} title="Edit Book">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredBooks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No books found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {editingBookId && (
          <EditBookModal
            book={books.find(b => b.id === editingBookId)!}
            onSuccess={() => {
              setEditingBookId(null);
              setRefreshTrigger(prev => prev + 1);
            }}
            onCancel={() => setEditingBookId(null)}
          />
        )}
      </section>
      )}
    </div>
  );
}
