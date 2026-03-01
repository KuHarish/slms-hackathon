import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, User, Users, Bell, Search,
  Menu, X, BookMarked, LogOut, Sun, Moon, Shield, ArrowLeftRight, Crown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const allNavItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['user', 'admin'] as const },
  { path: '/books', label: 'Catalog', icon: BookOpen, roles: ['user', 'admin'] as const },
  { path: '/community', label: 'Community', icon: Users, roles: ['user', 'admin'] as const },
  { path: '/profile', label: 'Profile', icon: User, roles: ['user', 'admin'] as const },
  { path: '/admin', label: 'Admin', icon: Crown, roles: ['admin'] as const },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  
  const navItems = allNavItems.filter(item => user && (item.roles as readonly string[]).includes(user.role));

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      fetch('http://localhost:3000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(console.error);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-lg text-sidebar-foreground leading-tight">Smart</h1>
              <p className="text-xs text-sidebar-foreground/60">Library</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.path === '/' && unreadCount > 0 && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-semibold text-sidebar-primary">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/50 capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar z-50 lg:hidden flex flex-col"
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg gradient-gold flex items-center justify-center">
                    <BookMarked className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-display text-sidebar-foreground">Library</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-sidebar-foreground/70">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-3 space-y-1">
                {navItems.map(item => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? 'bg-sidebar-accent text-sidebar-primary'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b border-border flex items-center px-4 lg:px-8 gap-4 bg-card">
          <button className="lg:hidden text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1" />

          <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowNotifs(!showNotifs)} 
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <h3 className="font-semibold text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-accent cursor-pointer hover:underline">Mark all read</span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet.</div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif._id || notif.id} className={`p-3 rounded-lg mb-1 flex items-start gap-3 transition-colors ${!notif.isRead ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-muted'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            notif.type === 'error' ? 'bg-destructive/10 text-destructive' :
                            notif.type === 'warning' ? 'bg-warning/10 text-warning' :
                            notif.type === 'success' ? 'bg-success/10 text-success' :
                            'bg-info/10 text-info'
                          }`}>
                            <Bell className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                          </div>
                          {!notif.isRead && <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/profile" className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-accent-foreground">
            {user.name.split(' ').map(n => n[0]).join('')}
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 lg:p-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
